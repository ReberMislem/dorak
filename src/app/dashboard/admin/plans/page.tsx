"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit3, Trash2, CheckCircle2, XCircle,
  Loader2, DollarSign, Tag,
  LayoutGrid, Star, Save, X, ArrowUpDown,
  Link as LinkIcon, Percent, Clock
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

type Plan = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  currencyCode: string;
  currencySymbol: string;
  billingCycle: "MONTHLY" | "YEARLY";
  discountType: "PERCENTAGE" | "FIXED" | "NONE";
  discountValue: number;
  finalPrice: number;
  trialDays: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const initialFormState = {
    name: "",
    slug: "",
    description: "",
    price: 0,
    currencyCode: "SAR",
    currencySymbol: "ر.س",
    billingCycle: "MONTHLY",
    discountType: "NONE",
    discountValue: 0,
    trialDays: 0,
    features: [] as string[],
    isPopular: false,
    isActive: true,
    sortOrder: 0,
  };

  const [form, setForm] = useState(initialFormState);
  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/plans");
      setPlans(res.data.data || []);
    } catch { toast.error("فشل في جلب الباقات"); }
    finally { setLoading(false); }
  };

  const openModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setForm({
        ...plan,
        description: plan.description || "",
        features: plan.features || [],
      });
    } else {
      setEditingPlan(null);
      setForm(initialFormState);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setForm(initialFormState);
    setFeatureInput("");
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setForm({ ...form, features: [...form.features, featureInput.trim()] });
    setFeatureInput("");
  };

  const removeFeature = (index: number) => {
    setForm({ ...form, features: form.features.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingPlan) {
        await axios.patch(`/api/admin/plans/${editingPlan.id}`, form);
        toast.success("تم تحديث الباقة بنجاح");
      } else {
        await axios.post("/api/admin/plans", form);
        toast.success("تم إنشاء الباقة بنجاح");
      }
      closeModal();
      fetchPlans();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ ما");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الباقة؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/admin/plans/${id}`);
      toast.success("تم حذف الباقة بنجاح");
      fetchPlans();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "فشل حذف الباقة");
    } finally { setDeletingId(null); }
  };

  const toggleActive = async (plan: Plan) => {
    try {
      await axios.patch(`/api/admin/plans/${plan.id}`, { isActive: !plan.isActive });
      toast.success(plan.isActive ? "تم تعطيل الباقة" : "تم تفعيل الباقة");
      fetchPlans();
    } catch { toast.error("حدث خطأ"); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-text-muted font-black italic">جاري تحميل باقات الاشتراك...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 lg:pb-8 px-4 sm:px-0" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text tracking-tight flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/10 shadow-sm">
              <Tag className="w-8 h-8 text-primary" />
            </div>
            إدارة باقات الاشتراك
          </h1>
          <p className="text-text-muted mt-2 font-medium italic">تحكم في الأسعار، الخصومات، والميزات لكل باقة</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary h-12 px-8 shadow-glow gap-2 rounded-2xl">
          <Plus size={20} />
          إنشاء باقة جديدة
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <motion.div 
            layout
            key={plan.id} 
            className={cn(
              "card p-10 flex flex-col group transition-all duration-500",
              plan.isPopular ? "border-primary shadow-glow ring-1 ring-primary/10" : "hover:border-primary/30",
              !plan.isActive && "opacity-60 grayscale-[0.5]"
            )}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-primary-foreground text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">
                الأكثر رواجاً
              </div>
            )}
            
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-text group-hover:text-primary transition-colors">{plan.name}</h3>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">{plan.slug}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => openModal(plan)} className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all shadow-sm border border-border">
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(plan.id)} 
                  disabled={deletingId === plan.id}
                  className="w-10 h-10 rounded-xl bg-danger/5 flex items-center justify-center text-danger hover:bg-danger hover:text-white transition-all shadow-sm border border-danger/10"
                >
                  {deletingId === plan.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>

            <div className="mb-10">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-text tracking-tighter">{plan.finalPrice.toLocaleString()}</span>
                <span className="text-sm font-black text-text-muted">{plan.currencySymbol}</span>
                <span className="text-xs font-black text-text-muted opacity-60">/ {plan.billingCycle === 'MONTHLY' ? 'شهر' : 'سنة'}</span>
              </div>
              {plan.discountType !== 'NONE' && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-bold text-text-muted line-through decoration-danger/30">
                    {plan.price.toLocaleString()} {plan.currencySymbol}
                  </span>
                  <span className="badge-premium bg-success/10 text-success border-success/20">
                    وفر {plan.discountType === 'PERCENTAGE' ? `${plan.discountValue}%` : `${plan.discountValue} ${plan.currencySymbol}`}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-10 flex-1">
              {(plan.features || []).slice(0, 5).map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-text font-bold">
                  <div className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                    <CheckCircle2 size={12} strokeWidth={3} />
                  </div>
                  <span className="truncate">{f}</span>
                </div>
              ))}
              {(plan.features || []).length > 5 && (
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-4">+{(plan.features || []).length - 5} ميزات احترافية إضافية</p>
              )}
            </div>

            <div className="pt-8 border-t border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", plan.isActive ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-text-muted/30")} />
                <span className="text-xs font-black text-text-muted uppercase tracking-widest">{plan.isActive ? 'نشطة حالياً' : 'باقة معطلة'}</span>
              </div>
              <button 
                onClick={() => toggleActive(plan)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black transition-all border",
                  plan.isActive 
                    ? "bg-surface text-text-muted border-border hover:bg-surface-2" 
                    : "bg-success text-white border-success shadow-lg shadow-success/20 hover:scale-105"
                )}
              >
                {plan.isActive ? 'تعطيل' : 'تفعيل الآن'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>


      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-black text-slate-900">{editingPlan ? 'تعديل الباقة' : 'إنشاء باقة جديدة'}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700">اسم الباقة</label>
                    <div className="relative">
                      <LayoutGrid className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        required className="input pr-10" placeholder="مثلاً: الباقة الاحترافية"
                        value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700">الرابط الفريد (Slug)</label>
                    <div className="relative">
                      <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        required className="input pr-10" placeholder="pro-plan"
                        value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700">وصف الباقة</label>
                  <textarea 
                    className="input min-h-[80px] py-3" placeholder="وصف قصير للميزات الرئيسية..."
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                {/* Pricing & Currency */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700">السعر</label>
                    <div className="relative">
                      <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="number" required className="input pr-10"
                        value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700">العملة</label>
                    <input 
                      required className="input text-center" placeholder="SAR"
                      value={form.currencyCode} onChange={e => setForm({ ...form, currencyCode: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700">رمز العملة</label>
                    <input 
                      required className="input text-center" placeholder="ر.س"
                      value={form.currencySymbol} onChange={e => setForm({ ...form, currencySymbol: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700">دورة الفوترة</label>
                    <select 
                      className="input text-center"
                      value={form.billingCycle} onChange={e => setForm({ ...form, billingCycle: e.target.value as any })}
                    >
                      <option value="MONTHLY">شهرياً</option>
                      <option value="YEARLY">سنوياً</option>
                    </select>
                  </div>
                </div>

                {/* Discount System */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag size={18} className="text-blue-500" />
                    <h4 className="font-black text-slate-900 text-sm">نظام الخصومات</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-600">نوع الخصم</label>
                      <select 
                        className="input"
                        value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value as any })}
                      >
                        <option value="NONE">بدون خصم</option>
                        <option value="PERCENTAGE">نسبة مئوية (%)</option>
                        <option value="FIXED">مبلغ ثابت</option>
                      </select>
                    </div>
                    {form.discountType !== 'NONE' && (
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-600">قيمة الخصم</label>
                        <div className="relative">
                          {form.discountType === 'PERCENTAGE' ? <Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /> : <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />}
                          <input 
                            type="number" className="input pr-10"
                            value={form.discountValue} onChange={e => setForm({ ...form, discountValue: parseFloat(e.target.value) })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trial & Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700">فترة التجربة (أيام)</label>
                    <div className="relative">
                      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="number" className="input pr-10"
                        value={form.trialDays} onChange={e => setForm({ ...form, trialDays: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700">ترتيب الظهور</label>
                    <div className="relative">
                      <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="number" className="input pr-10"
                        value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700">ميزات الباقة</label>
                  <div className="flex gap-2">
                    <input 
                      className="input" placeholder="مثلاً: فروع غير محدودة"
                      value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <button type="button" onClick={addFeature} className="btn btn-secondary px-4">
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.features.map((f, i) => (
                      <span key={i} className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
                        {f}
                        <button type="button" onClick={() => removeFeature(i)} className="hover:text-red-500">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600"
                      checked={form.isPopular} onChange={e => setForm({ ...form, isPopular: e.target.checked })}
                    />
                    <span className="text-sm font-bold text-slate-700">باقة مميزة (Featured)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600"
                      checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <span className="text-sm font-bold text-slate-700">تفعيل الباقة فوراً</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white">
                  <button type="submit" disabled={submitting} className="btn btn-primary flex-1 py-4 font-black gap-2">
                    {submitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {editingPlan ? 'حفظ التغييرات' : 'إنشاء الباقة'}
                  </button>
                  <button type="button" onClick={closeModal} className="btn btn-secondary px-8">إلغاء</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
