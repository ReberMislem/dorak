// ============================================
// دورك - Auth Register API
// POST /api/auth/register
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
  generateSlug,
  generateToken,
} from "@/lib/api";
import { generateAccessToken, generateRefreshToken, setAuthCookies } from "@/lib/jwt";
import { registerSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Rate limiting: 5 registrations per hour per IP
  if (!checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
    return errorResponse("تجاوزت عدد المحاولات المسموحة", 429);
  }

  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return validationError(validation.error);
    }

    const { name, email, password, phone, shopName, shopCategory } = validation.data;
    const url = new URL(req.url);
    const planSlug = url.searchParams.get("plan");

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return errorResponse("البريد الإلكتروني مستخدم بالفعل", 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_ROUNDS) || 12
    );

    // Generate unique shop slug
    let slug = generateSlug(shopName);
    const existingSlug = await prisma.shop.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${generateToken(6).toLowerCase()}`;
    }

    // Create user, shop, membership, and subscription in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user (Status: PENDING)
      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          phone,
          role: "SHOP_OWNER",
          accountStatus: "PENDING",
          isApproved: false,
        },
      });

      // Create shop
      const shop = await tx.shop.create({
        data: {
          name: shopName,
          slug,
          category: shopCategory,
          settings: {
            language: "ar",
            theme: "light",
            notificationsEnabled: true,
            autoCallEnabled: false,
          },
        },
      });

      // Create shop membership
      await tx.shopMember.create({
        data: {
          shopId: shop.id,
          userId: user.id,
          role: "SHOP_OWNER",
        },
      });

      // Handle Subscription and Trial
      let selectedPlan = null;
      if (planSlug) {
        selectedPlan = await tx.plan.findUnique({ where: { slug: planSlug } });
      }

      const status = selectedPlan && selectedPlan.trialDays > 0 ? "TRIAL" : "INACTIVE";
      const endDate = selectedPlan && selectedPlan.trialDays > 0 
        ? new Date(Date.now() + selectedPlan.trialDays * 24 * 60 * 60 * 1000)
        : null;

      await tx.subscription.create({
        data: {
          shopId: shop.id,
          plan: "FREE", // Legacy field, keeping for compatibility
          status: status as any,
          maxQueues: 1,
          maxStaff: 2,
          isTrial: status === "TRIAL",
          planId: selectedPlan?.id,
          endDate,
          remainingDays: selectedPlan?.trialDays || 0,
        },
      });

      // Create default queue
      const defaultQrCode = generateToken(12);
      const queue = await tx.queue.create({
        data: {
          shopId: shop.id,
          name: "الطابور الرئيسي",
          nameAr: "الطابور الرئيسي",
          status: "CLOSED",
          maxCapacity: 100,
          avgServiceTime: 15,
          notifyBefore: 3,
        },
      });

      // Create QR code for the default queue
      await tx.qrCode.create({
        data: {
          shopId: shop.id,
          queueId: queue.id,
          code: defaultQrCode,
          url: `${process.env.NEXT_PUBLIC_APP_URL}/q/${defaultQrCode}`,
        },
      });

      return { user, shop, queue };
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: result.user.id,
      email: result.user.email,
      role: "SHOP_OWNER",
      shopId: result.shop.id,
      accountStatus: "PENDING",
    });
    const refreshToken = generateRefreshToken(result.user.id);

    // Save session
    await prisma.session.create({
      data: {
        userId: result.user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || undefined,
      },
    });

    await setAuthCookies(accessToken, refreshToken);

    return successResponse(
      {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          shopId: result.shop.id,
          shopName: result.shop.name,
          accountStatus: result.user.accountStatus,
        },
        accessToken,
      },
      "تم إنشاء الحساب بنجاح. بانتظار موافقة الإدارة لتفعيل النظام.",
      201
    );
  } catch (error) {
    console.error("[REGISTER ERROR]", error);
    return errorResponse("حدث خطأ في الخادم", 500);
  }
}
