"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Check, Zap, Star, Shield, ArrowRight, 
  Loader2, Clock, Info, Globe, HelpCircle,
  ArrowLeft, MessageCircle, Mail, Camera
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { Logo } from "@/components/ui/Logo";
import { Navbar } from "@/components/ui/Navbar";

const PRICING_FAQS = [
  {
    q: "هل يمكنني تغيير خطتي لاحقاً؟",
    a: "نعم، يمكنك الترقية أو تغيير خطتك في أي وقت من إعدادات الحساب."
  },
  {
    q: "ما هي طرق الدفع المتاحة؟",
    a: "ندعم جميع البطاقات الائتمانية الرئيسية ومدى وApple Pay."
  },
  {
    q: "هل هناك أي رسوم خفية؟",
    a: "لا توجد رسوم خفية. الأسعار الموضحة هي ما ستدفعه فقط."
  },
  {
    q: "هل توفرون خصومات للمؤسسات الكبيرة؟",
    a: "نعم، للمنشآت التي لديها أكثر من 10 فروع، يرجى التواصل معنا للحصول على عرض مخصص."
  }
];

type Plan = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  finalPrice: number;
  currencySymbol: string;
  billingCycle: "MONTHLY" | "YEARLY";
  discountType: string;
  discountValue: number;
  trialDays: number;
  features: string[];
  isPopular: boolean;
};

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get("/api/plans");
        if (res.data.success) {
          setPlans(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch plans", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const filteredPlans = plans.filter(p => p.billingCycle === billingCycle);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        {/* Modern SaaS Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full opacity-40" />
          <div className="absolute bottom-[10%] right-[-20%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full opacity-20" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-8 uppercase tracking-wider">
            خطط أسعار مرنة لكل الأعمال
          </div>
          <h1 className="mb-6 leading-tight">
            اختر الباقة المناسبة <br />
            <span className="gradient-text">لنمو عملك</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium mb-12 max-w-2xl mx-auto">
            انضم لآلاف الشركات التي تثق بـ دورك لإدارة طوابير الانتظار بذكاء واحترافية عالية.
          </p>

          {/* Billing Toggle (Modern Stripe Style) */}
          <div className="flex items-center justify-center gap-2 mb-20 p-1.5 bg-surface-2 rounded-2xl border border-border w-fit mx-auto shadow-sm">
            <button 
              onClick={() => setBillingCycle("MONTHLY")}
              className={`px-8 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                billingCycle === 'MONTHLY' 
                ? 'bg-surface text-foreground shadow-md' 
                : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              شهرياً
            </button>
            <button 
              onClick={() => setBillingCycle("YEARLY")}
              className={`px-8 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                billingCycle === 'YEARLY' 
                ? 'bg-surface text-foreground shadow-md' 
                : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              سنوياً
              <span className="bg-success/10 text-success text-[10px] px-2 py-0.5 rounded-full border border-success/20">
                وفر 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="card p-10 h-[600px] animate-shimmer bg-surface/50 border-transparent" />
            ))
          ) : (
            filteredPlans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`card p-10 flex flex-col relative transition-all duration-500 group ${
                  plan.isPopular ? 'border-primary shadow-glow ring-1 ring-primary/20' : 'hover:border-primary/30 shadow-md'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                    الأكثر طلباً
                  </div>
                )}

                <div className="mb-10 text-right">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed min-h-[48px]">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-10 text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-5xl font-extrabold tracking-tight text-foreground">{plan.finalPrice.toLocaleString()}</span>
                    <span className="text-lg font-bold text-muted-foreground">{plan.currencySymbol}</span>
                    <span className="text-sm text-muted-foreground font-semibold">/ {billingCycle === 'MONTHLY' ? 'شهر' : 'سنة'}</span>
                  </div>
                  {plan.discountType !== 'NONE' && (
                    <div className="flex items-center gap-2 mt-4 justify-end">
                      <span className="text-sm text-muted-foreground line-through font-bold opacity-50">
                        {plan.price.toLocaleString()} {plan.currencySymbol}
                      </span>
                      <span className="badge-premium bg-success/10 text-success border-success/20 px-3">
                        وفر {plan.discountType === 'PERCENTAGE' ? `${plan.discountValue}%` : `${plan.discountValue} ${plan.currencySymbol}`}
                      </span>
                    </div>
                  )}
                </div>

                {plan.trialDays > 0 && (
                  <div className="mb-8 flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 text-primary text-sm font-bold">
                    <Clock size={18} />
                    تجربة مجانية لمدة {plan.trialDays} أيام
                  </div>
                )}

                <div className="space-y-4 mb-12 flex-1">
                  {(plan.features || []).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-4 text-sm font-semibold text-foreground/80">
                      <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} strokeWidth={3} className="text-success" />
                      </div>
                      <span className="text-right leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link 
                  href={`/register?plan=${plan.slug}`}
                  className={`btn h-14 text-lg w-full transition-all duration-300 ${
                    plan.isPopular ? 'btn-primary shadow-glow' : 'btn-secondary'
                  }`}
                >
                  ابدأ الآن
                  <ArrowLeft size={20} className="mr-2" />
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-py container-px border-t border-border bg-surface-2/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4">الأسئلة الشائعة</h2>
            <p className="text-muted-foreground font-bold">كل ما تحتاج معرفته عن باقات دورك</p>
          </div>

          <div className="space-y-4">
            {PRICING_FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-8 hover:border-primary/30 transition-all duration-300 shadow-sm"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-4 text-foreground">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <HelpCircle size={18} />
                  </div>
                  {faq.q}
                </h3>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed pr-12">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 container-px border-t border-border bg-background">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-12">
          <Logo showText={true} size="lg" />
          <div className="flex items-center gap-10 text-sm font-bold text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <Link href="/#features" className="hover:text-primary transition-colors">الميزات</Link>
            <a href="https://wa.me/966500000000" target="_blank" rel="noopener" className="hover:text-success transition-colors">الدعم الفني</a>
          </div>
        </div>
        <div className="pt-10 border-t border-border text-center text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} دورك للحلول التقنية - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}
