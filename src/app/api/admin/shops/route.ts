import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api";

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    if (user.role !== 'SUPER_ADMIN') return errorResponse('غير مسموح', 403);

    const shops = await prisma.shop.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subscription: {
          include: { planModel: true }
        },
        members: {
          where: { role: 'SHOP_OWNER' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                accountStatus: true,
                isApproved: true,
                createdAt: true,
                lastLoginAt: true,
              }
            }
          }
        },
        _count: {
          select: {
            tickets: true,
            branches: true,
            queues: { where: { isActive: true } },
            members: true,
          }
        }
      }
    });

    return successResponse(shops);
  } catch (err) {
    console.error('[ADMIN GET SHOPS]', err);
    return errorResponse('فشل في جلب البيانات', 500);
  }
}, ['SUPER_ADMIN']);

