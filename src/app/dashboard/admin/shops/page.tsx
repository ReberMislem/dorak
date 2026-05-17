"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Store, Shield, Search, Filter,
  CheckCircle2, Loader2, Calendar, Plus,
  Power, Trash2, Edit3, UserCheck, ShieldAlert,
  Zap, Clock, Phone, Mail, BarChart3, X,
  RefreshCw, RotateCcw, LogIn
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

type Shop = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  members: { user: {
    id: string; name: string; email: string; phone?: string;
    accountStatus: string; isApproved: boolean; createdAt: string; lastLoginAt?: string;
  }}[];
  subscription?: {
    status: string; isTrial: boolean; endDate?: string; plan?: { name: string };
  };
  _count: { tickets: number; branches: number; queues: number; members: number };
};

type Plan = { 
  id: string; 
  name: string; 
  description?: string; 
  price: number; 
  interval?: string;
  billingCycle?: string;
  currencySymbol?: string;
};

export default function AdminShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [customDays, setCustomDays] = useState(30);
  const [customEndDate, setCustomEndDate] = useState("");
  const [trialDays, setTrialDays] = useState(7);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shopsRes, plansRes] = await Promise.all([
        axios.get("/api/admin/shops"),
        axios.get("/api/plans"),
      ]);
      setShops(shopsRes.data.data || []);
      setPlans(plansRes.data.data || []);
    } catch { toast.error("فشل في جلب البيانات"); }
    finally { setLoading(false); }
  };

  const handleAction = async (action: string, data?: Record<string, unknown>) => {
    if (!selectedShop) return;
    setActionLoading(true);
    try {
      const res = await axios.post("/api/admin/shops/manage", {
        shopId: selectedShop.id, action, data
      });
      toast.success(res.data.message || "تم تنفيذ الإجراء بنجاح");
      setShowManageModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "فشل تنفيذ الإجراء");
    } finally { setActionLoading(false); }
  };

  const handleAssignPlan = async (planId: string) => {
    try {
      setActionLoading(true);
      await axios.post("/api/admin/subscription/activate", {
        shopId: selectedShop?.id, planId
      });
      toast.success("تم تفعيل الاشتراك بنجاح");
      setShowAssignModal(false);
      fetchData();
    } catch { toast.error("فشل في تفعيل الاشتراك"); }
    finally { setActionLoading(false); }
  };

  const filteredShops = shops.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase()) ||
    s.members[0]?.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getAccountStatusColor = (s: string) => ({
    ACTIVE: "bg-success/10 text-success border-success/20",
    PENDING: "bg-warning/10 text-warning border-warning/20",
    SUSPENDED: "bg-danger/10 text-danger border-danger/20",
    DEACTIVATED: "bg-muted text-text-muted border-border",
  }[s] || "bg-muted text-text-muted");

  const getSubStatusColor = (s?: string) => ({
    ACTIVE: "bg-success/10 text-success border-success/20",
    INACTIVE: "bg-muted text-text-muted border-border",
    PENDING: "bg-warning/10 text-warning border-warning/20",
    SUSPENDED: "bg-danger/10 text-danger border-danger/20",
    EXPIRED: "bg-danger/10 text-danger border-danger/20",
  }[s || ""] || "bg-muted text-text-muted");

  const accountStatusLabel = (s: string) => ({
    ACTIVE: "نشط", PENDING: "بانتظار الموافقة",
    SUSPENDED: "موقوف", DEACTIVATED: "معطّل",
  }[s] || s);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-text-muted font-black italic">جاري تحميل البيانات الإدارية...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 lg:pb-8 px-4 sm:px-0" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text tracking-tight flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/10 shadow-sm">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            إدارة المنصة والاشتراكات
          </h1>
          <p className="text-text-muted mt-2 font-medium italic">التحكم الكامل بالمحلات، التراخيص، والاشتراكات</p>
        </div>
        <button onClick={fetchData} className="btn btn-primary h-12 px-6 shadow-glow gap-2 rounded-2xl">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          تحديث البيانات
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {[
          { label: "إجمالي المحلات", val: shops.length, icon: Store, color: "primary" },
          { label: "بانتظار الموافقة", val: shops.filter(s => s.members[0]?.user?.accountStatus === "PENDING").length, icon: Clock, color: "warning" },
          { label: "اشتراكات نشطة", val: shops.filter(s => s.subscription?.status === "ACTIVE").length, icon: Zap, color: "success" },
          { label: "إجمالي الموظفين", val: shops.reduce((a, s) => a + (s._count?.members || 0), 0), icon: Users, color: "info" },
        ].map((stat, i) => (
          <div key={i} className="card p-8 group hover:border-primary/20">
             <div className="flex items-start justify-between mb-8">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm",
                  stat.color === 'primary' && "bg-primary/10 text-primary border border-primary/10",
                  stat.color === 'warning' && "bg-warning/10 text-warning border border-warning/10",
                  stat.color === 'success' && "bg-success/10 text-success border border-success/10",
                  stat.color === 'info' && "bg-info/10 text-info border border-info/10",
                )}>
                  <stat.icon size={28} />
                </div>
             </div>
             <div>
                <div className="text-3xl sm:text-4xl font-black text-text mb-1 tracking-tighter">{stat.val}</div>
                <div className="text-[11px] font-black text-text-muted uppercase tracking-widest">{stat.label}</div>
             </div>
          </div>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="card overflow-hidden shadow-premium rounded-[2.5rem]">
        <div className="p-8 border-b bg-surface-2/50 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted/40" size={20} />
            <input
              type="text" className="input pr-12 bg-white border-border/40 focus:border-primary/40 w-full h-12 rounded-2xl font-bold"
              placeholder="ابحث بالاسم، المعرف، أو البريد الإلكتروني..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-border shadow-sm">
               {filteredShops.length} محل مسجل
             </span>
          </div>
        </div>
        
        <div className="table-container border-0 rounded-none shadow-none">
          <table className="table-premium">
            <thead>
              <tr>
                <th className="px-8 py-6">المحل</th>
                <th className="px-8 py-6">المالك</th>
                <th className="px-8 py-6">حالة الحساب</th>
                <th className="px-8 py-6">الاشتراك</th>
                <th className="px-8 py-6">الإحصائيات</th>
                <th className="px-8 py-6">انتهاء الاشتراك</th>
                <th className="px-8 py-6 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 bg-white">
              {filteredShops.map(shop => {
                const owner = shop.members[0]?.user;
                const sub = shop.subscription;
                const remaining = sub?.endDate
                  ? Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / 86400000)
                  : null;
                return (
                  <tr key={shop.id} className="hover:bg-primary/[0.02] transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center text-text-muted border border-border group-hover:border-primary/30 transition-all font-black text-xl shadow-sm">
                          {shop.name[0]}
                        </div>
                        <div>
                          <div className="font-black text-text group-hover:text-primary transition-colors">{shop.name}</div>
                          <div className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-lg inline-block mt-1" dir="ltr">dorak.app/q/{shop.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-bold text-text">{owner?.name || "بدون مالك"}</div>
                      <div className="text-[11px] text-text-muted flex items-center gap-1.5 mt-1 font-medium"><Mail size={12} className="opacity-40" />{owner?.email}</div>
                      {owner?.phone && <div className="text-[11px] text-text-muted flex items-center gap-1.5 font-medium" dir="ltr"><Phone size={12} className="opacity-40" />{owner.phone}</div>}
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn("badge-premium", getAccountStatusColor(owner?.accountStatus || ""))}>
                        {accountStatusLabel(owner?.accountStatus || "")}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className={cn("badge-premium inline-block w-fit", getSubStatusColor(sub?.status))}>
                          {sub?.status === "ACTIVE" ? "نشط" : sub?.status === "INACTIVE" ? "غير مفعّل" : sub?.status === "EXPIRED" ? "منتهي" : sub?.status === "SUSPENDED" ? "موقوف" : "بدون"}
                        </span>
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">{sub?.plan?.name || "بدون خطة"}</span>
                        {sub?.isTrial && <span className="text-[9px] font-black text-warning flex items-center gap-1"><Zap size={10} className="fill-current" /> تجريبي</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-4">
                        <div className="text-center">
                          <div className="text-base font-black text-text">{shop._count?.tickets || 0}</div>
                          <div className="text-[9px] text-text-muted font-black uppercase tracking-tighter">تذكرة</div>
                        </div>
                        <div className="text-center">
                          <div className="text-base font-black text-text">{shop._count?.queues || 0}</div>
                          <div className="text-[9px] text-text-muted font-black uppercase tracking-tighter">طابور</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {sub?.endDate ? (
                        <div>
                          <div className="text-sm font-black text-text">{new Date(sub.endDate).toLocaleDateString("ar-SA")}</div>
                          {remaining !== null && (
                            <div className={cn(
                              "text-[10px] font-black mt-1 uppercase tracking-tight",
                              remaining < 5 ? "text-danger" : "text-text-muted"
                            )}>
                              {remaining > 0 ? `متبقي ${remaining} يوم` : "انتهى الاشتراك"}
                            </div>
                          )}
                        </div>
                      ) : <span className="text-text-muted font-black text-xs">—</span>}
                    </td>
                    <td className="px-8 py-6 text-left">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => { setSelectedShop(shop); setShowManageModal(true); }}
                          className="w-10 h-10 rounded-xl bg-surface-2 text-text-muted hover:bg-primary hover:text-white transition-all shadow-sm flex items-center justify-center border border-border hover:border-primary"
                        ><Edit3 size={18} /></button>
                        <button
                          onClick={() => { setSelectedShop(shop); setShowAssignModal(true); }}
                          className="w-10 h-10 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm flex items-center justify-center border border-primary/20 hover:border-primary"
                        ><Zap size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredShops.length === 0 && (
            <div className="py-24 text-center flex flex-col items-center gap-4 bg-white">
               <div className="w-20 h-20 rounded-[2rem] bg-muted/30 flex items-center justify-center text-text-muted/20">
                  <Search size={40} />
               </div>
               <p className="text-lg font-black text-text-muted italic">لا توجد نتائج مطابقة لبحثك</p>
            </div>
          )}
        </div>
      </div>


      {/* Manage Modal */}
      <AnimatePresence>
        {showManageModal && selectedShop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="card max-w-2xl w-full p-8 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-black">إدارة: {selectedShop.name}</h2>
                  <p className="text-sm text-slate-400 font-bold mt-1">
                    {selectedShop.members[0]?.user?.email} •
                    <span className={`mr-2 px-2 py-0.5 rounded-full text-[10px] font-black ${getAccountStatusColor(selectedShop.members[0]?.user?.accountStatus || "")}`}>
                      {accountStatusLabel(selectedShop.members[0]?.user?.accountStatus || "")}
                    </span>
                  </p>
                </div>
                <button onClick={() => setShowManageModal(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400"><X size={20} /></button>
              </div>

              {/* Real stats */}
              <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-2xl bg-slate-50">
                {[
                  { label: "إجمالي التذاكر", val: selectedShop._count?.tickets || 0 },
                  { label: "الطوابير النشطة", val: selectedShop._count?.queues || 0 },
                  { label: "الموظفين", val: selectedShop._count?.members || 0 },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xl font-black text-slate-900">{s.val}</div>
                    <div className="text-[10px] text-slate-400 font-bold">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Account Actions */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">حالة الحساب</h3>
                  {selectedShop.members[0]?.user?.accountStatus === "PENDING" && (
                    <button onClick={() => handleAction("APPROVE")} disabled={actionLoading}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all font-black text-sm">
                      <UserCheck size={20} /> تفعيل الحساب والموافقة
                    </button>
                  )}
                  {selectedShop.members[0]?.user?.accountStatus === "SUSPENDED" && (
                    <button onClick={() => handleAction("REACTIVATE")} disabled={actionLoading}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all font-black text-sm">
                      <LogIn size={20} /> إعادة تفعيل الحساب
                    </button>
                  )}
                  {selectedShop.members[0]?.user?.accountStatus === "ACTIVE" && (
                    <button onClick={() => handleAction("SUSPEND")} disabled={actionLoading}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all font-black text-sm">
                      <ShieldAlert size={20} /> تعليق الحساب مؤقتاً
                    </button>
                  )}
                  <button
                    onClick={() => { if (confirm("هل أنت متأكد من حذف المحل؟")) handleAction("DELETE_SHOP"); }}
                    disabled={actionLoading}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-red-100 bg-red-50 text-red-700 hover:bg-red-100 transition-all font-black text-sm">
                    <Trash2 size={20} /> حذف المحل نهائياً
                  </button>
                </div>

                {/* Subscription Actions */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">إدارة الاشتراك</h3>

                  {/* Trial */}
                  <div className="p-4 rounded-2xl border-2 border-blue-100 bg-blue-50 space-y-2">
                    <div className="text-sm font-black text-blue-700 flex items-center gap-2"><Zap size={16} /> تفعيل فترة تجريبية</div>
                    <div className="flex items-center gap-2">
                      <input type="number" min={1} max={90} value={trialDays} onChange={e => setTrialDays(+e.target.value)}
                        className="input flex-1 py-2 text-sm" placeholder="عدد الأيام" />
                      <button onClick={() => handleAction("ACTIVATE_TRIAL", { days: trialDays })} disabled={actionLoading}
                        className="btn btn-primary px-4 py-2 text-sm">تفعيل</button>
                    </div>
                  </div>

                  {/* Extend */}
                  <div className="p-4 rounded-2xl border-2 border-purple-100 bg-purple-50 space-y-2">
                    <div className="text-sm font-black text-purple-700 flex items-center gap-2"><Calendar size={16} /> تمديد الاشتراك</div>
                    <div className="flex items-center gap-2">
                      <input type="number" min={1} max={365} value={customDays} onChange={e => setCustomDays(+e.target.value)}
                        className="input flex-1 py-2 text-sm" placeholder="عدد الأيام" />
                      <button onClick={() => handleAction("EXTEND", { days: customDays })} disabled={actionLoading}
                        className="btn py-2 px-4 text-sm bg-purple-500 text-white hover:bg-purple-600 rounded-xl font-black">تمديد</button>
                    </div>
                  </div>

                  {/* Custom end date */}
                  <div className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 space-y-2">
                    <div className="text-sm font-black text-slate-700 flex items-center gap-2"><Calendar size={16} /> تحديد تاريخ انتهاء</div>
                    <div className="flex items-center gap-2">
                      <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)}
                        className="input flex-1 py-2 text-sm" />
                      <button onClick={() => handleAction("SET_END_DATE", { endDate: customEndDate })} disabled={actionLoading || !customEndDate}
                        className="btn btn-secondary py-2 px-4 text-sm">تحديد</button>
                    </div>
                  </div>

                  {/* End Trial */}
                  {selectedShop.subscription?.isTrial && (
                    <button onClick={() => handleAction("END_TRIAL")} disabled={actionLoading}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-orange-100 bg-orange-50 text-orange-700 hover:bg-orange-100 transition-all font-black text-sm">
                      <Power size={20} /> إنهاء فترة التجربة الآن
                    </button>
                  )}

                  {/* Reset */}
                  <button onClick={() => handleAction("RESET_SUBSCRIPTION")} disabled={actionLoading}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-600 hover:bg-slate-100 transition-all font-black text-sm">
                    <RotateCcw size={20} /> إعادة ضبط الاشتراك
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <button onClick={() => setShowManageModal(false)} className="btn btn-secondary w-full py-3">إغلاق</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Plan Modal */}
      <AnimatePresence>
        {showAssignModal && selectedShop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="card max-w-xl w-full p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900">تفعيل خطة لـ {selectedShop.name}</h2>
                <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <div className="grid gap-4">
                {plans.map(plan => (
                  <button key={plan.id} onClick={() => handleAssignPlan(plan.id)} disabled={actionLoading}
                    className="w-full flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all text-right group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <Zap size={20} />
                      </div>
                      <div>
                        <div className="font-black text-slate-900">{plan.name}</div>
                        <div className="text-[10px] font-bold text-slate-400">{plan.description}</div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-black text-blue-600">{plan.price.toLocaleString()} {plan.currencySymbol || 'ر.س'}</div>
                      <div className="text-[10px] uppercase font-black text-slate-400">{plan.billingCycle || plan.interval}</div>
                    </div>
                  </button>
                ))}
                {plans.length === 0 && <p className="text-center text-slate-400 py-8 font-bold">لا توجد خطط مضافة</p>}
              </div>
              <div className="mt-6">
                <button onClick={() => setShowAssignModal(false)} className="btn btn-secondary w-full py-4">إلغاء</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
