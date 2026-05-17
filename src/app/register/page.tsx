"use client";
// ============================================
// دورك - صفحة إنشاء حساب جديد
// ============================================

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { 
  User, Mail, Lock, Phone, Store, Loader2, 
  ArrowRight, CheckCircle2, Scissors, UtensilsCrossed, 
  Stethoscope, Car, Sparkles, LayoutGrid 
} from "lucide-react";
import { SHOP_CATEGORIES } from "@/constants";
import axios, { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { ShopCategory } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    shopName: "",
    shopCategory: "OTHER" as ShopCategory,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post("/api/auth/register", formData);
      if (res.data.success) {
        toast.success("تم إنشاء حسابك بنجاح! جاري تحويلك...");
        router.push("/dashboard");
      }
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.error : "حدث خطأ أثناء التسجيل";
      toast.error(message || "حدث خطأ أثناء التسجيل");
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (value: string) => {
    switch (value) {
      case "BARBERSHOP": return <Scissors size={18} />;
      case "RESTAURANT": return <UtensilsCrossed size={18} />;
      case "CLINIC": return <Stethoscope size={18} />;
      case "CAR_WASH": return <Car size={18} />;
      case "BEAUTY_SALON": return <Sparkles size={18} />;
      default: return <LayoutGrid size={18} />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background overflow-hidden relative">
      {/* Premium SaaS Background Glow */}
      <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2 -z-10 opacity-60" />
      <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full translate-y-1/2 translate-x-1/2 -z-10 opacity-40" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[680px] relative"
      >
        <div className="text-center mb-10 flex flex-col items-center">
          <Logo size="lg" className="mb-8 hover:scale-105 transition-transform duration-500" showText={true} />
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">ابدأ مع دورك مجاناً</h1>
          <p className="text-muted-foreground font-bold text-base">انضم لأكثر من 500 محل يديرون طوابيرهم بذكاء واحترافية</p>
        </div>

        <div className="card overflow-hidden shadow-2xl border-border/50">
          {/* Progress Header */}
          <div className="flex border-b border-border bg-surface-2/50 p-1.5 gap-1.5">
            <div className={`flex-1 py-4 text-center text-xs sm:text-sm font-bold transition-all rounded-xl relative ${step === 1 ? 'bg-surface text-primary shadow-sm border border-border/50' : 'text-muted-foreground opacity-60'}`}>
              <div className="flex items-center justify-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>1</span>
                الحساب الشخصي
              </div>
            </div>
            <div className={`flex-1 py-4 text-center text-xs sm:text-sm font-bold transition-all rounded-xl relative ${step === 2 ? 'bg-surface text-primary shadow-sm border border-border/50' : 'text-muted-foreground opacity-60'}`}>
              <div className="flex items-center justify-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>2</span>
                بيانات المحل
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {step === 1 ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-foreground/80 px-1">الاسم الكامل</label>
                      <div className="relative group">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                        <input
                          type="text"
                          required
                          className="input pr-12 h-14 font-semibold text-base"
                          placeholder="أحمد محمد"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-foreground/80 px-1">البريد الإلكتروني</label>
                      <div className="relative group">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                        <input
                          type="email"
                          required
                          className="input pr-12 h-14 font-semibold text-base"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-foreground/80 px-1">كلمة المرور</label>
                    <div className="relative group">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                      <input
                        type="password"
                        required
                        className="input pr-12 h-14 font-semibold tracking-widest text-base"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                    <div className="p-4 rounded-2xl bg-success/5 border border-success/10 flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-success shrink-0" />
                      <p className="text-[11px] text-success/80 font-bold uppercase tracking-wider">يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير ورقم</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-foreground/80 px-1">رقم الهاتف (اختياري)</label>
                    <div className="relative group">
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                      <input
                        type="tel"
                        className="input pr-12 h-14 font-semibold text-left text-base"
                        placeholder="+966 5X XXX XXXX"
                        dir="ltr"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-10"
                >
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-foreground/80 px-1">اسم المحل / النشاط التجاري</label>
                    <div className="relative group">
                      <Store className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                      <input
                        type="text"
                        required
                        className="input pr-12 h-14 font-semibold text-base"
                        placeholder="مثلاً: صالون الأناقة"
                        value={formData.shopName}
                        onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="text-sm font-bold text-foreground/80 px-1">تصنيف النشاط</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {SHOP_CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, shopCategory: cat.value })}
                          className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all gap-4 group ${
                            formData.shopCategory === cat.value
                              ? 'border-primary bg-primary/5 shadow-glow scale-[1.02]'
                              : 'border-border bg-surface hover:border-primary/20 hover:bg-surface-2 shadow-sm'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${formData.shopCategory === cat.value ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-2 text-muted-foreground group-hover:text-primary'}`}>
                            {getCategoryIcon(cat.value)}
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-widest">{cat.labelAr}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-6 pt-6">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn btn-secondary flex-1 h-14 font-bold text-lg"
                  >
                    السابق
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary flex-[2] h-14 text-lg font-bold shadow-glow gap-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      {step === 1 ? "الخطوة التالية" : "إنشاء الحساب والبدء مجاناً"}
                      <ArrowRight size={22} className="rotate-180" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground font-bold">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="text-primary font-extrabold hover:underline underline-offset-4 transition-all">
            تسجيل الدخول
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
