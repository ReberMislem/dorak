// ============================================
// دورك - Single Queue API
// GET / PATCH / DELETE /api/queues/[id]
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

// GET /api/queues/[id]
export const GET = withAuth(
  async (req: NextRequest, user: JwtPayload) => {
    try {
      const id = req.nextUrl.pathname.split("/").at(-1);
      if (!id) return errorResponse("معرّف الطابور مفقود", 400);

      const queue = await prisma.queue.findFirst({
        where: { id, shopId: user.shopId, isActive: true },
        include: {
          branch: { select: { id: true, name: true } },
          tickets: {
            where: { status: { in: ["WAITING", "CALLED", "SERVING"] } },
            orderBy: { ticketNumber: "asc" },
          },
          _count: {
            select: {
              tickets: { where: { status: { in: ["WAITING", "CALLED", "SERVING"] } } },
            },
          },
        },
      });

      if (!queue) return errorResponse("الطابور غير موجود", 404);

      return successResponse({
        ...queue,
        waitingCount: queue._count.tickets,
        estimatedWait: queue._count.tickets * queue.avgServiceTime,
      });
    } catch (error) {
      console.error("[GET QUEUE ERROR]", error);
      return errorResponse("حدث خطأ في الخادم", 500);
    }
  },
  ["SHOP_OWNER", "SHOP_STAFF"]
);

// PATCH /api/queues/[id] — update queue settings
export const PATCH = withAuth(
  async (req: NextRequest, user: JwtPayload) => {
    try {
      const id = req.nextUrl.pathname.split("/").at(-1);
      if (!id) return errorResponse("معرّف الطابور مفقود", 400);

      const queue = await prisma.queue.findFirst({
        where: { id, shopId: user.shopId },
      });
      if (!queue) return errorResponse("الطابور غير موجود", 404);

      const body = await req.json();
      const allowedFields = ["name", "nameAr", "avgServiceTime", "maxCapacity", "notifyBefore", "openTime", "closeTime"];
      const data: Record<string, unknown> = {};
      for (const field of allowedFields) {
        if (body[field] !== undefined) data[field] = body[field];
      }

      const updated = await prisma.queue.update({ where: { id }, data });

      const io = getSocketServer();
      if (io) {
        io.to(`shop:${user.shopId}`).emit("QUEUE_UPDATED", {
          type: "QUEUE_SETTINGS_CHANGED",
          queueId: id,
        });
      }

      return successResponse(updated, "تم تحديث إعدادات الطابور");
    } catch (error) {
      console.error("[PATCH QUEUE ERROR]", error);
      return errorResponse("حدث خطأ في الخادم", 500);
    }
  },
  ["SHOP_OWNER"]
);

// DELETE /api/queues/[id] — soft delete
export const DELETE = withAuth(
  async (req: NextRequest, user: JwtPayload) => {
    try {
      const id = req.nextUrl.pathname.split("/").at(-1);
      if (!id) return errorResponse("معرّف الطابور مفقود", 400);

      const queue = await prisma.queue.findFirst({
        where: { id, shopId: user.shopId },
      });
      if (!queue) return errorResponse("الطابور غير موجود", 404);

      // First close and cancel active tickets
      await prisma.ticket.updateMany({
        where: { queueId: id, status: { in: ["WAITING", "CALLED", "SERVING"] } },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });

      // Soft delete the queue
      await prisma.queue.update({
        where: { id },
        data: { isActive: false, status: "CLOSED" },
      });

      const io = getSocketServer();
      if (io) {
        io.to(`shop:${user.shopId}`).emit("QUEUE_UPDATED", {
          type: "QUEUE_DELETED",
          queueId: id,
        });
      }

      return successResponse(null, "تم حذف الطابور بنجاح");
    } catch (error) {
      console.error("[DELETE QUEUE ERROR]", error);
      return errorResponse("حدث خطأ في الخادم", 500);
    }
  },
  ["SHOP_OWNER"]
);
