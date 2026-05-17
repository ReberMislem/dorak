import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse, validationError } from "@/lib/api";
import { z } from "zod";
import bcrypt from "bcryptjs";

const addStaffSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  phone: z.string().optional(),
});

// GET /api/staff - List all staff for the current shop
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const shopId = user.shopId;
    if (!shopId) return errorResponse("لا يوجد محل مرتبط بهذا الحساب", 400);

    const staff = await prisma.shopMember.findMany({
      where: { shopId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            isActive: true,
            lastLoginAt: true,
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    return successResponse(staff);
  } catch (err) {
    console.error("[GET STAFF ERROR]", err);
    return errorResponse("فشل في جلب قائمة الموظفين", 500);
  }
}, ["SHOP_OWNER"]);

// POST /api/staff - Add a new staff member
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const shopId = user.shopId;
    if (!shopId) return errorResponse("لا يوجد محل مرتبط بهذا الحساب", 400);

    // 1. Check subscription limits
    const subscription = await prisma.subscription.findUnique({
      where: { shopId },
    });

    const currentStaffCount = await prisma.shopMember.count({
      where: { shopId },
    });

    const maxStaff = subscription?.maxStaff ?? 2; // Default to 2 if no subscription

    if (currentStaffCount >= maxStaff) {
      return errorResponse(`لقد وصلت للحد الأقصى للموظفين في خطتك (${maxStaff}). يرجى ترقية الاشتراك لإضافة المزيد.`, 403);
    }

    // 2. Validate input
    const body = await req.json();
    const result = addStaffSchema.safeParse(body);
    if (!result.success) return validationError(result.error);

    const { name, email, password, phone } = result.data;

    // 3. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return errorResponse("هذا البريد الإلكتروني مسجل مسبقاً", 400);

    // 4. Create User and ShopMember in a transaction
    const hashedPassword = await bcrypt.hash(password, 10);

    const newMember = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role: "SHOP_STAFF",
        },
      });

      return await tx.shopMember.create({
        data: {
          shopId,
          userId: newUser.id,
          role: "SHOP_STAFF",
        },
        include: { user: true },
      });
    });

    return successResponse(newMember, "تم إضافة الموظف بنجاح", 201);
  } catch (err) {
    console.error("[ADD STAFF ERROR]", err);
    return errorResponse("حدث خطأ أثناء إضافة الموظف", 500);
  }
}, ["SHOP_OWNER"]);
