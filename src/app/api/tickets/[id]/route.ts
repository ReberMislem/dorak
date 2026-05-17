// ============================================
// دورك - Ticket Status API (Public)
// GET /api/tickets/[token]
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";

// GET /api/tickets/[token] - Public: Get ticket status by token
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: token } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: { customerToken: token },
      include: {
        queue: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            status: true,
            avgServiceTime: true,
            notifyBefore: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            logo: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    if (!ticket) {
      return errorResponse("التذكرة غير موجودة", 404);
    }

    // Recalculate real-time position
    let currentPosition = ticket.position;

    if (ticket.status === "WAITING") {
      const waitingBefore = await prisma.ticket.count({
        where: {
          queueId: ticket.queueId,
          status: "WAITING",
          ticketNumber: { lt: ticket.ticketNumber },
        },
      });
      currentPosition = waitingBefore + 1;

      // Update position if changed
      if (currentPosition !== ticket.position) {
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            position: currentPosition,
            estimatedWait: (currentPosition - 1) * ticket.queue.avgServiceTime,
          },
        });
      }
    }

    const estimatedWait =
      ticket.status === "WAITING"
        ? (currentPosition - 1) * ticket.queue.avgServiceTime
        : 0;

    return successResponse({
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      customerToken: ticket.customerToken,
      status: ticket.status,
      position: currentPosition,
      estimatedWait,
      calledAt: ticket.calledAt,
      servedAt: ticket.servedAt,
      completedAt: ticket.completedAt,
      cancelledAt: ticket.cancelledAt,
      createdAt: ticket.createdAt,
      queue: ticket.queue,
      shop: ticket.shop,
      // Is it almost their turn?
      isAlmostTurn: currentPosition <= ticket.queue.notifyBefore,
    });
  } catch (error) {
    console.error("[TICKET STATUS ERROR]", error);
    return errorResponse("حدث خطأ في الخادم", 500);
  }
}
