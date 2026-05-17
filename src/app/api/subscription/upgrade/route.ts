import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api";
import { SUBSCRIPTION_PLANS } from "@/constants";

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const shopId = user.shopId;
    if (!shopId) return errorResponse("لا توجد محل مرتبط بحسابك", 400);

    const body = await req.json();
    const planId = (body?.planId || "STARTER").toString();
    const interval = (body?.interval || 'MONTH').toString(); // 'MONTH' | '6MONTH' | 'YEAR'
    const promoCode = (body?.promoCode || '').toString().trim();

    // Try to find a Plan record first
    const plan = await (prisma as any).plan.findUnique({ where: { slug: planId } });
    if (!plan) return errorResponse("الخطة المحددة غير موجودة", 404);

    // Calculate duration
    const now = new Date();
    let monthsToAdd = 1;
    if (interval === '6MONTH') monthsToAdd = 6;
    if (interval === 'YEAR') monthsToAdd = 12;
    
    // If there is an existing active subscription, extend it from its current end date
    const existing = await (prisma as any).subscription.findUnique({ where: { shopId } });
    let startDate = now;
    if (existing && existing.endDate && existing.endDate > now && existing.status === 'ACTIVE') {
      startDate = existing.endDate;
    }
    
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + monthsToAdd);

    // Apply promotion if provided
    let discount = 0;
    if (promoCode) {
      const promo = await (prisma as any).promotion.findUnique({ where: { code: promoCode } });
      if (promo && promo.startAt <= now && promo.endAt >= now && (!promo.maxUses || promo.uses < promo.maxUses) && (!promo.shopId || promo.shopId === shopId)) {
        discount = promo.discountPercent || 0;
        await (prisma as any).promotion.update({ where: { code: promoCode }, data: { uses: { increment: 1 } } });
      }
    }

    // Features from plan
    const features = plan.features as any;
    const maxQueues = features?.maxQueues ?? 1;
    const maxStaff = features?.maxStaff ?? 2;

    const updated = await (prisma as any).subscription.upsert({
      where: { shopId },
      update: {
        planId: plan.id,
        status: "ACTIVE",
        maxQueues,
        maxStaff,
        endDate: endDate,
        updatedAt: now,
      },
      create: {
        shopId,
        planId: plan.id,
        status: "ACTIVE",
        maxQueues,
        maxStaff,
        endDate: endDate,
      },
    });

    return successResponse({ 
      subscription: updated, 
      price: Math.max(0, Math.round(plan.price * (1 - discount / 100))), 
      discount 
    }, "تم ترقية الاشتراك بنجاح");
  } catch (err) {
    console.error("[SUBSCRIPTION UPGRADE ERROR]", err);
    return errorResponse("حدث خطأ أثناء ترقية الاشتراك", 500);
  }
}, ["SHOP_OWNER"]);
