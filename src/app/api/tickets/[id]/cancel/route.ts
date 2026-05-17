// ============================================
// دورك - Cancel Ticket API (Public)
// POST /api/tickets/[token]/cancel
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: token } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: { customerToken: token },
    });

    if (!ticket) return errorResponse("التذكرة غير موجودة", 404);

    if (!["WAITING", "CALLED"].includes(ticket.status)) {
      return errorResponse("لا يمكن إلغاء هذه التذكرة", 400);
    }

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    return successResponse(null, "تم إلغاء دورك بنجاح");
  } catch (error) {
    console.error("[CANCEL TICKET ERROR]", error);
    return errorResponse("حدث خطأ في الخادم", 500);
  }
}
