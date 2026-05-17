"use client";
// ============================================
// دورك - Landing Page (الصفحة الرئيسية)
// ============================================

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Logo } from "@/components/ui/Logo";
import { Navbar } from "@/components/ui/Navbar";
import { useAuth } from "@/components/providers/AuthProvider";
import { ChatBot } from "@/components/ui/ChatBot";
import {
  Clock, QrCode, Bell, BarChart3, Shield, Zap,
  Scissors, UtensilsCrossed, Stethoscope, Car, Sparkles,
  ArrowLeft, CheckCircle, Star, Users, TrendingUp,
  Camera, MessageCircle, Phone, Mail, Check,
  ChevronDown, Smartphone, Layout, MousePointer2,
  ShieldCheck, SmartphoneIcon, Globe,
  HelpCircle
} from "lucide-react";

const HOW_IT_WORKS = [
  {
    step: "01",
    titleAr: "اطبع كود QR",
    descAr: "قم بتحميل كود QR الخاص بمحلك من لوحة التحكم واطبعه في مكان واضح.",
    icon: MousePointer2,
    color: "bg-blue-500"
  },
  {
    step: "02",
    titleAr: "العميل يمسح الكود",
    descAr: "بمجرد وصول العميل، يمسح الكود بكاميرا هاتفه دون الحاجة لتحميل أي تطبيق.",
    icon: Smartphone,
    color: "bg-purple-500"
  },
  {
    step: "03",
    titleAr: "متابعة الدور",
    descAr: "يحصل العميل على رقم وينتظر دوره براحة، مع إشعارات مباشرة عند اقتراب دوره.",
    icon: Layout,
    color: "bg-emerald-500"
  }
];

const FAQS = [
  {
    q: "هل يحتاج العميل لتحميل تطبيق؟",
    a: "لا، الخدمة تعمل بالكامل من خلال المتصفح على هاتف العميل بمجرد مسح كود QR."
  },
  {
    q: "كيف يتم تنبيه العميل؟",
    a: "يظهر للعميل صفحة حية تحدث نفسها تلقائياً، بالإضافة إلى إشعارات المتصفح والرسائل التنبيهية."
  },
  {
    q: "هل يمكنني تجربة الخدمة مجاناً؟",
    a: "نعم، نوفر خطة مجانية تتيح لك تجربة كافة الميزات الأساسية والتحقق من جودة الخدمة."
  },
  {
    q: "هل يدعم النظام اللغة العربية؟",
    a: "بالتأكيد، النظام مصمم بالكامل باللغة العربية ليتناسب مع احتياجات السوق المحلي."
  }
];
import { useEffect, useState } from "react";
import axios from "axios";

const FEATURES = [
  {
    icon: QrCode,
    titleAr: "مسح QR فوري",
    descAr: "العميل يمسح الكود ويحصل على رقمه مباشرة بدون تحميل أي تطبيق",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Clock,
    titleAr: "وقت انتظار دقيق",
    descAr: "احسب الوقت المتوقع لدورك بدقة عالية بناءً على متوسط الخدمة",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Bell,
    titleAr: "إشعارات لحظية",
    descAr: "إشعار فوري عند اقتراب دورك حتى لا تفوتك لحظة",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: BarChart3,
    titleAr: "إحصائيات متقدمة",
    descAr: "لوحة تحكم احترافية مع تقارير يومية وأوقات الذروة",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Shield,
    titleAr: "آمن ومحمي",
    descAr: "أمان على مستوى المؤسسات مع تشفير كامل وحماية البيانات",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: Zap,
    titleAr: "سريع للغاية",
    descAr: "منصة مُحسَّنة للسرعة القصوى مع تحديثات فورية",
    color: "from-cyan-500 to-sky-600",
  },
];

const SHOP_TYPES = [
  { icon: Scissors, labelAr: "صالونات الحلاقة", color: "#4287f5" },
  { icon: UtensilsCrossed, labelAr: "المطاعم", color: "#8b5cf6" },
  { icon: Stethoscope, labelAr: "العيادات", color: "#06b6d4" },
  { icon: Car, labelAr: "مغاسل السيارات", color: "#10b981" },
  { icon: Sparkles, labelAr: "صالونات التجميل", color: "#f59e0b" },
];

const STATS = [
  { value: "10,000+", labelAr: "عميل يومياً", icon: Users },
  { value: "500+", labelAr: "محل مشترك", icon: Star },
  { value: "98%", labelAr: "رضا العملاء", icon: TrendingUp },
  { value: "< 3ث", labelAr: "سرعة الانضمام", icon: Zap },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function LandingPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

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
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-background text-text overflow-hidden selection:bg-primary/30" dir="rtl">
      <Navbar />
      
      {/* Hero Section - Rebuilt for World-Class SaaS */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 px-6 overflow-hidden">
        {/* Advanced Lighting & Mesh Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-info/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-primary/10 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-2 border border-border mb-10 shadow-sm group cursor-pointer hover:border-primary/30 transition-all">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="text-xs font-black uppercase tracking-widest text-text-muted group-hover:text-primary transition-colors">نسخة المطورين 2.0 متوفرة الآن</span>
              <ChevronDown size={14} className="text-text-muted rotate-180 group-hover:translate-x-[-2px] transition-transform" />
            </div>
            
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-text leading-[1.05] mb-8">
              نظم طوابير عملائك <br />
              <span className="gradient-text">بذكاء عالمي.</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-text-muted font-medium mb-12 leading-relaxed italic">
              منصة دورك تحول تجربة الانتظار التقليدية إلى رحلة رقمية سلسة. 
              زد من كفاءة عملك وارفع رضا عملائك باستخدام أحدث تقنيات الـ SaaS.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link href="/register" className="btn btn-primary h-16 px-10 text-lg shadow-glow rounded-2xl group w-full sm:w-auto">
                ابدأ مجاناً الآن
                <Zap className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              <Link href="/pricing" className="btn btn-secondary h-16 px-10 text-lg rounded-2xl w-full sm:w-auto">
                شاهد الباقات
              </Link>
            </div>
            
            {/* Trusted By / Social Proof */}
            <div className="mt-24 pt-12 border-t border-border/40">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-10">موثوق من قبل الشركات التقنية الرائدة</p>
              <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                <Scissors size={32} />
                <BarChart3 size={32} />
                <Users size={32} />
                <Shield size={32} />
                <Star size={32} />
              </div>
            </div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-x-12 gap-y-6 mt-20 flex-wrap"
            >
              {[
                "لا يحتاج تطبيق",
                "مجاني للبدء",
                "إعداد في 5 دقائق",
                "دعم فني متميز",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm font-semibold text-text-muted">
                  <div className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  {item}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Preview - Stripe Style */}
      <section className="relative px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            {/* Window Frame */}
            <div className="rounded-[3rem] p-3 sm:p-4 bg-surface-2/50 border border-border shadow-2xl backdrop-blur-md relative overflow-hidden group">
              {/* Internal Glow */}
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all duration-1000" />
              
              <div className="rounded-[2.2rem] bg-surface border border-border shadow-inner overflow-hidden aspect-[16/10] sm:aspect-[16/9] relative flex flex-col">
                {/* Browser Header */}
                <div className="h-12 border-b border-border bg-surface-2/50 flex items-center px-6 justify-between shrink-0">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-danger/20" />
                    <div className="w-3 h-3 rounded-full bg-warning/20" />
                    <div className="w-3 h-3 rounded-full bg-success/20" />
                  </div>
                  <div className="px-4 py-1 rounded-lg bg-surface border border-border text-[10px] font-black text-text-muted/60 flex items-center gap-2">
                    <Shield size={10} />
                    <span>dorak.app/dashboard</span>
                  </div>
                  <div className="w-12" />
                </div>

                {/* Dashboard Content Mockup */}
                <div className="flex-1 bg-background flex overflow-hidden">
                   {/* Sidebar */}
                   <div className="w-1/5 border-l border-border bg-surface-2/30 p-6 hidden sm:flex flex-col gap-8">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Logo showText={false} size="sm" />
                      </div>
                      <div className="space-y-4">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-border/40" />
                            <div className="h-3 bg-border/20 rounded-full flex-1" />
                          </div>
                        ))}
                      </div>
                      <div className="mt-auto h-12 bg-border/10 rounded-xl" />
                   </div>

                   {/* Main Content */}
                   <div className="flex-1 p-8 space-y-10 overflow-y-auto">
                      <div className="flex justify-between items-center">
                         <div className="space-y-2">
                            <div className="h-6 w-48 bg-text/5 rounded-lg" />
                            <div className="h-3 w-32 bg-text-muted/10 rounded-lg" />
                         </div>
                         <div className="w-12 h-12 rounded-full bg-surface-2 border border-border" />
                      </div>

                      <div className="grid grid-cols-3 gap-6">
                         {[
                           { color: 'primary', icon: Users },
                           { color: 'success', icon: CheckCircle },
                           { color: 'warning', icon: Clock }
                         ].map((item, i) => (
                           <div key={i} className="card p-6 bg-surface border border-border shadow-sm flex flex-col gap-4">
                              <div className={`w-10 h-10 rounded-xl bg-${item.color}/10 text-${item.color} flex items-center justify-center`}>
                                <item.icon size={20} />
                              </div>
                              <div className="space-y-2">
                                <div className="h-5 w-16 bg-text/5 rounded-md" />
                                <div className="h-3 w-10 bg-text-muted/10 rounded-md" />
                              </div>
                           </div>
                         ))}
                      </div>

                      {/* Large Chart Mockup */}
                      <div className="card p-8 bg-surface border border-border shadow-sm relative overflow-hidden">
                         <div className="flex justify-between mb-10">
                            <div className="h-4 w-32 bg-text/5 rounded-md" />
                            <div className="h-4 w-20 bg-primary/10 rounded-md" />
                         </div>
                         <div className="h-48 flex items-end gap-3 px-2">
                            {[40, 70, 45, 90, 65, 80, 50, 85, 60, 95, 75, 100].map((h, i) => (
                              <motion.div 
                                key={i}
                                initial={{ height: 0 }}
                                whileInView={{ height: `${h}%` }}
                                transition={{ delay: i * 0.05, duration: 1 }}
                                className="flex-1 bg-primary/10 rounded-t-lg hover:bg-primary/30 transition-colors relative group"
                              >
                                 {i === 11 && <div className="absolute inset-0 bg-primary rounded-t-lg shadow-glow" />}
                              </motion.div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Floating Blobs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -z-10 animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-info/10 blur-[100px] rounded-full -z-10 animate-pulse" style={{ animationDelay: '2s' }} />
          </motion.div>
        </div>
      </section>


      {/* ---- Stats ---- */}
      <section className="section-py container-px">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.labelAr}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="card p-8 text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-5 mx-auto group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <stat.icon size={24} />
              </div>
              <div className="text-3xl font-extrabold mb-1 tracking-tight text-foreground">{stat.value}</div>
              <div className="text-sm font-bold text-muted-foreground">{stat.labelAr}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---- Shop Types ---- */}
      <section className="section-py container-px bg-surface-2/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4"
          >
            يناسب كل أنواع المحلات
          </motion.h2>
          <p className="text-muted-foreground mb-12 text-lg font-medium">
            مصمم خصيصاً للمحلات الخدمية في السوق العربي
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {SHOP_TYPES.map((type, i) => (
              <motion.div
                key={type.labelAr}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="card px-6 py-4 flex items-center gap-4 cursor-default hover:border-primary/40 group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ background: `${type.color}15` }}
                >
                  <type.icon size={20} style={{ color: type.color }} />
                </div>
                <span className="font-bold text-base">{type.labelAr}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section id="how-it-works" className="section-py container-px bg-background">
        <div className="max-w-4xl mx-auto text-center mb-16 sm:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary font-bold text-sm uppercase tracking-widest mb-4"
          >
            بسيط وفعال
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            كيف يعمل دورك؟
          </motion.h2>
          <p className="text-muted-foreground text-lg font-medium">
            ثلاث خطوات بسيطة تفصلك عن تنظيم طوابير الانتظار في محلك
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connector Lines (Desktop) */}
          <div className="hidden md:block absolute top-[40px] left-0 w-full h-0.5 bg-border -z-10" />
          
          {HOW_IT_WORKS.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className={`w-20 h-20 rounded-[2rem] ${item.color} text-white flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                <item.icon size={32} />
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-surface border border-border text-foreground font-bold text-xs flex items-center justify-center shadow-sm">
                  {item.step}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4">{item.titleAr}</h3>
              <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-[250px]">
                {item.descAr}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---- Features ---- */}
      <section id="features" className="section-py container-px">
        <div className="text-center mb-16 sm:mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4"
          >
            كل ما تحتاجه في مكان واحد
          </motion.h2>
          <p className="text-muted-foreground text-lg font-medium">
            ميزات قوية لتحويل تجربة الانتظار في محلك
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.titleAr}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="card p-10 group"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}
              >
                <feature.icon size={26} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">{feature.titleAr}</h3>
              <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
                {feature.descAr}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---- Pricing Plans ---- */}
      <section id="pricing" className="section-py container-px bg-surface-2/30 relative overflow-hidden">
        {/* Decorative Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto text-center mb-16 sm:mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4"
          >
            خطط أسعار تناسب نمو عملك
          </motion.h2>
          <p className="text-muted-foreground text-lg font-medium">
            اختر الخطة المناسبة وابدأ في تحسين تجربة عملائك اليوم
          </p>
        </div>

        {loadingPlans ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`card p-10 flex flex-col relative group transition-all duration-500 ${
                  plan.isPopular ? 'border-primary shadow-glow ring-1 ring-primary/20' : 'hover:border-primary/30'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg">
                    الأكثر رواجاً
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold tracking-tight text-foreground">{plan.finalPrice.toLocaleString()}</span>
                    <span className="text-sm font-bold text-muted-foreground">{plan.currencySymbol} / {plan.billingCycle === 'YEARLY' ? 'سنة' : 'شهر'}</span>
                  </div>
                </div>
                
                {plan.discountType !== 'NONE' && (
                  <div className="flex items-center gap-2 mb-8">
                    <span className="text-sm text-muted-foreground line-through font-bold opacity-60">
                      {plan.price.toLocaleString()} {plan.currencySymbol}
                    </span>
                    <span className="badge-premium bg-success/10 text-success border-success/20 px-3">
                      وفر {plan.discountType === 'PERCENTAGE' ? `${plan.discountValue}%` : `${plan.discountValue} ${plan.currencySymbol}`}
                    </span>
                  </div>
                )}

                {plan.trialDays > 0 && (
                  <div className="mb-8 flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 text-primary text-sm font-bold">
                    <Clock size={18} />
                    تجربة مجانية لمدة {plan.trialDays} أيام
                  </div>
                )}

                <ul className="space-y-4 mb-12 flex-1">
                  {(plan.features || []).map((feat: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-sm font-semibold text-foreground/80">
                      <div className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link 
                  href={`/register?plan=${plan.slug}`} 
                  className={`btn h-12 text-base w-full ${plan.isPopular ? 'btn-primary shadow-glow' : 'btn-secondary'}`}
                >
                  ابدأ الآن
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ---- FAQ Section ---- */}
      <section className="section-py container-px bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4">الأسئلة الشائعة</h2>
            <p className="text-muted-foreground font-bold text-lg">كل ما تحتاج معرفته عن دورك</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-8 cursor-default hover:border-primary/30 transition-all duration-300"
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

      {/* ---- Contact Section ---- */}
      <section id="contact" className="section-py container-px border-t border-border">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="max-w-xl">
            <h2 className="mb-6">تواصل معنا</h2>
            <p className="text-lg text-muted-foreground mb-12 font-medium leading-relaxed">
              لديك استفسار حول الخطط أو تحتاج إلى حل مخصص لمنشأتك؟ فريقنا مستعد للإجابة على جميع تساؤلاتك.
            </p>

            <div className="space-y-4">
              <a
                href="https://wa.me/966500000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-5 p-6 rounded-[1.5rem] bg-surface border border-border group hover:border-success/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                  <MessageCircle size={28} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-success uppercase tracking-widest mb-1">واتساب مباشر</div>
                  <div className="text-lg font-bold text-foreground text-left" dir="ltr">+966 50 000 0000</div>
                </div>
              </a>

              <a
                href="https://instagram.com/dorak_app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-5 p-6 rounded-[1.5rem] bg-surface border border-border group hover:border-purple-500/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                  <Camera size={28} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-purple-500 uppercase tracking-widest mb-1">انستقرام</div>
                  <div className="text-lg font-bold text-foreground">@dorak_app</div>
                </div>
              </a>

              <div className="flex items-center gap-5 p-6 rounded-[1.5rem] bg-surface border border-border group hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                  <Mail size={28} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">البريد الإلكتروني</div>
                  <div className="text-lg font-bold text-foreground">support@dorak.sa</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-purple-500/20 blur-3xl rounded-[3rem] opacity-50 group-hover:opacity-80 transition-opacity" />
            <div className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl border border-border">
              <img
                src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80"
                alt="Support"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-10 right-10 left-10 p-8 glass rounded-2xl flex items-center gap-6 border-white/20">
                <div className="w-14 h-14 rounded-2xl bg-success text-white flex items-center justify-center shadow-lg">
                  <CheckCircle size={28} />
                </div>
                <div>
                  <div className="text-white font-bold text-xl mb-1">دعم فني متواصل</div>
                  <div className="text-white/80 text-sm font-medium">نحن معك على مدار الساعة لضمان نجاحك</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="section-py container-px">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] p-12 sm:p-24 text-center overflow-hidden shadow-2xl border border-primary/20"
        >
          <div className="absolute inset-0 gradient-primary opacity-95" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-6xl font-extrabold text-white mb-8 leading-tight">
              ابدأ اليوم واصنع الفرق في محلك
            </h2>
            <p className="text-white/90 text-lg sm:text-xl mb-12 font-medium">
              انضم إلى مئات المحلات التي طورت تجربة عملائها وزادت من كفاءة عملها مع دورك
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/register"
                className="btn bg-white text-primary h-14 px-12 text-lg shadow-2xl hover:bg-surface-2 transition-all hover:-translate-y-1"
              >
                ابدأ مجاناً الآن
                <ArrowLeft size={22} />
              </Link>
              <Link
                href="/pricing"
                className="btn bg-white/10 text-white border border-white/20 h-14 px-12 text-lg hover:bg-white/20 transition-all"
              >
                مشاهدة الباقات
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="py-20 container-px border-t border-border bg-surface-2/30">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <Logo showText={true} size="lg" className="mb-8" />
            <p className="text-muted-foreground text-base max-w-sm font-medium leading-relaxed">
              دورك هي المنصة الرائدة في الشرق الأوسط لإدارة طوابير الانتظار بذكاء، نهتم بتجربة عملائك تماماً كما تهتم بها.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-6">الروابط</h4>
            <div className="flex flex-col gap-4 text-sm font-semibold text-muted-foreground">
              <Link href="/pricing" className="hover:text-primary transition-colors">الأسعار</Link>
              <Link href="/#features" className="hover:text-primary transition-colors">الميزات</Link>
              <Link href="/#how-it-works" className="hover:text-primary transition-colors">كيف يعمل</Link>
              <Link href="/#contact" className="hover:text-primary transition-colors">تواصل معنا</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-6">قانوني</h4>
            <div className="flex flex-col gap-4 text-sm font-semibold text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary transition-colors">سياسة الخصوصية</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">شروط الاستخدام</Link>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6 text-sm font-bold text-muted-foreground">
          <p>© {new Date().getFullYear()} دورك - جميع الحقوق محفوظة لشركة دورك للحلول التقنية</p>
          <div className="flex items-center gap-8">
            <a href="https://instagram.com/dorak_app" target="_blank" rel="noopener" className="hover:text-purple-500 transition-colors">انستقرام</a>
            <a href="https://wa.me/966500000000" target="_blank" rel="noopener" className="hover:text-success transition-colors">واتساب</a>
            <a href="https://twitter.com/dorak_app" target="_blank" rel="noopener" className="hover:text-primary transition-colors">تويتر (X)</a>
          </div>
        </div>
      </footer>

      {/* ---- ChatBot ---- */}
      <ChatBot />
    </div>
  );
}
