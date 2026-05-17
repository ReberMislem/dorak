import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api";

// GET /api/promotions?shopId=... (public)
export const GET = async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const shopId = url.searchParams.get('shopId');
    const now = new Date();
    const where: any = { startAt: { lte: now }, endAt: { gte: now } };
    if (shopId) where.OR = [{ shopId }, { shopId: null }];
    const promos = await (prisma as any).promotion.findMany({ where });
    return successResponse(promos);
  } catch (err) {
    console.error('[GET PROMOS]', err);
    return errorResponse('فشل في جلب العروض', 500);
  }
};

// POST /api/promotions - create (SUPER_ADMIN or shop owner)
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();
    const { code, shopId, discountPercent, startAt, endAt, maxUses } = body;
    // Only SUPER_ADMIN or shop owner for given shop
    if (shopId && user.role !== 'SUPER_ADMIN' && user.shopId !== shopId) return errorResponse('غير مسموح', 403);
    const promo = await (prisma as any).promotion.create({ data: { code, shopId: shopId || null, discountPercent: Number(discountPercent || 0), startAt: new Date(startAt), endAt: new Date(endAt), maxUses: maxUses ? Number(maxUses) : null } });
    return successResponse(promo, 'تم إنشاء العرض', 201);
  } catch (err) {
    console.error('[CREATE PROMO]', err);
    return errorResponse('فشل في إنشاء العرض', 500);
  }
}, ['SUPER_ADMIN', 'SHOP_OWNER']);
