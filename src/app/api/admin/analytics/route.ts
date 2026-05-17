import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api";

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const [
      totalShops,
      activeSubscriptions,
      trialSubscriptions,
      expiredSubscriptions,
      totalRevenue,
      popularPlans,
    ] = await Promise.all([
      prisma.shop.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.count({ where: { status: "TRIAL" } }),
      prisma.subscription.count({ where: { status: "EXPIRED" } }),
      // Calculate total revenue from active subscriptions linked to plans
      prisma.subscription.findMany({
        where: { status: "ACTIVE", planId: { not: null } },
        include: { planModel: { select: { finalPrice: true } } },
      }),
      prisma.plan.findMany({
        where: { isActive: true },
        select: { name: true, _count: { select: { subscriptions: true } } },
        orderBy: { subscriptions: { _count: "desc" } },
        take: 5,
      }),
    ]);

    const revenue = (totalRevenue as any[]).reduce((sum, sub) => sum + (sub.planModel?.finalPrice || 0), 0);

    return successResponse({
      totalShops,
      subscriptions: {
        active: activeSubscriptions,
        trial: trialSubscriptions,
        expired: expiredSubscriptions,
      },
      revenue,
      popularPlans: popularPlans.map(p => ({
        name: p.name,
        count: p._count.subscriptions,
      })),
    });
  } catch (err) {
    console.error("[ADMIN ANALYTICS ERROR]", err);
    return errorResponse("فشل في جلب الإحصائيات", 500);
  }
}, ["SUPER_ADMIN"]);
