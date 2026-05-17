// ============================================
// دورك - Auth Logout API
// POST /api/auth/logout
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
import { clearAuthCookies } from "@/lib/jwt";
import { REFRESH_COOKIE_NAME } from "@/constants";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;

    if (refreshToken) {
      // Remove session from DB
      await prisma.session
        .deleteMany({ where: { token: refreshToken } })
        .catch(() => {}); // Ignore error if session not found
    }

    await clearAuthCookies();

    return successResponse(null, "تم تسجيل الخروج بنجاح");
  } catch (error) {
    console.error("[LOGOUT ERROR]", error);
    return errorResponse("حدث خطأ في الخادم", 500);
  }
}
