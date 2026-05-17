// ============================================
// دورك - QR Code Scan API (Public)
// GET /api/qr/[code]
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
import { getShopDetailedStatus } from "@/lib/shop-status";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    console.log(`[QR API] Scanning code: ${code}`);

    const qrCode = await prisma.qrCode.findUnique({
      where: { code },
      include: {
        shop: {
          include: {
            breakTimes: { where: { isActive: true } }
          }
        },
        queue: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            status: true,
            avgServiceTime: true,
            maxCapacity: true,
            _count: {
              select: {
                tickets: {
                  where: { status: { in: ["WAITING", "CALLED", "SERVING"] } },
                },
              },
            },
          },
        },
      },
    });

    if (!qrCode || !qrCode.isActive) {
      console.log(`[QR API] Code not found or inactive: ${code} — attempting queue-id fallback`);

      // Fallback: some admin UIs generate QR links from the first N chars of a queue id
      // (e.g. client-side generated URLs). Try to find a queue whose id starts with the scanned code.
      const queueFallback = await prisma.queue.findFirst({
        where: { id: { startsWith: code } },
        include: { shop: { include: { breakTimes: { where: { isActive: true } } } } },
      });

      if (queueFallback) {
        if (!queueFallback.shop?.isActive) {
          return errorResponse("هذا المحل غير متاح", 400);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dailyTicketCount = await prisma.ticket.count({
          where: { shopId: queueFallback.shopId, createdAt: { gte: today } },
        });

        const shopDetailedStatus = getShopDetailedStatus(queueFallback.shop, dailyTicketCount);

        // Count waiting tickets for the queue
        const waitingCount = await prisma.ticket.count({
          where: { queueId: queueFallback.id, status: { in: ["WAITING", "CALLED", "SERVING"] } },
        });

        console.log(`[QR API] Fallback success. Shop: ${queueFallback.shop.name}, Queue: ${queueFallback.name}`);

        return successResponse({
          shop: {
            id: queueFallback.shop.id,
            name: queueFallback.shop.name,
            nameAr: queueFallback.shop.nameAr,
            category: queueFallback.shop.category,
            logo: queueFallback.shop.logo,
            address: queueFallback.shop.address,
            timezone: queueFallback.shop.timezone,
            openTime: queueFallback.shop.openTime,
            closeTime: queueFallback.shop.closeTime,
            registrationEndTime: queueFallback.shop.registrationEndTime,
            dailyQueueLimit: queueFallback.shop.dailyQueueLimit,
          },
          shopStatus: shopDetailedStatus,
          queue: {
            id: queueFallback.id,
            name: queueFallback.name,
            nameAr: queueFallback.nameAr,
            status: queueFallback.status,
            avgServiceTime: queueFallback.avgServiceTime,
            maxCapacity: queueFallback.maxCapacity,
            waitingCount,
            estimatedWait: waitingCount * (queueFallback.avgServiceTime || 15),
            isFull: waitingCount >= (queueFallback.maxCapacity || 100),
          },
          qrCode: { code },
        });
      }

      console.log(`[QR API] Code not found and no fallback matched: ${code}`);
      return errorResponse("رمز QR غير صالح", 404);
    }

    if (!qrCode.shop.isActive) {
      return errorResponse("هذا المحل غير متاح", 400);
    }

    // Get current ticket count for the shop today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyTicketCount = await prisma.ticket.count({
      where: { 
        shopId: qrCode.shopId,
        createdAt: { gte: today }
      }
    });

    const shopDetailedStatus = getShopDetailedStatus(qrCode.shop, dailyTicketCount);

    // Increment scan count
    await prisma.qrCode.update({
      where: { id: qrCode.id },
      data: { scanCount: { increment: 1 } },
    });

    const waitingCount = qrCode.queue?._count.tickets || 0;
    console.log(`[QR API] Success! Shop: ${qrCode.shop.name}, Queue: ${qrCode.queue?.name}`);

    return successResponse({
      shop: {
        id: qrCode.shop.id,
        name: qrCode.shop.name,
        nameAr: qrCode.shop.nameAr,
        category: qrCode.shop.category,
        logo: qrCode.shop.logo,
        address: qrCode.shop.address,
        timezone: qrCode.shop.timezone,
        openTime: qrCode.shop.openTime,
        closeTime: qrCode.shop.closeTime,
        registrationEndTime: qrCode.shop.registrationEndTime,
        dailyQueueLimit: qrCode.shop.dailyQueueLimit,
      },
      shopStatus: shopDetailedStatus,
      queue: qrCode.queue
        ? {
            ...qrCode.queue,
            waitingCount,
            estimatedWait: waitingCount * (qrCode.queue.avgServiceTime || 15),
            isFull: waitingCount >= (qrCode.queue.maxCapacity || 100),
          }
        : null,
      qrCode: { code: qrCode.code },
    });
  } catch (error) {
    console.error("[QR SCAN ERROR]", error);
    return errorResponse("حدث خطأ في الخادم", 500);
  }
}
