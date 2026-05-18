import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api";
import { JwtPayload } from "@/types";
import { promises as fs } from "fs";
import path from "path";

// Allowed MIME types for avatars
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const POST = withAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return errorResponse("لم يتم تحديد أي ملف للرفع", 400);
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse("حجم الملف كبير جداً. الحد الأقصى المسموح به هو 2 ميجابايت", 400);
    }

    // Validate MIME type
    if (!ALLOWED_MIMES.includes(file.type)) {
      return errorResponse("نوع الملف غير مدعوم. الأنواع المدعومة هي: PNG, JPG, JPEG, WEBP", 400);
    }

    // Validate file extension
    const originalExt = path.extname(file.name).toLowerCase();
    const safeExtensions = [".png", ".jpg", ".jpeg", ".webp"];
    if (!safeExtensions.includes(originalExt)) {
      return errorResponse("امتداد الملف غير صالح", 400);
    }

    // Read file bytes
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate secure filename
    const filename = `avatar-${user.userId}-${Date.now()}${originalExt}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");

    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Fetch existing user to delete their old avatar from disk
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { avatar: true }
    });

    if (dbUser?.avatar && dbUser.avatar.startsWith("/uploads/avatars/")) {
      const oldFilePath = path.join(process.cwd(), "public", dbUser.avatar);
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.warn("[AVATAR CLEANUP WARN]", err);
      }
    }

    // Save the new file
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/avatars/${filename}`;

    // Update database
    await prisma.user.update({
      where: { id: user.userId },
      data: { avatar: relativeUrl }
    });

    return successResponse({ avatarUrl: relativeUrl }, "تم رفع صورة البروفايل بنجاح");
  } catch (error) {
    console.error("[UPLOAD AVATAR ERROR]", error);
    return errorResponse("حدث خطأ أثناء رفع الصورة", 500);
  }
});
