// ============================================
// دورك - Queues API
// GET/POST /api/queues
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  validationError,
  withAuth,
} from "@/lib/api";
import { createQueueSchema } from "@/lib/validations";
import { JwtPayload } from "@/types";

// GET /api/queues - Get all queues for current shop
export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    const shopId = user.shopId;
    if (!shopId) return successResponse([]);

    const { searchParams } = new URL(req.url);
    const includeTickets = searchParams.get("includeTickets") === "true";

    const queues = await prisma.queue.findMany({
      where: { shopId, isActive: true },
      include: {
        branch: { select: { id: true, name: true } },
        _count: {
          select: {
            tickets: { where: { status: { in: ["WAITING", "CALLED", "SERVING"] } } },
          },
        },
        ...(includeTickets && {
          tickets: {
            where: { status: { in: ["WAITING", "CALLED", "SERVING"] } },
            orderBy: { ticketNumber: "asc" },
            select: {
              id: true,
              ticketNumber: true,
              customerName: true,
              status: true,
              position: true,
              createdAt: true,
              calledAt: true,
            },
          },
        }),
      },
      orderBy: { createdAt: "asc" },
    });

    const queuesWithStats = queues.map((q: typeof queues[number]) => ({
      ...q,
      waitingCount: q._count.tickets,
      estimatedWait: q._count.tickets * q.avgServiceTime,
    }));

    return successResponse(queuesWithStats);
  } catch (error) {
    console.error("[GET QUEUES ERROR]", error);
    return errorResponse("حدث خطأ في الخادم", 500);
  }
});

// POST /api/queues - Create new queue
export const POST = withAuth(
  async (req: NextRequest, user: JwtPayload) => {
    try {
      const shopId = user.shopId;
      if (!shopId) return errorResponse("لا توجد محل مرتبط بحسابك", 400);

      // Check subscription limits
      const subscription = await prisma.subscription.findUnique({
        where: { shopId },
      });

      const existingQueues = await prisma.queue.count({
        where: { shopId, isActive: true },
      });

      if (subscription && existingQueues >= subscription.maxQueues) {
        return errorResponse(
          `لقد وصلت للحد الأقصى للطوابير في خطتك (${subscription.maxQueues}). يرجى ترقية الاشتراك`,
          403
        );
      }

      const body = await req.json();
      const validation = createQueueSchema.safeParse(body);

      if (!validation.success) {
        return validationError(validation.error);
      }

      const queue = await prisma.queue.create({
        data: {
          ...validation.data,
          shopId,
        },
      });

      return successResponse(queue, "تم إنشاء الطابور بنجاح", 201);
    } catch (error) {
      console.error("[CREATE QUEUE ERROR]", error);
      return errorResponse("حدث خطأ في الخادم", 500);
    }
  },
  ["SHOP_OWNER", "SHOP_STAFF"]
);
