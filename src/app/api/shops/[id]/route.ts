import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse, validationError } from "@/lib/api";
import { updateShopSchema } from "@/lib/validations";
import { JwtPayload } from "@/types";

export const PATCH = withAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    const urlParts = req.nextUrl.pathname.split('/');
    const shopId = urlParts[urlParts.length - 1];
    
    if (!shopId) return errorResponse('معرف المحل مطلوب', 400);

    // Check ownership
    const membership = await prisma.shopMember.findFirst({
      where: { shopId, userId: user.userId }
    });

    if (!membership || (membership.role !== 'SHOP_OWNER' && user.role !== 'SUPER_ADMIN')) {
      return errorResponse('غير مسموح. يجب أن تكون مالك المحل لتعديل الإعدادات', 403);
    }

    const body = await req.json();
    const validation = updateShopSchema.safeParse(body);

    if (!validation.success) {
      return validationError(validation.error);
    }

    const { 
      name, nameAr, category, description, phone, email, address, city,
      openTime, closeTime, registrationStartTime, registrationEndTime,
      dailyQueueLimit, autoResetEnabled, currentStatus, workingDays,
      settings,
    } = validation.data;
    
    // Manual handling of breakTimes since it's a nested relation
    const { breakTimes } = body;

    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        name,
        nameAr,
        category,
        description,
        phone,
        email,
        address,
        city,
        openTime,
        closeTime,
        registrationStartTime,
        registrationEndTime,
        dailyQueueLimit,
        autoResetEnabled,
        currentStatus,
        workingDays,
        settings,
      }
    });

    // Handle BreakTimes if provided
    if (Array.isArray(breakTimes)) {
      await prisma.$transaction([
        prisma.breakTime.deleteMany({ where: { shopId } }),
        ...(breakTimes.length > 0 ? [
          prisma.breakTime.createMany({
            data: breakTimes.map((b: any) => ({
              shopId,
              title: b.title,
              startTime: b.startTime,
              endTime: b.endTime,
              isActive: b.isActive ?? true
            }))
          })
        ] : [])
      ]);
    }

    return successResponse(updatedShop, 'تم تحديث إعدادات المحل بنجاح');
  } catch (error) {
    console.error("[UPDATE SHOP ERROR]", error);
    return errorResponse("حدث خطأ أثناء تحديث إعدادات المحل", 500);
  }
});
