"use client";
import React, { useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X, CheckCheck, Trash2, Info, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type NotificationType = 'info' | 'warning' | 'success' | 'system';
type NotificationItem = { 
  id: string; 
  title: string; 
  desc?: string; 
  time?: string; 
  read?: boolean;
  type: NotificationType;
};

const initial: NotificationItem[] = [
  { id: 'n1', title: 'تذكرة جديدة', desc: 'قام عميل جديد بالانضمام إلى طابور الانتظار رقم 1', time: 'منذ دقيقتين', read: false, type: 'info' },
  { id: 'n2', title: 'تم إيقاف الطابور', desc: 'تم إيقاف الطابور رقم 3 مؤقتاً بواسطة المسؤول', time: 'منذ ساعة', read: true, type: 'warning' },
  { id: 'n3', title: 'تم استلام الدفعة', desc: 'تم تجديد اشتراكك السنوي بنجاح', time: 'منذ يوم', read: true, type: 'success' },
];

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<NotificationItem[]>(initial);

  const markAllRead = () => setItems((s) => s.map((i) => ({ ...i, read: true })));
  const clearAll = () => setItems([]);
  const toggleRead = (id: string) => setItems((s) => s.map((i) => (i.id === id ? { ...i, read: !i.read } : i)));
  const deleteItem = (id: string) => setItems((s) => s.filter((x) => x.id !== id));

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'system': return <Clock className="w-5 h-5 text-purple-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 lg:pb-8 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/10 shadow-sm">
              <Bell className="w-8 h-8 text-primary" />
            </div>
            {t('notifications') || 'الإشعارات'}
          </h1>
          <p className="text-muted-foreground mt-2 font-medium text-sm sm:text-base">{t('manageNotifications') || 'تابع آخر التحديثات والنشاطات في نظامك'}</p>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide bg-surface-2 p-1 rounded-2xl border border-border shadow-sm">
          <button 
            onClick={markAllRead}
            className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold bg-surface text-foreground rounded-xl shadow-sm border border-border/50 uppercase tracking-wider hover:bg-surface-2 transition-all disabled:opacity-50"
            disabled={items.every(i => i.read) || items.length === 0}
          >
            <CheckCheck className="w-4 h-4" />
            {t('markAllRead') || 'تحديد كمقروء'}
          </button>
          <button 
            onClick={clearAll}
            className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold text-danger hover:bg-danger/5 rounded-xl transition-all uppercase tracking-wider disabled:opacity-50"
            disabled={items.length === 0}
          >
            <Trash2 className="w-4 h-4" />
            {t('clearAll') || 'مسح الكل'}
          </button>
        </div>
      </div>

      <div className="card shadow-md overflow-hidden">
        <div className="divide-y divide-border/50">
          <AnimatePresence mode="popLayout">
            {items.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 px-6 text-center"
              >
                <div className="w-24 h-24 bg-surface-2 rounded-[2rem] flex items-center justify-center mb-6 text-muted-foreground/30 shadow-inner border border-border">
                  <Bell className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{t('noNotifications') || 'لا توجد إشعارات'}</h3>
                <p className="text-muted-foreground font-medium max-w-xs mx-auto leading-relaxed">{t('noNotificationsDesc') || 'ستظهر هنا آخر التحديثات المتعلقة بنشاطاتك في دورك'}</p>
              </motion.div>
            ) : (
              items.map((n, idx) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "group relative flex items-start gap-5 p-5 sm:p-8 transition-all duration-300",
                    !n.read ? "bg-primary/[0.02]" : "bg-transparent hover:bg-surface-2/50"
                  )}
                >
                  <div className={cn(
                    "mt-1 p-3 rounded-2xl transition-all duration-300 shadow-sm border",
                    !n.read ? "bg-surface border-primary/20 scale-105" : "bg-surface-2 border-border opacity-70"
                  )}>
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className={cn(
                        "text-base sm:text-lg tracking-tight truncate",
                        !n.read ? "font-extrabold text-foreground" : "font-bold text-foreground/60"
                      )}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap bg-surface-2 px-3 py-1 rounded-full border border-border/50 uppercase tracking-widest">
                        {n.time}
                      </span>
                    </div>
                    
                    {n.desc && (
                      <p className={cn(
                        "text-sm sm:text-base leading-relaxed line-clamp-2 sm:line-clamp-none",
                        !n.read ? "text-muted-foreground font-medium" : "text-muted-foreground/50"
                      )}>
                        {n.desc}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-5 sm:hidden">
                       <button 
                        onClick={() => toggleRead(n.id)}
                        className={cn(
                          "text-[10px] font-bold px-4 py-2 rounded-xl border transition-all uppercase tracking-widest",
                          !n.read 
                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                            : "bg-surface text-muted-foreground border-border"
                        )}
                      >
                        {n.read ? 'غير مقروء' : 'مقروء'}
                      </button>
                      <button 
                        onClick={() => deleteItem(n.id)}
                        className="text-[10px] font-bold px-4 py-2 rounded-xl border border-danger/20 text-danger bg-danger/5 uppercase tracking-widest"
                      >
                        حذف
                      </button>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => toggleRead(n.id)}
                      title={n.read ? 'تمييز كغير مقروء' : 'تمييز كمقروء'}
                      className="p-2.5 bg-surface rounded-xl border border-border shadow-sm hover:border-primary/30 text-muted-foreground hover:text-primary transition-all"
                    >
                      <CheckCheck className={cn("w-5 h-5", n.read ? "text-primary" : "text-muted-foreground")} />
                    </button>
                    <button 
                      onClick={() => deleteItem(n.id)}
                      className="p-2.5 bg-surface rounded-xl border border-border shadow-sm hover:border-danger/30 text-muted-foreground hover:text-danger transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {!n.read && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1.5 h-16 bg-primary rounded-l-full shadow-glow" />
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
        
        {items.length > 0 && (
          <div className="bg-surface-2/50 border-t border-border py-5 px-8 flex items-center justify-between">
            <p className="text-sm font-bold text-muted-foreground">
              <span className="text-primary font-extrabold">{items.filter(i => !i.read).length}</span> إشعارات جديدة بانتظارك
            </p>
            <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest hidden sm:block">
              نظام التنبيهات الذكي • دورك
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
