import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, errorResponse, successResponse } from "@/lib/api";
import { JwtPayload } from "@/types";
import { promises as fs } from "fs";
import path from "path";

const ALLOWED_MIMES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
  "video/ogg"
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
      return errorResponse("حجم ملف الصوت كبير جداً. الحد الأقصى المسموح به هو 5 ميجابايت", 400);
    }

    // Validate MIME type
    if (!ALLOWED_MIMES.includes(file.type) && !file.name.endsWith(".mp3") && !file.name.endsWith(".wav") && !file.name.endsWith(".ogg")) {
      return errorResponse("نوع الملف غير مدعوم. الأنواع المدعومة هي: MP3, WAV, OGG", 400);
    }

    // Validate extension
    const originalExt = path.extname(file.name).toLowerCase();
    const safeExtensions = [".mp3", ".wav", ".ogg"];
    if (!safeExtensions.includes(originalExt)) {
      return errorResponse("امتداد ملف الصوت غير صالح. يرجى رفع ملف بصيغة MP3, WAV أو OGG", 400);
    }

    // Read bytes
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate secure filename
    const filename = `sound-${shopId}-${Date.now()}${originalExt}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "sounds");

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Fetch existing shop settings to clean up old custom sound if any
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { settings: true }
    });

    const settingsObj = shop?.settings ? (JSON.parse(JSON.stringify(shop.settings))) : {};
    const oldSoundUrl = settingsObj.notifications?.customSoundUrl;

    if (oldSoundUrl && oldSoundUrl.startsWith("/uploads/sounds/")) {
      const oldFilePath = path.join(process.cwd(), "public", oldSoundUrl);
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.warn("[SOUND CLEANUP WARN]", err);
      }
    }

    // Save the new file
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/sounds/${filename}`;

    // Update settings in database
    const updatedNotifications = {
      ...(settingsObj.notifications || {}),
      customSoundUrl: relativeUrl,
      selectedSound: "custom"
    };

    const newSettings = {
      ...settingsObj,
      notifications: updatedNotifications
    };

    await prisma.shop.update({
      where: { id: shopId },
      data: { settings: newSettings }
    });

    return successResponse({ soundUrl: relativeUrl }, "تم رفع نغمة التنبيه المخصصة بنجاح");
  } catch (error) {
    console.error("[UPLOAD SOUND ERROR]", error);
    return errorResponse("حدث خطأ أثناء رفع ملف الصوت", 500);
  }
});
