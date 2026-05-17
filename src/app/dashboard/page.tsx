"use client";
// ============================================
// دورك - الصفحة الرئيسية للوحة التحكم (Overview)
// ============================================

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Users, Clock, CheckCircle2, 
  TrendingUp, TrendingDown, ArrowUpRight, 
  Loader2, Play, Pause, ChevronRight,
  UserCheck, Calendar, Layers, RefreshCw,
  Store, XCircle, ShieldAlert, DollarSign,
  Star, Tag, Coffee, Shield
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { cn } from "@/lib/utils";

type DashboardQueue = {
  id: string;
  name: string;
  nameAr?: string | null;
  status: "OPEN" | "PAUSED" | "CLOSED";
  waitingCount: number;
  avgServiceTime: number;
};

type DashboardStats = {
  today: {
    totalTickets: number;
    currentWaiting: number;
    completedTickets: number;
    avgWaitTime: number;
    completionRate: number;
  };
  shopStatus: {
    status: string;
    message: string;
    canRegister: boolean;
    remainingDailyLimit?: number;
    nextBreakTime?: {
      title: string;
      startTime: string;
      endTime: string;
    };
  };
  queues: DashboardQueue[];
};

export default function DashboardOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const { t, language } = useLanguage();

  const fetchStats = useCallback(async () => {
    try {
      if (user?.role === 'SUPER_ADMIN') {
        const res = await axios.get("/api/admin/analytics");
        if (res.data.success) setAdminStats(res.data.data);
      } else {
        const res = await axios.get("/api/analytics/dashboard");
        if (res.data.success) setStats(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchStats();
    }, 0);
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => {
      window.clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fetchStats]);

  const handleQueueStatus = async (queueId: string, currentStatus: string) => {
    const newStatus = currentStatus === "OPEN" ? "PAUSED" : "OPEN";
    try {
      await axios.patch(`/api/queues/${queueId}/status`, { status: newStatus });
      toast.success(
      newStatus === 'OPEN' ? t('resumeQueue') : t('pauseQueue')
    );
      await fetchStats();
    } catch {
      toast.error(t('error'));
    }
  };

  if (user?.role === 'SUPER_ADMIN' && adminStats) {
    return (
      <div className="space-y-8 sm:space-y-12 animate-fade-in" dir="rtl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-text tracking-tight flex items-center gap-4">
               <div className="p-3 bg-primary/10 rounded-2xl border border-primary/10">
                 <ShieldAlert className="w-8 h-8 text-primary" />
               </div>
               مرحباً بك، {user.name.split(' ')[0]}
            </h1>
            <p className="text-text-muted mt-2 font-medium italic">إليك نظرة شاملة على أداء منصة دورك اليوم</p>
          </div>
          <button onClick={fetchStats} className="btn btn-secondary h-12 w-12 p-0 rounded-2xl">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Admin Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {[
            { label: 'إجمالي المحلات', value: adminStats.totalShops, icon: Store, color: 'primary', bg: 'bg-primary' },
            { label: 'اشتراكات نشطة', value: adminStats.subscriptions.active, icon: CheckCircle2, color: 'success', bg: 'bg-success' },
            { label: 'اشتراكات منتهية', value: adminStats.subscriptions.expired, icon: XCircle, color: 'danger', bg: 'bg-danger' },
            { label: 'إجمالي الإيرادات', value: adminStats.revenue.toLocaleString(), icon: DollarSign, color: 'warning', bg: 'bg-warning' },
          ].map((stat, i) => (
            <div key={stat.label} className="card p-8 group hover:border-primary/30">
              <div className="flex items-start justify-between mb-8">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm",
                  stat.color === 'primary' && "bg-primary/10 text-primary border border-primary/10",
                  stat.color === 'success' && "bg-success/10 text-success border border-success/10",
                  stat.color === 'danger' && "bg-danger/10 text-danger border border-danger/10",
                  stat.color === 'warning' && "bg-warning/10 text-warning border border-warning/10",
                )}>
                  <stat.icon size={28} />
                </div>
                <div className="p-2 bg-surface-2 rounded-xl border border-border">
                  <ArrowUpRight size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                </div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-text mb-1 tracking-tighter">{stat.value}</div>
                <div className="text-[11px] font-black text-text-muted uppercase tracking-widest">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
          {/* Popular Plans */}
          <div className="lg:col-span-2 card p-8 sm:p-10">
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-black text-xl text-text flex items-center gap-3">
                <Star className="text-warning fill-warning" size={24} /> 
                الباقات الأكثر طلباً
              </h3>
              <span className="text-xs font-black text-text-muted uppercase tracking-widest">تحديث مباشر</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {adminStats.popularPlans.map((p: any, i: number) => (
                <div key={i} className="p-6 bg-surface-2 rounded-[2rem] border border-border/50 hover:border-primary/20 transition-all group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-text group-hover:text-primary transition-colors mb-1">{p.name}</div>
                      <div className="text-2xl font-black text-text">{p.count}</div>
                      <div className="text-[10px] font-bold text-text-muted uppercase mt-1">مشترك حالي</div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-border">
                       <Tag size={20} className="text-primary" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Admin */}
          <div className="card p-8 sm:p-10 bg-mesh relative overflow-hidden">
            <h3 className="font-black text-xl text-text mb-8 relative z-10">الوصول السريع</h3>
            <div className="space-y-4 relative z-10">
              <Link href="/dashboard/admin/shops" className="flex items-center justify-between p-5 bg-white rounded-2xl border border-border hover:border-primary/30 transition-all group shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Store size={20} />
                  </div>
                  <span className="font-black text-sm text-text">إدارة المحلات</span>
                </div>
                <ChevronRight size={18} className="text-text-muted group-hover:translate-x-[-4px] transition-transform rotate-180" />
              </Link>
              <Link href="/dashboard/admin/plans" className="flex items-center justify-between p-5 bg-white rounded-2xl border border-border hover:border-primary/30 transition-all group shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Tag size={20} />
                  </div>
                  <span className="font-black text-sm text-text">إدارة الباقات</span>
                </div>
                <ChevronRight size={18} className="text-text-muted group-hover:translate-x-[-4px] transition-transform rotate-180" />
              </Link>
            </div>
            
            <div className="mt-10 p-6 bg-primary/5 rounded-[2rem] border border-primary/10 relative z-10">
               <div className="flex items-center gap-3 mb-3">
                 <Shield className="text-primary w-5 h-5" />
                 <span className="text-xs font-black text-primary uppercase tracking-widest">تنبيه النظام</span>
               </div>
               <p className="text-xs font-bold text-text-muted leading-relaxed">
                 هناك 3 محلات بانتظار تفعيل اشتراكهم يدوياً، يرجى مراجعة طلبات الدفع.
               </p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-muted-foreground font-bold">{t('loading')}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-8 animate-fade-in px-6">
        <div className="w-24 h-24 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center shadow-glow border border-primary/20">
          <TrendingUp size={48} />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-foreground">مرحباً بك في دورك</h1>
          <p className="text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
            أنت مسجل كمسؤول نظام. يمكنك إدارة المحلات والمستخدمين من خلال لوحة التحكم الخاصة بالإدارة.
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => window.location.href='/dashboard/admin/shops'} className="btn btn-primary h-12 px-10 shadow-glow">
            إدارة المحلات
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      label: t('totalTickets'), 
      value: stats.today.totalTickets, 
      icon: Users, 
      color: "primary",
      trend: "+12%",
      isUp: true
    },
    { 
      label: t('waiting'), 
      value: stats.today.currentWaiting, 
      icon: Clock, 
      color: "warning",
      trend: t('active'),
      isUp: true
    },
    { 
      label: t('completed'), 
      value: stats.today.completedTickets, 
      icon: CheckCircle2, 
      color: "success",
      trend: `${stats.today.completionRate}${t('percent')}`,
      isUp: true
    },
    { 
      label: t('avgWaitTime'), 
      value: `${stats.today.avgWaitTime} ${t('minutes')}`, 
      icon: TrendingUp, 
      color: "info",
      trend: "-2min",
      isUp: false
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-12 animate-fade-in pb-20 lg:pb-0" dir={language === 'en' ? 'ltr' : 'rtl'}>
      
      {/* Shop Status Banner - Rebuilt for Premium SaaS */}
      {stats.shopStatus && (
        <div className={cn(
          "p-6 sm:p-8 rounded-[2.5rem] flex flex-col sm:flex-row sm:items-center justify-between gap-8 border transition-all relative overflow-hidden",
          stats.shopStatus.status === 'OPEN' 
            ? 'bg-success/[0.03] border-success/20 text-success' 
            : stats.shopStatus.status === 'BREAK'
            ? 'bg-warning/[0.03] border-warning/20 text-warning'
            : 'bg-danger/[0.03] border-danger/20 text-danger'
        )}>
          {/* Animated Glow Background */}
          <div className={cn(
            "absolute -top-24 -right-24 w-64 h-64 blur-[80px] opacity-20",
            stats.shopStatus.status === 'OPEN' ? 'bg-success' : 
            stats.shopStatus.status === 'BREAK' ? 'bg-warning' : 'bg-danger'
          )} />

          <div className="flex items-center gap-6 relative z-10">
            <div className={cn(
              "w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl transition-transform hover:scale-105 duration-500",
              stats.shopStatus.status === 'OPEN' ? 'bg-success' : 
              stats.shopStatus.status === 'BREAK' ? 'bg-warning' : 'bg-danger'
            )}>
              {stats.shopStatus.status === 'OPEN' ? <CheckCircle2 size={36} /> : 
               stats.shopStatus.status === 'BREAK' ? <Clock size={36} /> : <XCircle size={36} />}
            </div>
            <div>
              <h4 className="font-black text-xl sm:text-2xl tracking-tight mb-1">
                {stats.shopStatus.status === 'OPEN' ? t('shopOpen') : 
                 stats.shopStatus.status === 'BREAK' ? t('shopBreak') : t('shopClosed')}
              </h4>
              <p className="text-sm sm:text-base font-bold opacity-70 italic">{stats.shopStatus.message}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            {stats.shopStatus.remainingDailyLimit !== undefined && (
              <div className="text-center px-6 py-3 bg-white/80 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-current/10 min-w-[120px] shadow-sm">
                <p className="text-[10px] uppercase tracking-widest font-black opacity-60 mb-1">متبقي لليوم</p>
                <p className="text-xl sm:text-2xl font-black">{stats.shopStatus.remainingDailyLimit}</p>
              </div>
            )}
            <button onClick={fetchStats} className="btn btn-secondary h-14 w-14 p-0 rounded-2xl bg-white/80 dark:bg-black/20 backdrop-blur-md">
               <RefreshCw size={22} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 px-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-text tracking-tight">
            {t('dashboardOverviewHeader')}
          </h1>
          <p className="text-text-muted mt-2 font-medium italic text-sm sm:text-base">
            {t('dashboardOverviewSubheading')}
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link href="/dashboard/settings" className="btn btn-primary h-12 px-6 shadow-glow">
            <Clock size={18} />
            <span>إعدادات الوقت</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-8 flex flex-col gap-8 group hover:border-primary/20"
          >
            <div className="flex items-center justify-between">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                card.color === 'primary' && "bg-primary/10 text-primary border border-primary/10",
                card.color === 'warning' && "bg-warning/10 text-warning border border-warning/10",
                card.color === 'success' && "bg-success/10 text-success border border-success/10",
                card.color === 'info' && "bg-info/10 text-info border border-info/10",
              )}>
                <card.icon size={28} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full border",
                card.isUp ? 'bg-success/10 text-success border-success/10' : 'bg-primary/10 text-primary border-primary/10'
              )}>
                {card.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {card.trend}
              </div>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-text mb-1 tracking-tighter">{card.value}</div>
              <div className="text-[11px] font-black text-text-muted uppercase tracking-widest">{card.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10 sm:gap-12">
        
        {/* Current Queues List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-2xl text-text flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/10 shadow-sm">
                <Layers size={22} />
              </div>
              {t('activeQueues')}
            </h3>
            <Link href="/dashboard/queues" className="text-sm font-black text-primary hover:text-primary/80 transition-all border-b border-primary/20 pb-0.5">{t('viewAll')}</Link>
          </div>

          <div className="grid gap-6">
            {stats.queues.length > 0 ? stats.queues.map((queue) => (
              <div key={queue.id} className="card p-6 sm:p-8 group hover:border-primary/30 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] flex items-center justify-center text-white font-black text-3xl shadow-lg transition-all duration-500 group-hover:scale-105",
                      queue.status === 'OPEN' ? 'gradient-primary' : 'bg-muted text-text-muted border border-border'
                    )}>
                      {queue.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-text flex items-center gap-4 text-xl sm:text-2xl mb-2">
                        {queue.nameAr || queue.name}
                        <span className={cn(
                          "badge-premium",
                          queue.status === 'OPEN' ? 'bg-success/10 text-success border-success/10' : 'bg-warning/10 text-warning border-warning/10'
                        )}>
                          {queue.status === 'OPEN' ? t('open') : t('paused')}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                          <Users size={14} className="opacity-40" />
                          <span>{queue.waitingCount} {t('peopleWaiting')}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-border" />
                        <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                          <Clock size={14} className="opacity-40" />
                          <span>{queue.avgServiceTime} {t('perCustomer')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <button 
                      onClick={() => handleQueueStatus(queue.id, queue.status)}
                      className={cn(
                        "w-14 h-14 rounded-2xl border transition-all flex items-center justify-center shadow-sm",
                        queue.status === 'OPEN' 
                        ? 'text-warning bg-warning/5 border-warning/20 hover:bg-warning/10' 
                        : 'text-success bg-success/5 border-success/20 hover:bg-success/10'
                      )}
                    >
                      {queue.status === 'OPEN' ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <Link href={`/dashboard/queues/${queue.id}`} className="btn btn-secondary h-14 px-8 text-sm font-black gap-3 rounded-2xl">
                      {t('manage')}
                      <ChevronRight size={18} className="rotate-180 opacity-40 group-hover:translate-x-[-4px] transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="card p-20 text-center flex flex-col items-center gap-8 bg-surface-2/30 border-dashed border-2">
                <div className="w-24 h-24 rounded-[2.5rem] bg-background border border-border flex items-center justify-center text-text-muted shadow-inner">
                  <Layers size={48} />
                </div>
                <div className="space-y-3">
                  <p className="font-black text-2xl text-text tracking-tight">لا توجد طوابير نشطة</p>
                  <p className="text-sm font-bold text-text-muted max-w-[280px] mx-auto italic">ابدأ بإنشاء طابورك الأول لتتمكن من استقبال العملاء وتنظيم العمل</p>
                </div>
                <Link href="/dashboard/queues" className="btn btn-primary h-14 px-10 shadow-glow rounded-2xl">إضافة طابور جديد</Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Help Widget */}
          <div className="card p-8 sm:p-10 bg-text text-background border-none shadow-2xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8 border border-white/10 shadow-sm">
                <Coffee size={28} className="text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-3 text-white tracking-tight">{t('needHelp')}</h3>
              <p className="text-white/60 text-sm mb-10 font-bold leading-relaxed italic">{t('helpText')}</p>
              <Link href="/dashboard/help" className="btn bg-white text-text w-full h-14 text-sm font-black shadow-xl hover:shadow-primary/20 transition-all border-none rounded-2xl">
                {t('helpGuide')}
              </Link>
            </div>
          </div>

          {/* Activity Widget */}
          <div className="card p-8 sm:p-10">
            <h3 className="font-black text-xl text-text mb-10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/10 shadow-sm">
                <UserCheck size={20} />
              </div>
              {t('latestMembers')}
            </h3>
            <div className="space-y-8">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center text-text-muted border border-border group-hover:border-primary/30 transition-all">
                      <Users size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-black text-text group-hover:text-primary transition-colors">
                        {language === 'en' ? `Customer #${i + 254}` : `عميل جديد #${i + 254}`}
                      </div>
                      <div className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-widest">
                        {language === 'en' ? `${i + 2}m ago` : `منذ ${i + 2} دقائق`}
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight size={18} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
              ))}
            </div>
            <Link href="/dashboard/analytics" className="btn btn-secondary w-full mt-12 h-14 text-sm font-black rounded-2xl">
              مشاهدة التحليلات الكاملة
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

