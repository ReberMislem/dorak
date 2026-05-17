import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";

// GET /api/plans - Public list of active plans for pricing page
export const GET = async (req: NextRequest) => {
  try {
    const plans = await prisma.plan.findMany({ 
      where: { isActive: true }, 
      orderBy: { price: 'asc' } 
    });

    // Ensure features is always an array
    const safePlans = plans.map(plan => ({
      ...plan,
      features: Array.isArray(plan.features) ? plan.features : []
    }));

    return successResponse(safePlans);
  } catch (err) {
    console.error('[GET PUBLIC PLANS ERROR]', err);
    return errorResponse('فشل في جلب قائمة الباقات', 500);
  }
};
