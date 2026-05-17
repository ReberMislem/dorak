// ============================================
// Dorak - Staff Management Page (Premium UI)
// ============================================

import { cookies } from "next/headers";
import {
  Activity,
  Crown,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  Users,
  MoreVertical,
  ExternalLink
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/jwt";
import { TOKEN_COOKIE_NAME } from "@/constants";
import AddStaffModal from "@/components/dashboard/AddStaffModal";
import { cn } from "@/lib/utils";

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "مدير النظام",
  SHOP_OWNER: "مالك المحل",
  SHOP_STAFF: "موظف",
};

const roleStyles: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  SHOP_OWNER: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  SHOP_STAFF: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

async function getCurrentStaff() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
  const session = token ? verifyAccessToken(token) : null;

  if (!session) {
    return { staff: [], shopName: null };
  }

  let shopId = session.shopId;

  if (!shopId) {
    const membership = await prisma.shopMember.findFirst({
      where: { userId: session.userId, isActive: true },
      select: { shopId: true },
      orderBy: { joinedAt: "asc" },
    });
    shopId = membership?.shopId;
  }

  if (!shopId && session.role === "SUPER_ADMIN") {
    const firstShop = await prisma.shop.findFirst({
      where: { isActive: true },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });
    shopId = firstShop?.id;
  }

  if (!shopId) {
    return { staff: [], shopName: null };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { name: true, nameAr: true },
  });

  const staff = await prisma.shopMember.findMany({
    where: { shopId, isActive: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
      },
    },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
  });

  return { staff, shopName: shop?.nameAr || shop?.name || null };
}

export default async function StaffPage() {
  const { staff, shopName } = await getCurrentStaff();
  const activeCount = staff.filter((member) => member.user.isActive).length;
  const ownerCount = staff.filter((member) => member.role !== "SHOP_STAFF").length;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 lg:pb-8 px-4 sm:px-0" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text tracking-tight flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/10 shadow-sm">
              <Users className="w-8 h-8 text-primary" />
            </div>
            إدارة الفريق والصلاحيات
          </h1>
          <p className="text-text-muted mt-2 font-medium italic">
            {shopName ? `في ${shopName}` : "إدارة فريق العمل والتحكم في صلاحيات الوصول"}
          </p>
        </div>
        <AddStaffModal />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[
          { label: 'إجمالي الفريق', value: staff.length, icon: Users, color: 'blue' },
          { label: 'حسابات نشطة', value: activeCount, icon: Activity, color: 'emerald' },
          { label: 'إداريون', value: ownerCount, icon: ShieldCheck, color: 'purple' },
        ].map((stat, idx) => (
          <div key={stat.label} className="card p-5 sm:p-6 bg-surface/50 backdrop-blur-xl border-border/50 shadow-premium">
            <div className={cn(
              "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm",
              stat.color === 'blue' && "bg-blue-500/10 text-blue-600",
              stat.color === 'emerald' && "bg-emerald-500/10 text-emerald-600",
              stat.color === 'purple' && "bg-purple-500/10 text-purple-600",
            )}>
              <stat.icon size={24} />
            </div>
            <div className="text-3xl font-black text-text">{stat.value}</div>
            <p className="mt-1 text-xs font-black text-text-muted uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Staff List Table */}
      <div className="card shadow-premium rounded-[2.5rem] overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/40 bg-surface-2/50 px-8 py-6">
          <div>
            <h2 className="text-xl font-black text-text">قائمة الفريق</h2>
            <p className="text-xs font-bold text-text-muted mt-1 italic">الأعضاء المرتبطون بالمحل حالياً</p>
          </div>
          <div className="flex items-center gap-2">
             <span className="badge-premium bg-white border border-border shadow-sm px-4 py-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
              {staff.length} عضو مسجل
            </span>
          </div>
        </div>

        {staff.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="table-premium border-0">
                <thead>
                  <tr>
                    <th className="px-8 py-6">الموظف</th>
                    <th className="px-8 py-6">الدور الوظيفي</th>
                    <th className="px-8 py-6">التواصل</th>
                    <th className="px-8 py-6">آخر دخول</th>
                    <th className="px-8 py-6">الحالة</th>
                    <th className="px-8 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 bg-white">
                  {staff.map((member) => {
                    const roleClass = roleStyles[member.role] || "bg-muted text-text-muted border-border";
                    const lastLogin = member.user.lastLoginAt
                      ? new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(member.user.lastLoginAt)
                      : "لم يسجل الدخول";

                    return (
                      <tr key={member.id} className="transition-all hover:bg-primary/[0.02] group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 border border-border text-text-muted shadow-sm group-hover:border-primary/30 transition-all font-black">
                              {member.role === "SHOP_OWNER" || member.role === "SUPER_ADMIN" ? (
                                <Crown size={22} className="text-warning fill-warning/10" />
                              ) : (
                                <UserRound size={22} />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-black text-text group-hover:text-primary transition-colors">{member.user.name}</div>
                              <div className="text-[11px] font-bold text-text-muted mt-0.5">{member.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn("badge-premium", roleClass)}>
                            {roleLabels[member.role] || member.role}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[11px] font-black text-text-muted hover:text-primary transition-all cursor-pointer">
                              <Mail size={12} className="opacity-40" />
                              {member.user.email}
                            </div>
                            {member.user.phone && (
                              <div className="flex items-center gap-2 text-[11px] font-black text-text-muted" dir="ltr">
                                <Phone size={12} className="opacity-40" />
                                {member.user.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-[11px] font-black text-text-muted bg-surface-2 border border-border/60 px-3 py-1.5 rounded-xl inline-block italic shadow-sm">
                            {lastLogin}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "badge-premium border-none",
                            member.user.isActive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                          )}>
                            {member.user.isActive ? "نشط" : "معطل"}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-left">
                          <button className="w-10 h-10 flex items-center justify-center bg-surface-2 hover:bg-white rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-border shadow-sm">
                            <MoreVertical size={18} className="text-text-muted" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-border/30">
              {staff.map((member) => (
                <div key={member.id} className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-border">
                        {member.role === "SHOP_OWNER" || member.role === "SUPER_ADMIN" ? (
                          <Crown size={20} className="text-amber-500" />
                        ) : (
                          <UserRound size={20} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-text">{member.user.name}</h4>
                        <span className={cn("badge-premium text-[9px] mt-1", roleStyles[member.role])}>
                          {roleLabels[member.role] || member.role}
                        </span>
                      </div>
                    </div>
                    <button className="p-2 bg-muted rounded-xl">
                      <MoreVertical size={16} className="text-text-muted" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/30 rounded-2xl border border-border/50">
                      <p className="text-[10px] font-black text-text-muted mb-1 uppercase tracking-tighter">التواصل</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-text truncate">
                        <Mail size={12} className="shrink-0 opacity-40" />
                        {member.user.email}
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-2xl border border-border/50">
                      <p className="text-[10px] font-black text-text-muted mb-1 uppercase tracking-tighter">الحالة</p>
                      <div className="flex items-center gap-1.5 text-xs font-black">
                        <div className={cn("w-2 h-2 rounded-full", member.user.isActive ? "bg-success" : "bg-danger")} />
                        {member.user.isActive ? "نشط حالياً" : "حساب معطل"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted italic">
                      آخر ظهور: {member.user.lastLoginAt ? new Intl.DateTimeFormat("ar", { dateStyle: "short" }).format(member.user.lastLoginAt) : 'أبداً'}
                    </div>
                    <button className="flex items-center gap-1.5 text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-xl">
                      عرض الملف <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/50 text-text-muted/40 ring-8 ring-muted/20">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-black text-text">لا يوجد موظفون بعد</h3>
            <p className="mt-2 max-w-sm text-sm font-bold text-text-muted">
              عند إضافة أعضاء فريق للمحل سيظهرون هنا مع أدوارهم وحالة حساباتهم.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
