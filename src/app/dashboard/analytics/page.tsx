"use client";
// ============================================
// دورك - صفحة الإحصائيات (Analytics Page)
// ============================================

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Clock, CheckCircle2,
  Users, Calendar, Loader2,
  ArrowUpRight, Info
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AnalyticsData = {
  today: {
    totalTickets: number;
    completedTickets: number;
    cancelledTickets: number;
    avgWaitTime: number;
    currentWaiting: number;
    completionRate: number;
  };
  weekly: Array<{
    date: string;
    totalTickets: number;
    completedTickets: number;
    cancelledTickets: number;
    avgWaitTime: number;
  }>;
  hourly: Array<{
    hour: number;
    count: number;
  }>;
  queues: Array<{
    id: string;
    name: string;
    nameAr?: string | null;
    status: "OPEN" | "PAUSED" | "CLOSED";
    waitingCount: number;
    avgServiceTime: number;
  }>;
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const { t, language } = useLanguage();

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await axios.get("/api/analytics/dashboard");
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error(t('analyticsLoadError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-black text-text-muted">
            {t('analyticsLoading') || 'جاري تحميل البيانات...'}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-xl font-black text-text mb-2">
            {t('noData') || 'لا توجد بيانات متاحة'}
          </h3>
          <p className="text-sm text-text-muted font-medium">
            {t('analyticsNoShop') || 'يرجى تفعيل الطوابير أولاً للبدء في جمع وإحصاء البيانات'}
          </p>
        </div>
      </div>
    );
  }

  const formatHour = (hour: number) => {
    if (language === 'en') {
      const period = hour < 12 ? 'AM' : 'PM';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      return `${displayHour} ${period}`;
    }

    if (hour === 0) return "12 ص";
    if (hour < 12) return `${hour} ص`;
    if (hour === 12) return "12 م";
    return `${hour - 12} م`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'ar-SA', { weekday: 'short', day: 'numeric' });
  };

  const maxHourlyCount = Math.max(...data.hourly.map(h => h.count), 1);
  const maxWeeklyTickets = Math.max(...data.weekly.map(w => w.totalTickets), 1);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 lg:pb-8 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/10 shadow-sm">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            {t('analytics') || 'التحليلات والتقارير'}
          </h1>
          <p className="text-muted-foreground mt-2 font-medium text-sm sm:text-base">{t('analyticsDesc') || 'راقب أداء عملك وحسن تجربة عملائك بالبيانات'}</p>
        </div>
        
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-2xl border border-border shadow-sm">
          <button className="px-6 py-2.5 text-[11px] font-bold bg-surface text-foreground rounded-xl shadow-sm border border-border/50 uppercase tracking-wider">اليوم</button>
          <button className="px-6 py-2.5 text-[11px] font-bold text-muted-foreground hover:text-foreground rounded-xl transition-all uppercase tracking-wider">7 أيام</button>
          <button className="px-6 py-2.5 text-[11px] font-bold text-muted-foreground hover:text-foreground rounded-xl transition-all uppercase tracking-wider">30 يوم</button>
        </div>
      </div>

      {/* Today's Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {[
          { label: 'إجمالي التذاكر', value: data.today.totalTickets, icon: Users, color: 'primary', trend: '+12%' },
          { label: 'تمت خدمتها', value: data.today.completedTickets, icon: CheckCircle2, color: 'success', trend: '+5%' },
          { label: 'متوسط الانتظار', value: `${data.today.avgWaitTime} د`, icon: Clock, color: 'warning', trend: '-2%' },
          { label: 'معدل الإنجاز', value: `${data.today.completionRate}%`, icon: TrendingUp, color: 'info', trend: '+8%' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="card p-8 group hover:border-primary/20">
              <div className="flex items-start justify-between mb-8">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border border-transparent",
                  stat.color === 'primary' && "bg-primary/10 text-primary border-primary/10",
                  stat.color === 'success' && "bg-success/10 text-success border-success/10",
                  stat.color === 'warning' && "bg-warning/10 text-warning border-warning/10",
                  stat.color === 'info' && "bg-info/10 text-info border-info/10",
                )}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-success bg-success/10 px-3 py-1 rounded-full border border-success/10">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.trend}
                </div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-text mb-1 tracking-tighter">{stat.value}</div>
                <div className="text-[11px] font-black text-text-muted uppercase tracking-widest">{stat.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12">
        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="card h-full">
            <div className="p-8 border-b border-border flex items-center justify-between bg-surface-2/50">
              <h3 className="text-xl font-black text-text flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/10">
                  <Calendar className="w-5 h-5" />
                </div>
                إحصائيات الأسبوع
              </h3>
              <Info className="w-5 h-5 text-text-muted/40 cursor-help hover:text-primary transition-colors" />
            </div>
            <div className="p-10 space-y-10">
              {data.weekly.map((day, index) => (
                <div key={day.date} className="group">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <span className="text-sm font-black text-text-muted group-hover:text-primary transition-colors uppercase tracking-tight">
                      {formatDate(day.date)}
                    </span>
                    <span className="text-sm font-black text-text">
                      {day.totalTickets} تذكرة
                    </span>
                  </div>
                  <div className="h-2.5 bg-surface-2 rounded-full overflow-hidden flex items-center border border-border/50 shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(day.totalTickets / maxWeeklyTickets) * 100}%` }}
                      transition={{ duration: 1.5, delay: 0.8 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full gradient-primary rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-white/10 animate-pulse" />
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Hourly Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="card h-full">
            <div className="p-8 border-b border-border flex items-center justify-between bg-surface-2/50">
              <h3 className="text-xl font-black text-text flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/10">
                  <Clock className="w-5 h-5" />
                </div>
                توزيع الكثافة بالساعات
              </h3>
              <div className="text-[10px] font-black bg-primary/10 text-primary px-4 py-1.5 rounded-full border border-primary/20 uppercase tracking-widest">ذروة العمل</div>
            </div>
            <div className="p-10">
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-6 h-[300px] items-end">
                {data.hourly.map((hour, idx) => (
                  <div key={hour.hour} className="group flex flex-col items-center gap-6 h-full justify-end">
                    <div className="relative w-full flex justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(hour.count / maxHourlyCount) * 240}px` }}
                        transition={{ duration: 1.5, delay: 0.8 + idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className={cn(
                          "w-full sm:w-12 rounded-t-2xl transition-all duration-700 relative",
                          hour.count === maxHourlyCount 
                            ? "gradient-primary shadow-glow" 
                            : "bg-primary/5 hover:bg-primary/20 border-t border-x border-primary/10"
                        )}
                      >
                         {hour.count > 0 && (
                           <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-[10px] font-black text-text opacity-0 group-hover:opacity-100 transition-all bg-surface shadow-premium border border-border px-3 py-1.5 rounded-xl whitespace-nowrap z-10 translate-y-3 group-hover:translate-y-0">
                             {hour.count} عميل
                           </div>
                         )}
                      </motion.div>
                    </div>
                    <span className="text-[10px] font-black text-text-muted group-hover:text-primary transition-colors whitespace-nowrap uppercase tracking-tighter">
                      {formatHour(hour.hour)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>


      {/* Queue Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-border bg-surface-2/50">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              أداء طوابير الانتظار
            </h3>
          </div>
          <div className="table-container border-0 rounded-none shadow-none">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>اسم الطابور</th>
                  <th>الحالة</th>
                  <th>في الانتظار</th>
                  <th>متوسط الخدمة</th>
                  <th>الأداء العام</th>
                </tr>
              </thead>
              <tbody>
                {data.queues.map((queue) => (
                  <tr key={queue.id} className="hover:bg-primary/[0.02] group">
                    <td className="font-bold text-foreground group-hover:text-primary transition-colors">{queue.nameAr || queue.name}</td>
                    <td>
                      <span className={cn(
                        "badge-premium border-none",
                        queue.status === 'OPEN' ? "bg-success/10 text-success" :
                        queue.status === 'PAUSED' ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"
                      )}>
                        {queue.status === 'OPEN' ? 'مفتوح' : queue.status === 'PAUSED' ? 'متوقف' : 'مغلق'}
                      </span>
                    </td>
                    <td className="font-bold text-foreground">{queue.waitingCount}</td>
                    <td className="text-muted-foreground font-semibold">{queue.avgServiceTime} دقيقة</td>
                    <td className="min-w-[140px]">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-surface-2 rounded-full overflow-hidden border border-border/50">
                          <div 
                            className="h-full bg-success shadow-glow-sm" 
                            style={{ width: `${Math.max(30, 100 - (queue.avgServiceTime / 30) * 100)}%` }} 
                          />
                        </div>
                        <span className="text-[11px] font-bold text-muted-foreground">
                          {Math.round(Math.max(30, 100 - (queue.avgServiceTime / 30) * 100))}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}