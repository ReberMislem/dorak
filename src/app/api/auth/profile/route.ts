import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api";
import { JwtPayload } from "@/types";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(100),
  email: z.string().email("البريد الإلكتروني غير صالح").max(255),
  phone: z.string().optional().nullable(),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").max(100).optional().or(z.literal("")),
});

export const PATCH = withAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    const body = await req.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "بيانات غير صالحة";
      return errorResponse(firstError, 400);
    }

    const { name, email, phone, password } = validation.data;

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: user.userId }
      }
    });

    if (existingUser) {
      return errorResponse("البريد الإلكتروني مستخدم بالفعل من قبل حساب آخر", 400);
    }

    const updateData: any = {
      name,
      email,
      phone
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true
      }
    });

    return successResponse(updatedUser, "تم تحديث الملف الشخصي بنجاح");
  } catch (error) {
    console.error("[UPDATE PROFILE ERROR]", error);
    return errorResponse("حدث خطأ أثناء تحديث الملف الشخصي", 500);
  }
});
