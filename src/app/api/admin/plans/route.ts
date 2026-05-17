import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse, validationError } from "@/lib/api";
import { planSchema } from "@/lib/validations";

// GET /api/admin/plans - List all plans (Admin only)
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { sortOrder: "asc" },
    });
    
    // Ensure features is always an array
    const safePlans = plans.map(plan => ({
      ...plan,
      features: Array.isArray(plan.features) ? plan.features : []
    }));

    return successResponse(safePlans);
  } catch (err) {
    console.error("[GET PLANS ERROR]", err);
    return errorResponse("فشل في جلب قائمة الباقات", 500);
  }
}, ["SUPER_ADMIN"]);

// POST /api/admin/plans - Create a new plan (Admin only)
export const POST = withAuth(async (req: NextRequest) => {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return errorResponse("بيانات الطلب غير صالحة", 400);
    }

    const result = planSchema.safeParse(body);
    
    if (!result.success) {
      return validationError(result.error);
    }

    const data = result.data;

    // Calculate Final Price
    let finalPrice = data.price;
    if (data.discountType === "PERCENTAGE") {
      finalPrice = data.price * (1 - data.discountValue / 100);
    } else if (data.discountType === "FIXED") {
      finalPrice = Math.max(0, data.price - data.discountValue);
    }

    const plan = await prisma.plan.create({
      data: {
        ...data,
        finalPrice,
        features: data.features || [],
      },
    });

    return successResponse(plan, "تم إنشاء الباقة بنجاح", 201);
  } catch (err: any) {
    console.error("[CREATE PLAN ERROR]", err);
    if (err.code === "P2002") {
      return errorResponse("الرابط (Slug) مستخدم بالفعل", 400);
    }
    return errorResponse("فشل في إنشاء الباقة", 500);
  }
}, ["SUPER_ADMIN"]);
