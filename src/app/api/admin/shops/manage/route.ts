import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api";

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    if (user.role !== 'SUPER_ADMIN') return errorResponse('غير مسموح', 403);

    const { shopId, action, data } = await req.json();
    if (!shopId) return errorResponse('معرف المحل مطلوب', 400);

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        members: { where: { role: 'SHOP_OWNER' } },
        subscription: true
      }
    });

    if (!shop) return errorResponse('المحل غير موجود', 404);
    const ownerId = shop.members[0]?.userId;

    switch (action) {

      // ✅ Approve account only — admin chooses plan separately
      case 'APPROVE':
        if (!ownerId) return errorResponse('لا يوجد مالك لهذا المحل', 400);
        await prisma.user.update({
          where: { id: ownerId },
          data: {
            accountStatus: 'ACTIVE',
            isApproved: true,
            approvedBy: user.userId,
            approvedAt: new Date()
          }
        });
        return successResponse(null, 'تمت الموافقة على الحساب وتفعيله');

      // ✅ Suspend account + subscription
      case 'SUSPEND':
        if (!ownerId) return errorResponse('لا يوجد مالك لهذا المحل', 400);
        await prisma.user.update({
          where: { id: ownerId },
          data: { accountStatus: 'SUSPENDED' }
        });
        await prisma.subscription.update({
          where: { shopId },
          data: { status: 'SUSPENDED' }
        });
        return successResponse(null, 'تم إيقاف الحساب');

      // ✅ Reactivate a suspended account
      case 'REACTIVATE':
        if (!ownerId) return errorResponse('لا يوجد مالك لهذا المحل', 400);
        await prisma.user.update({
          where: { id: ownerId },
          data: { accountStatus: 'ACTIVE' }
        });
        if (shop.subscription?.status === 'SUSPENDED') {
          await prisma.subscription.update({
            where: { shopId },
            data: { status: 'ACTIVE' }
          });
        }
        return successResponse(null, 'تم إعادة تفعيل الحساب');

      // ✅ Activate trial with optional days + auto-approve account
      case 'ACTIVATE_TRIAL': {
        if (shop.subscription?.isTrial) {
          return errorResponse('تم استخدام الفترة التجريبية مسبقاً لهذا المحل', 400);
        }
        const trialDays = data?.days || 7;
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + trialDays);
        // Auto-approve the user if still PENDING
        if (ownerId) {
          await prisma.user.update({
            where: { id: ownerId },
            data: {
              accountStatus: 'ACTIVE',
              isApproved: true,
              approvedBy: user.userId,
              approvedAt: new Date()
            }
          });
        }
        await prisma.subscription.update({
          where: { shopId },
          data: {
            status: 'TRIAL',
            isTrial: true,
            endDate: trialEnd,
            remainingDays: trialDays,
          }
        });
        return successResponse(null, `تم تفعيل فترة تجريبية لمدة ${trialDays} أيام`);
      }

      // ✅ Extend subscription manually
      case 'EXTEND': {
        const days = data?.days || 30;
        const currentEnd = shop.subscription?.endDate || new Date();
        const newEnd = new Date(currentEnd);
        newEnd.setDate(newEnd.getDate() + days);

        await prisma.subscription.update({
          where: { shopId },
          data: {
            endDate: newEnd,
            status: 'ACTIVE'
          }
        });
        return successResponse(null, `تم تمديد الاشتراك لـ ${days} أيام إضافية`);
      }

      // ✅ End trial immediately
      case 'END_TRIAL':
        await prisma.subscription.update({
          where: { shopId },
          data: {
            status: 'EXPIRED',
            isTrial: false,
            endDate: new Date()
          }
        });
        return successResponse(null, 'تم إنهاء فترة التجربة');

      // ✅ Extend subscription by days
      case 'EXTEND': {
        const extendDays = data?.days || 30;
        const base = shop.subscription?.endDate && new Date(shop.subscription.endDate) > new Date()
          ? new Date(shop.subscription.endDate)
          : new Date();
        base.setDate(base.getDate() + extendDays);
        await prisma.subscription.update({
          where: { shopId },
          data: { endDate: base, status: 'ACTIVE', isTrial: false }
        });
        return successResponse(null, `تم تمديد الاشتراك حتى ${base.toLocaleDateString('ar-SA')}`);
      }

      // ✅ Set custom end date
      case 'SET_END_DATE': {
        if (!data?.endDate) return errorResponse('تاريخ الانتهاء مطلوب', 400);
        const endDate = new Date(data.endDate);
        if (isNaN(endDate.getTime())) return errorResponse('تاريخ غير صالح', 400);
        await prisma.subscription.update({
          where: { shopId },
          data: { endDate, status: 'ACTIVE', isTrial: false }
        });
        return successResponse(null, 'تم تحديد تاريخ انتهاء الاشتراك');
      }

      // ✅ Reset subscription to inactive
      case 'RESET_SUBSCRIPTION':
        await prisma.subscription.update({
          where: { shopId },
          data: {
            status: 'INACTIVE',
            isTrial: false,
            endDate: null,
            planId: null,
            activatedByAdmin: false,
          }
        });
        return successResponse(null, 'تم إعادة ضبط الاشتراك');

      // ✅ Delete shop and all its data
      case 'DELETE_SHOP':
        await prisma.shop.delete({ where: { id: shopId } });
        return successResponse(null, 'تم حذف المحل وكافة بياناته نهائياً');

      default:
        return errorResponse('إجراء غير معروف', 400);
    }
  } catch (err) {
    console.error('[ADMIN MANAGE SHOP ERROR]', err);
    return errorResponse('حدث خطأ في الخادم', 500);
  }
}, ['SUPER_ADMIN']);
