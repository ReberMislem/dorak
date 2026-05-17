// ============================================
// دورك - Auth Login API
// POST /api/auth/login
// ============================================

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  validationError,
  checkRateLimit,
  getClientIp,
} from "@/lib/api";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { loginSchema } from "@/lib/validations";
import { TOKEN_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/constants";
import type { UserRole, AccountStatus } from "@/types";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Rate limiting: 10 attempts per 15 min per IP
  if (!checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return errorResponse("تجاوزت عدد المحاولات المسموحة. حاول بعد 15 دقيقة", 429);
  }

  try {
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return validationError(validation.error);
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        shopMemberships: {
          where: { isActive: true },
          include: { shop: { select: { id: true, name: true, slug: true } } },
          take: 1,
        },
      },
    });

    if (!user || !user.isActive) {
      return errorResponse("البريد الإلكتروني أو كلمة المرور غير صحيحة", 401);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return errorResponse("البريد الإلكتروني أو كلمة المرور غير صحيحة", 401);
    }

    // Get primary shop
    const shopMembership = user.shopMemberships[0];
    const shopId = shopMembership?.shop?.id;

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      shopId,
      accountStatus: user.accountStatus as AccountStatus,
    });
    const refreshToken = generateRefreshToken(user.id);

    // Save session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || undefined,
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const response = successResponse(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          shopId,
          shopName: shopMembership?.shop?.name,
          accountStatus: user.accountStatus,
        },
        accessToken,
      },
      "تم تسجيل الدخول بنجاح"
    );

    response.cookies.set(TOKEN_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[LOGIN ERROR]", error);
    return errorResponse("حدث خطأ في الخادم", 500);
  }
}
