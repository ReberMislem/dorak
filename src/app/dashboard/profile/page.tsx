"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Lock, Camera, Shield, Settings, Save, Loader2, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email, phone: (user as any).phone || "" });
  }, [user]);

  const onChange = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const onSave = async () => {
    setIsSaving(true);
    setStatus(t('saving') || 'جاري الحفظ...');
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setStatus(t('saved') || 'تم الحفظ بنجاح');
      try { await refreshUser(); } catch {}
    } catch (e) {
      setStatus(t('saveError') || 'حدث خطأ أثناء الحفظ');
    }
    setIsSaving(false);
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-24 lg:pb-8 px-4 sm:px-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-indigo-500/20 flex items-center justify-center border-2 border-primary/10 overflow-hidden shadow-glow">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <User className="w-14 h-14 sm:w-20 sm:h-20 text-primary/30" />
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-primary-foreground rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border-4 border-surface">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">{user?.name || 'مستخدم دورك'}</h1>
              <div className="p-1 bg-primary/10 rounded-full border border-primary/20">
                <BadgeCheck className="w-5 h-5 text-primary fill-primary/20" />
              </div>
            </div>
            <p className="text-muted-foreground font-bold text-sm sm:text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary/60" />
              {user?.role === 'SUPER_ADMIN' ? 'مسؤول النظام' : 'صاحب محل'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="badge-premium bg-success/10 text-success border-success/20 px-4 py-1.5 font-extrabold">نشط</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-surface-2 px-3 py-1.5 rounded-full border border-border/50">عضو منذ 2024</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onSave} 
          disabled={isSaving}
          className="btn btn-primary h-14 px-10 text-base font-bold shadow-glow w-full sm:w-auto"
        >
          {isSaving ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5 ml-2" />
              {t('saveChanges') || 'حفظ التغييرات'}
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-surface-2 p-1.5 rounded-[2rem] border border-border shadow-sm flex flex-col gap-1.5">
            <button className="w-full flex items-center gap-4 p-4 rounded-[1.5rem] bg-surface text-primary font-bold text-sm shadow-sm border border-border/50 transition-all">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner"><User className="w-5 h-5" /></div>
              المعلومات الشخصية
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-[1.5rem] text-muted-foreground font-bold text-sm hover:bg-surface/50 hover:text-foreground transition-all group">
              <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center border border-border group-hover:bg-surface group-hover:border-primary/20 transition-all"><Lock className="w-5 h-5" /></div>
              الأمان وكلمة المرور
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-[1.5rem] text-muted-foreground font-bold text-sm hover:bg-surface/50 hover:text-foreground transition-all group">
              <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center border border-border group-hover:bg-surface group-hover:border-primary/20 transition-all"><Settings className="w-5 h-5" /></div>
              تفضيلات النظام
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="card p-8 sm:p-10 shadow-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-foreground/80 px-1 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary/60" />
                    الاسم الكامل
                  </label>
                  <input 
                    value={form.name} 
                    onChange={(e) => onChange('name', e.target.value)}
                    className="input h-12 font-semibold bg-surface-2 border-transparent focus:bg-surface focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-foreground/80 px-1 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary/60" />
                    البريد الإلكتروني
                  </label>
                  <input 
                    value={form.email} 
                    onChange={(e) => onChange('email', e.target.value)}
                    className="input h-12 font-semibold bg-surface-2 border-transparent focus:bg-surface focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-foreground/80 px-1 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary/60" />
                    رقم الهاتف
                  </label>
                  <input 
                    value={form.phone} 
                    onChange={(e) => onChange('phone', e.target.value)}
                    placeholder="05xxxxxxxx"
                    className="input h-12 font-semibold bg-surface-2 border-transparent focus:bg-surface focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-foreground/80 px-1 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary/60" />
                    كلمة المرور الجديدة
                  </label>
                  <input 
                    type="password" 
                    placeholder="اتركها فارغة لعدم التغيير"
                    className="input h-12 font-semibold bg-surface-2 border-transparent focus:bg-surface focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                <p className="text-[11px] font-bold text-muted-foreground/60 max-w-[240px] uppercase tracking-wider leading-relaxed">
                  بمجرد حفظ التغييرات، سيتم تحديث معلوماتك في جميع أقسام النظام فوراً.
                </p>
                {status && (
                  <motion.span 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "text-xs font-bold px-5 py-2.5 rounded-xl border uppercase tracking-widest",
                      status.includes('خطأ') ? "bg-danger/10 text-danger border-danger/20" : "bg-success/10 text-success border-success/20"
                    )}
                  >
                    {status}
                  </motion.span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Additional Security Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="card p-8 sm:p-10 border-dashed border-2 bg-surface-2/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-warning/10 text-warning flex items-center justify-center shadow-inner border border-warning/10 shrink-0">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-foreground text-lg mb-1 tracking-tight">توثيق الحساب (2FA)</h4>
                    <p className="text-sm text-muted-foreground font-medium">أضف طبقة أمان إضافية لحماية حسابك من الاختراق</p>
                  </div>
                </div>
                <button className="btn btn-secondary h-11 px-8 text-sm font-bold border-warning/20 text-warning hover:bg-warning/5 transition-all">تفعيل الآن</button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
