// ============================================
// دورك - Call Next Ticket API
// POST /api/queues/[id]/call-next
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, withAuth } from "@/lib/api";
import { JwtPayload } from "@/types";

type SocketServerLike = {
  to: (room: string) => {
    emit: (event: string, payload: unknown) => void;
  };
};

function getSocketServer(): SocketServerLike | undefined {
  return (globalThis as typeof globalThis & { io?: SocketServerLike }).io;
}

export const POST = withAuth(
  async (req: NextRequest, user: JwtPayload) => {
    try {
      const url = new URL(req.url);
      const id = url.pathname.split("/").at(-2);

      if (!id) return errorResponse("معرّف الطابور مفقود", 400);

      const queue = await prisma.queue.findFirst({
        where: { id, shopId: user.shopId },
      });

      if (!queue) return errorResponse("الطابور غير موجود", 404);
      if (queue.status !== "OPEN") {
        return errorResponse("الطابور غير مفتوح", 400);
      }

      // Use a transaction for atomic updates
      const result = await prisma.$transaction(async (tx) => {
        // Complete currently serving ticket
        await tx.ticket.updateMany({
          where: { queueId: id, status: "SERVING" },
          data: { status: "COMPLETED", completedAt: new Date() },
        });

        // Complete called ticket if still not serving
        await tx.ticket.updateMany({
          where: { queueId: id, status: "CALLED" },
          data: { status: "NO_SHOW" },
        });

        // Get next waiting ticket
        const nextTicket = await tx.ticket.findFirst({
          where: { queueId: id, status: "WAITING" },
          orderBy: { ticketNumber: "asc" },
        });

        if (!nextTicket) return null;

        // Update to called
        const calledTicket = await tx.ticket.update({
          where: { id: nextTicket.id },
          data: { status: "CALLED", calledAt: new Date(), position: 0 },
        });

        // Update queue currentNumber
        await tx.queue.update({
          where: { id },
          data: { currentNumber: calledTicket.ticketNumber },
        });

        // Get remaining waiting tickets to update positions
        const remaining = await tx.ticket.findMany({
          where: { queueId: id, status: "WAITING" },
          orderBy: { ticketNumber: "asc" },
        });

        // Atomic position updates
        for (let i = 0; i < remaining.length; i++) {
          await tx.ticket.update({
            where: { id: remaining[i].id },
            data: { position: i + 1 },
          });
        }

        return { calledTicket, remaining };
      });

      if (!result) {
        return successResponse(null, "لا يوجد عملاء في الطابور");
      }

      // Update daily analytics (async)
      updateAnalytics(queue.shopId).catch(console.error);

      // Broadcast Socket.io events
      const io = getSocketServer();
      if (io) {
        // Notify the called ticket
        io.to(`queue:${id}`).emit("ticket:called", {
          id: result.calledTicket.id,
          ticketNumber: result.calledTicket.ticketNumber,
        });

        // Notify all waiting tickets about position changes
        result.remaining.forEach((ticket, index) => {
          io.to(`queue:${id}`).emit("position:updated", {
            ticketId: ticket.id,
            position: index + 1,
          });
        });
      }

      return successResponse(result.calledTicket, `تم استدعاء رقم ${result.calledTicket.ticketNumber}`);
    } catch (error) {
      console.error("[CALL NEXT ERROR]", error);
      return errorResponse("حدث خطأ في الخادم", 500);
    }

  },
  ["SHOP_OWNER", "SHOP_STAFF"]
);



async function updateAnalytics(shopId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = await prisma.ticket.groupBy({
    by: ["status"],
    where: {
      shopId,
      createdAt: { gte: today },
    },
    _count: { status: true },
  });

  const totalTickets = stats.reduce((sum: number, s: typeof stats[number]) => sum + s._count.status, 0);
  const completedTickets = stats.find((s: typeof stats[number]) => s.status === "COMPLETED")?._count.status || 0;
  const cancelledTickets = stats.find((s: typeof stats[number]) => s.status === "CANCELLED")?._count.status || 0;
  const skippedTickets = stats.find((s: typeof stats[number]) => s.status === "SKIPPED")?._count.status || 0;

  await prisma.dailyAnalytics.upsert({
    where: { shopId_date: { shopId, date: today } },
    create: {
      shopId,
      date: today,
      totalTickets,
      completedTickets,
      cancelledTickets,
      skippedTickets,
    },
    update: {
      totalTickets,
      completedTickets,
      cancelledTickets,
      skippedTickets,
    },
  });
}
