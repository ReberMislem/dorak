import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  validationError,
  checkRateLimit,
  getClientIp,
  generateToken,
} from "@/lib/api";
import { joinQueueSchema } from "@/lib/validations";
import { getShopDetailedStatus } from "@/lib/shop-status";

type SocketServerLike = {
  to: (room: string) => {
    emit: (event: string, payload: unknown) => void;
  };
};

function getSocketServer(): SocketServerLike | undefined {
  return (globalThis as typeof globalThis & { io?: SocketServerLike }).io;
}

function isCapacityFullError(error: unknown): boolean {
  return error instanceof Error && error.message === "CAPACITY_FULL";
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  if (!checkRateLimit(`ticket:${ip}`, 10, 60 * 60 * 1000)) {
    return errorResponse("تجاوزت عدد مرات الانضمام المسموحة. حاول لاحقاً", 429);
  }

  try {
    const body = await req.json();
    console.log("[TICKETS API] Received body:", JSON.stringify(body));
    const validation = joinQueueSchema.safeParse(body);

    if (!validation.success) {
      console.log("[TICKETS API] Validation failed:", JSON.stringify(validation.error.format()));
      return validationError(validation.error);
    }

    const { queueId, customerName, customerPhone } = validation.data;

    const queue = await prisma.queue.findUnique({
      where: { id: queueId },
      include: { 
        shop: { 
          include: { 
            breakTimes: { where: { isActive: true } }
          } 
        } 
      },
    });

    if (!queue || !queue.isActive) {
      return errorResponse("الطابور غير موجود", 404);
    }

    if (!queue.shop.isActive) {
      return errorResponse("هذا المحل غير متاح حالياً", 400);
    }

    // Check Detailed Shop Status (Working Hours, Breaks, Limits)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyTicketCount = await prisma.ticket.count({
      where: { 
        shopId: queue.shopId,
        createdAt: { gte: today }
      }
    });

    const shopStatus = getShopDetailedStatus(queue.shop, dailyTicketCount);
    if (!shopStatus.canRegister) {
      return errorResponse(shopStatus.message, 400);
    }

    if (queue.status === "CLOSED") {
      return errorResponse("الطابور مغلق حالياً", 400);
    }

    if (queue.status === "PAUSED") {
      return errorResponse("الطابور متوقف مؤقتاً", 400);
    }

    const ticket = await prisma.$transaction(async (tx) => {
      const waitingCount = await tx.ticket.count({
        where: { queueId, status: { in: ["WAITING", "CALLED", "SERVING"] } },
      });

      if (waitingCount >= queue.maxCapacity) {
        throw new Error("CAPACITY_FULL");
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastTicket = await tx.ticket.findFirst({
        where: { queueId, createdAt: { gte: today } },
        orderBy: { ticketNumber: "desc" },
      });

      const ticketNumber = (lastTicket?.ticketNumber || 0) + 1;
      const position = waitingCount + 1;
      const estimatedWait = waitingCount * queue.avgServiceTime;

      return tx.ticket.create({
        data: {
          shopId: queue.shopId,
          queueId,
          ticketNumber,
          customerName,
          customerPhone,
          customerToken: generateToken(32),
          status: "WAITING",
          position,
          estimatedWait,
          ipAddress: ip,
          deviceInfo: req.headers.get("user-agent") || undefined,
        },
      });
    });

    const io = getSocketServer();
    if (io) {
      io.to(`queue:${queueId}`).emit("ticket:created", {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        position: ticket.position,
        status: ticket.status,
      });
    }

    return successResponse(
      {
        ticket: {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          customerToken: ticket.customerToken,
          position: ticket.position,
          estimatedWait: ticket.estimatedWait,
          status: ticket.status,
          queue: {
            id: queue.id,
            name: queue.name,
            nameAr: queue.nameAr,
            avgServiceTime: queue.avgServiceTime,
          },
          shop: {
            id: queue.shop.id,
            name: queue.shop.name,
          },
        },
      },
      `تم انضمامك للطابور بنجاح. رقمك هو ${ticket.ticketNumber}`,
      201
    );
  } catch (error) {
    if (isCapacityFullError(error)) {
      return errorResponse("الطابور ممتلئ. يرجى المحاولة لاحقاً", 400);
    }

    console.error("[JOIN QUEUE ERROR]", error);
    return errorResponse("حدث خطأ في الخادم", 500);
  }
}
