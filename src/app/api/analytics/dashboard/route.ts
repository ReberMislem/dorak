// ============================================
// دورك - Dashboard Analytics API
// GET /api/analytics/dashboard
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, withAuth } from "@/lib/api";
import { JwtPayload } from "@/types";
import { getShopDetailedStatus } from "@/lib/shop-status";

export const GET = withAuth(async (_req: NextRequest, user: JwtPayload) => {
  try {
    let shopId = user.shopId;

    if (!shopId) {
      const membership = await prisma.shopMember.findFirst({
        where: { userId: user.userId, isActive: true },
        select: { shopId: true },
      });
      shopId = membership?.shopId;
    }

    if (!shopId) return successResponse(null, "لا يوجد محل مرتبط بحسابك");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's stats
    const todayTickets = await prisma.ticket.findMany({
      where: { shopId, createdAt: { gte: today, lt: tomorrow } },
      select: { status: true, createdAt: true, completedAt: true, calledAt: true },
    });

    const totalToday = todayTickets.length;
    const completedToday = todayTickets.filter(
      (t: typeof todayTickets[number]) => t.status === "COMPLETED"
    ).length;
    const cancelledToday = todayTickets.filter(
      (t: typeof todayTickets[number]) => t.status === "CANCELLED"
    ).length;
    const currentWaiting = await prisma.ticket.count({
      where: {
        shopId,
        status: { in: ["WAITING", "CALLED", "SERVING"] },
      },
    });

    // Avg wait time (completed tickets with calledAt)
    const completedWithTime = todayTickets.filter(
      (t: typeof todayTickets[number]) => t.status === "COMPLETED" && t.calledAt
    );
    const avgWaitTime =
      completedWithTime.length > 0
        ? completedWithTime.reduce((sum: number, t: typeof completedWithTime[number]) => {
            const wait =
              (new Date(t.calledAt!).getTime() -
                new Date(t.createdAt).getTime()) /
              60000;
            return sum + wait;
          }, 0) / completedWithTime.length
        : 0;

    // Last 7 days stats
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const weeklyAnalytics = await prisma.dailyAnalytics.findMany({
      where: { shopId, date: { gte: sevenDaysAgo } },
      orderBy: { date: "asc" },
    });

    // Fill missing days
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const existing = weeklyAnalytics.find(
        (a: typeof weeklyAnalytics[number]) => a.date.toISOString().split("T")[0] === dateStr
      );
      weeklyData.push({
        date: dateStr,
        totalTickets: existing?.totalTickets || 0,
        completedTickets: existing?.completedTickets || 0,
        cancelledTickets: existing?.cancelledTickets || 0,
        avgWaitTime: existing?.avgWaitTime || 0,
      });
    }

    // Hourly distribution today
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: todayTickets.filter(
        (t: typeof todayTickets[number]) => new Date(t.createdAt).getHours() === hour
      ).length,
    }));

    // Queue stats
    const queues = await prisma.queue.findMany({
      where: { shopId, isActive: true },
      include: {
        _count: {
          select: {
            tickets: {
              where: { status: { in: ["WAITING", "CALLED", "SERVING"] } },
            },
          },
        },
      },
    });

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        breakTimes: { where: { isActive: true } }
      }
    });

    const shopDetailedStatus = shop ? getShopDetailedStatus(shop, totalToday) : null;

    return successResponse({
      today: {
        totalTickets: totalToday,
        currentWaiting,
        completedTickets: completedToday,
        cancelledTickets: cancelledToday,
        avgWaitTime: Math.round(avgWaitTime),
        completionRate: totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0,
      },
      shopStatus: shopDetailedStatus,
      weekly: weeklyData,
      hourly: hourlyData,
      queues: queues.map((q: any) => ({
        id: q.id,
        name: q.name,
        nameAr: q.nameAr,
        status: q.status,
        waitingCount: q._count.tickets,
        avgServiceTime: q.avgServiceTime,
      })),
    });
  } catch (error) {
    console.error("[ANALYTICS ERROR]", error);
    return errorResponse("حدث خطأ في الخادم", 500);
  }
});
