import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api";

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").at(-2);
    const { action } = await req.json();

    if (!id) return errorResponse("معرف التذكرة مطلوب", 400);

    const ticket = await prisma.ticket.findFirst({
      where: { id, shopId: user.shopId },
      include: { queue: true }
    });

    if (!ticket) return errorResponse("التذكرة غير موجودة", 404);

    let updatedTicket;

    switch (action) {
      case 'COMPLETE':
        updatedTicket = await prisma.ticket.update({
          where: { id },
          data: { status: 'COMPLETED', completedAt: new Date() }
        });
        break;
      
      case 'SKIP':
        updatedTicket = await prisma.ticket.update({
          where: { id },
          data: { status: 'SKIPPED' }
        });
        break;

      case 'CANCEL':
        updatedTicket = await prisma.ticket.update({
          where: { id },
          data: { status: 'CANCELLED', cancelledAt: new Date() }
        });
        break;
      
      case 'RECALL':
        updatedTicket = await prisma.ticket.update({
          where: { id },
          data: { status: 'CALLED', calledAt: new Date() }
        });
        break;

      case 'START_SERVING':
        updatedTicket = await prisma.ticket.update({
          where: { id },
          data: { status: 'SERVING', servedAt: new Date() }
        });
        break;

      default:
        return errorResponse("إجراء غير صالح", 400);
    }

    // Recalculate positions if cancelled/skipped
    if (['CANCEL', 'SKIP'].includes(action)) {
       const remaining = await prisma.ticket.findMany({
          where: { queueId: ticket.queueId, status: "WAITING" },
          orderBy: { ticketNumber: "asc" },
        });

        for (let i = 0; i < remaining.length; i++) {
          await prisma.ticket.update({
            where: { id: remaining[i].id },
            data: { position: i + 1 },
          });
        }
    }

    // Emit Socket Update
    const io = (global as any).io;
    if (io) {
      io.to(`shop:${user.shopId}`).emit("TICKET_UPDATED", {
        type: `TICKET_${action}`,
        ticketId: id,
        status: updatedTicket.status,
        queueId: ticket.queueId
      });
      io.to(`queue:${ticket.queueId}`).emit("TICKET_STATUS_CHANGED", {
        ticketId: id,
        status: updatedTicket.status
      });
    }

    return successResponse(updatedTicket, "تم تحديث التذكرة بنجاح");
  } catch (err) {
    console.error('[TICKET ACTION ERROR]', err);
    return errorResponse("حدث خطأ في الخادم", 500);
  }
}, ['SHOP_OWNER', 'SHOP_STAFF']);
