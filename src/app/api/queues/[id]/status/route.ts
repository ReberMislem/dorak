// ============================================
// دورك - Queue Status API
// PATCH /api/queues/[id]/status
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  validationError,
  withAuth,
} from "@/lib/api";
import { queueStatusSchema } from "@/lib/validations";
import { JwtPayload } from "@/types";

// PATCH /api/queues/[id]/status
export const PATCH = withAuth(
  async (
    req: NextRequest,
    user: JwtPayload,
  ) => {
    try {
      const url = new URL(req.url);
      const id = url.pathname.split("/").at(-2);

      const queue = await prisma.queue.findFirst({
        where: { id, shopId: user.shopId },
      });

      if (!queue) return errorResponse("الطابور غير موجود", 404);

      const body = await req.json();
      const validation = queueStatusSchema.safeParse(body);
      if (!validation.success) return validationError(validation.error);

      const updated = await prisma.queue.update({
        where: { id },
        data: { status: validation.data.status },
      });

      // Emit realtime update
      const io = (global as any).io;
      if (io) {
        io.to(`shop:${user.shopId}`).emit("QUEUE_UPDATED", {
          type: "QUEUE_STATUS_CHANGED",
          queueId: id,
          status: updated.status,
        });
      }

      return successResponse(updated, "تم تحديث حالة الطابور");
    } catch (error) {
      console.error("[QUEUE STATUS ERROR]", error);
      return errorResponse("حدث خطأ في الخادم", 500);
    }
  },
  ["SHOP_OWNER", "SHOP_STAFF"]
);
