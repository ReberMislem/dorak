// ============================================
// دورك - Auth Me / Logout APIs
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, withAuth } from "@/lib/api";
import { JwtPayload } from "@/types";

// GET /api/auth/me
export const GET = withAuth(async (_req: NextRequest, user: JwtPayload) => {
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        accountStatus: true,
        lastLoginAt: true,
        createdAt: true,
        shopMemberships: {
          where: { isActive: true },
          include: {
            shop: {
              include: {
                subscription: true,
                breakTimes: {
                  where: { isActive: true }
                }
              }
            },
          },
        },
      },
    });

    if (!dbUser || !dbUser.isActive) {
      return errorResponse("المستخدم غير موجود", 404);
    }

    const response = successResponse({
      ...dbUser,
      shops: dbUser.shopMemberships.map((m: typeof dbUser.shopMemberships[number]) => ({
        ...m.shop,
        memberRole: m.role,
      })),
    });
    
    // Disable caching for authentication endpoint
    response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    return response;
  } catch (error) {
    console.error("[ME ERROR]", error);
    return errorResponse("حدث خطأ في الخادم", 500);
  }
}, undefined, { checkStatus: false });
