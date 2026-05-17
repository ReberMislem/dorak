// ============================================
// دورك - API Response Utilities & Middleware
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { verifyAccessToken } from "./jwt";
import { TOKEN_COOKIE_NAME } from "@/constants";
import { ApiResponse, JwtPayload, UserRole } from "@/types";

// ---- Success Response ----
export function successResponse<T>(
  data: T,
  message?: string,
  status = 200,
  pagination?: ApiResponse["pagination"]
): NextResponse {
  return NextResponse.json(
    { success: true, data, message, pagination },
    { status }
  );
}

// ---- Error Response ----
export function errorResponse(
  error: string,
  status = 400
): NextResponse {
  return NextResponse.json({ success: false, error }, { status });
}

// ---- Validation Error ----
export function validationError(err: ZodError): NextResponse {
  const errors = err.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
  return NextResponse.json(
    { success: false, error: "خطأ في البيانات المدخلة", details: errors },
    { status: 422 }
  );
}

// ---- Auth Guard ----
export function withAuth(
  handler: (req: NextRequest, user: JwtPayload) => Promise<NextResponse>,
  allowedRoles?: UserRole[],
  options: { checkStatus?: boolean } = { checkStatus: true }
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const token = req.cookies.get(TOKEN_COOKIE_NAME)?.value;

    if (!token) {
      return errorResponse("غير مصرح. يرجى تسجيل الدخول", 401);
    }

    const user = verifyAccessToken(token);
    if (!user) {
      return errorResponse("الجلسة منتهية. يرجى تسجيل الدخول مجدداً", 401);
    }

    // Allow SUPER_ADMIN to bypass all status checks
    if (user.role === 'SUPER_ADMIN') {
      return handler(req, user);
    }

    // Fetch account status and subscription from DB
    if (options.checkStatus) {
      const { prisma } = await import("./prisma");
      const dbUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { accountStatus: true, shopMemberships: { 
          include: { shop: { include: { subscription: true } } } 
        } }
      });

      if (!dbUser) {
        return errorResponse("المستخدم غير موجود", 404);
      }

      if (dbUser.accountStatus === 'PENDING') {
        return errorResponse("الحساب بانتظار موافقة الإدارة", 403);
      }

      if (dbUser.accountStatus === 'SUSPENDED') {
        return errorResponse("الحساب موقوف. يرجى التواصل مع الإدارة", 403);
      }

      // Check subscription if user belongs to a shop
      const membership = dbUser.shopMemberships[0];
      if (membership?.shop?.subscription) {
        const sub = membership.shop.subscription;
        const allowedStatuses = ['ACTIVE', 'TRIAL'];
        if (!allowedStatuses.includes(sub.status)) {
          return errorResponse("الاشتراك غير فعال أو منتهي", 403);
        }
        if (sub.endDate && new Date(sub.endDate) < new Date()) {
          return errorResponse("انتهت صلاحية الاشتراك", 403);
        }
      }
    }

    // Role check
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return errorResponse("ليس لديك صلاحية للوصول لهذا المورد", 403);
    }

    return handler(req, user);
  };
}

// ---- Rate Limiting (Simple in-memory) ----
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests = 100,
  windowMs = 15 * 60 * 1000
): boolean {
  const now = Date.now();
  const key = identifier;
  const existing = rateLimitMap.get(key);

  if (!existing || existing.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= maxRequests) {
    return false;
  }

  existing.count++;
  return true;
}

// ---- Get IP from Request ----
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// ---- Security Headers ----
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

// ---- Sanitize Input ----
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "")
    .substring(0, 1000);
}

// ---- Generate Unique Token ----
export function generateToken(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ---- Generate Slug ----
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .substring(0, 50);
}
