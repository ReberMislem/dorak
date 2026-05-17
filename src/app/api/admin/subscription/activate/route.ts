import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api";

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    if (user.role !== 'SUPER_ADMIN') return errorResponse('غير مسموح', 403);

    const body = await req.json();
    const { shopId, planSlug, planId, interval } = body;
    if (!shopId) return errorResponse('shopId مطلوب', 400);

    const plan = planId
      ? await (prisma as any).plan.findUnique({ where: { id: planId } })
      : await (prisma as any).plan.findUnique({ where: { slug: planSlug } });

    if (!plan) return errorResponse('الخطة غير موجودة', 404);

    const now = new Date();
    let endDate = new Date(now);
    
    if (plan.billingCycle === 'MONTHLY') endDate.setMonth(endDate.getMonth() + 1);
    else if (plan.billingCycle === 'YEARLY') endDate.setFullYear(endDate.getFullYear() + 1);

    const updated = await prisma.subscription.upsert({
      where: { shopId },
      update: {
        planId: plan.id,
        status: 'ACTIVE',
        startDate: now,
        endDate,
        isTrial: false,
        updatedAt: now,
      },
      create: {
        shopId,
        planId: plan.id,
        status: 'ACTIVE',
        startDate: now,
        endDate,
        isTrial: false,
      },
    });

    return successResponse(updated, 'تم تفعيل الاشتراك بنجاح');
  } catch (err) {
    console.error('[ADMIN ACTIVATE SUBSCRIPTION]', err);
    return errorResponse('فشل في تفعيل الاشتراك', 500);
  }
}, ['SUPER_ADMIN']);
