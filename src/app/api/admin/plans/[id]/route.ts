import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse, validationError } from "@/lib/api";
import { planSchema } from "@/lib/validations";

// PATCH /api/admin/plans/[id] - Update a plan (Admin only)
export const PATCH = withAuth(async (req: NextRequest, user) => {
  try {
    const id = req.url.split("/").pop();
    if (!id) return errorResponse("معرف الباقة مطلوب", 400);

    const body = await req.json();
    const result = planSchema.partial().safeParse(body);
    
    if (!result.success) {
      return validationError(result.error);
    }

    const data = result.data;

    // Get current plan to recalculate final price if needed
    const currentPlan = await prisma.plan.findUnique({ where: { id } });
    if (!currentPlan) return errorResponse("الباقة غير موجودة", 404);

    // Calculate Final Price
    const price = data.price !== undefined ? data.price : currentPlan.price;
    const discountType = data.discountType !== undefined ? data.discountType : currentPlan.discountType;
    const discountValue = data.discountValue !== undefined ? data.discountValue : currentPlan.discountValue;

    let finalPrice = price;
    if (discountType === "PERCENTAGE") {
      finalPrice = price * (1 - discountValue / 100);
    } else if (discountType === "FIXED") {
      finalPrice = Math.max(0, price - discountValue);
    }

    const updatedPlan = await prisma.plan.update({
      where: { id },
      data: {
        ...data,
        finalPrice,
      },
    });

    return successResponse(updatedPlan, "تم تحديث الباقة بنجاح");
  } catch (err: any) {
    console.error("[UPDATE PLAN ERROR]", err);
    if (err.code === "P2002") {
      return errorResponse("الرابط (Slug) مستخدم بالفعل", 400);
    }
    return errorResponse("فشل في تحديث الباقة", 500);
  }
}, ["SUPER_ADMIN"]);

// DELETE /api/admin/plans/[id] - Delete a plan (Admin only)
export const DELETE = withAuth(async (req: NextRequest) => {
  try {
    const id = req.url.split("/").pop();
    if (!id) return errorResponse("معرف الباقة مطلوب", 400);

    // Check if plan has active subscriptions
    const activeSubs = await prisma.subscription.count({
      where: { planId: id, status: "ACTIVE" },
    });

    if (activeSubs > 0) {
      return errorResponse(`لا يمكن حذف الباقة لأنها مرتبطة بـ ${activeSubs} اشتراكات نشطة. قم بتعطيلها بدلاً من ذلك.`, 400);
    }

    await prisma.plan.delete({ where: { id } });

    return successResponse(null, "تم حذف الباقة بنجاح");
  } catch (err) {
    console.error("[DELETE PLAN ERROR]", err);
    return errorResponse("فشل في حذف الباقة", 500);
  }
}, ["SUPER_ADMIN"]);
