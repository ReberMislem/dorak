import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, errorResponse, successResponse } from "@/lib/api";
import { JwtPayload } from "@/types";
import { promises as fs } from "fs";
import path from "path";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

export const POST = withAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const shopId = formData.get("shopId") as string | null;

    if (!shopId) {
      return errorResponse("معرّف المحل مطلوب", 400);
    }

    // Check ownership/permissions
    const membership = await prisma.shopMember.findFirst({
      where: { shopId, userId: user.userId }
    });

    if (!membership || (membership.role !== "SHOP_OWNER" && user.role !== "SUPER_ADMIN")) {
      return errorResponse("غير مصرح لك بتعديل بيانات هذا المحل", 403);
    }

    if (!file) {
      return errorResponse("لم يتم تحديد أي ملف للرفع", 400);
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse("حجم الملف كبير جداً. الحد الأقصى المسموح به هو 3 ميجابايت", 400);
    }

    // Validate MIME type
    if (!ALLOWED_MIMES.includes(file.type)) {
      return errorResponse("نوع الملف غير مدعوم. الأنواع المدعومة هي: PNG, JPG, JPEG, WEBP", 400);
    }

    // Validate extension
    const originalExt = path.extname(file.name).toLowerCase();
    const safeExtensions = [".png", ".jpg", ".jpeg", ".webp"];
    if (!safeExtensions.includes(originalExt)) {
      return errorResponse("امتداد الملف غير صالح", 400);
    }

    // Read bytes
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate secure filename
    const filename = `logo-${shopId}-${Date.now()}${originalExt}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Fetch existing shop logo to delete old one
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { logo: true }
    });

    if (shop?.logo && shop.logo.startsWith("/uploads/logos/")) {
      const oldFilePath = path.join(process.cwd(), "public", shop.logo);
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.warn("[LOGO CLEANUP WARN]", err);
      }
    }

    // Write file
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/logos/${filename}`;

    // Update database
    await prisma.shop.update({
      where: { id: shopId },
      data: { logo: relativeUrl }
    });

    return successResponse({ logoUrl: relativeUrl }, "تم رفع لوغو المحل بنجاح");
  } catch (error) {
    console.error("[UPLOAD LOGO ERROR]", error);
    return errorResponse("حدث خطأ أثناء رفع لوغو المحل", 500);
  }
});
