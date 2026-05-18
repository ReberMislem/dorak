"use client";
// ============================================
// دورك - صفحة إعدادات المحل (Settings)
// ============================================

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Store, Bell, Globe,
  Shield, CreditCard, Save, Loader2,
  Image as ImageIcon, Phone, MapPin, 
  Trash2, AlertTriangle, Check,
  Sun, Moon, Monitor, Languages,
  Clock, Calendar, Coffee, X, Plus
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/providers/LanguageProvider";
import axios from "axios";
import toast from "react-hot-toast";
import { ImageUpload } from "@/components/dashboard/ImageUpload";

type BreakTimeData = {
  id?: string;
  title: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

type ShopSettingsData = {
  id: string;
  name: string;
  nameAr?: string | null;
  logo?: string | null;
  address?: string | null;
  phone?: string | null;
  openTime?: string | null;
  closeTime?: string | null;
  registrationStartTime?: string | null;
  registrationEndTime?: string | null;
  dailyQueueLimit?: number | null;
  autoResetEnabled: boolean;
  currentStatus: "OPEN" | "CLOSED" | "BREAK";
  workingDays?: string | null;
  breakTimes: BreakTimeData[];
};

type MeResponse = {
  success: boolean;
  data: {
    shops: ShopSettingsData[];
  };
  error?: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [shopData, setShopData] = useState<ShopSettingsData | null>(null);
  const [formData, setFormData] = useState<Partial<ShopSettingsData>>({});
  const [breakTimes, setBreakTimes] = useState<BreakTimeData[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<'MONTH'|'6MONTH'|'YEAR'>('MONTH');
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await axios.get<MeResponse>("/api/auth/me");
        if (res.data.success) {
          if (res.data.data.shops && res.data.data.shops.length > 0) {
            const shop = res.data.data.shops[0];
            setShopData(shop);
            setFormData(shop);
            setBreakTimes(shop.breakTimes || []);
          } else {
            setShopData({ id: 'system', name: 'System Settings' } as any);
          }
        } else {
          setError(res.data.error || "Failed to load data");
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.error || "Error connecting to server");
      }
    };
    fetchShop();
    (async () => {
      try {
        const res = await axios.get('/api/plans');
        setPlans(res.data?.data || []);
        if (res.data?.data?.length) setSelectedPlan(res.data.data[0].slug || res.data.data[0].id);
      } catch (e) {}
    })();
  }, []);

  const handleUpdateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopData?.id || shopData.id === 'system') return;
    
    setLoading(true);
    try {
      const res = await axios.patch(`/api/shops/${shopData.id}`, {
        ...formData,
        breakTimes
      });
      if (res.data.success) {
        toast.success(t('successUpdate'));
        refreshUser();
      } else {
        toast.error(res.data.error || t('errorUpdate'));
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || t('errorUpdate'));
    } finally {
      setLoading(false);
    }
  };

  const addBreak = () => {
    setBreakTimes([...breakTimes, { title: 'استراحة', startTime: '13:00', endTime: '14:00', isActive: true }]);
  };

  const removeBreak = (index: number) => {
    setBreakTimes(breakTimes.filter((_, i) => i !== index));
  };

  const updateBreak = (index: number, data: Partial<BreakTimeData>) => {
    const newBreaks = [...breakTimes];
    newBreaks[index] = { ...newBreaks[index], ...data };
    setBreakTimes(newBreaks);
  };

  const handleLanguageChange = (newLanguage: "ar" | "en") => {
    setLanguage(newLanguage);
    toast.success(
      newLanguage === "en"
        ? "Language changed to English"
        : "تم تغيير اللغة إلى العربية"
    );
  };

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="p-4 rounded-2xl bg-red-50 text-red-600 font-bold border border-red-100">
        {error}
      </div>
      <button onClick={() => window.location.reload()} className="btn btn-secondary text-sm">
        {t('retry') || 'إعادة المحاولة'}
      </button>
    </div>
  );

  if (!shopData) return (
    <div className="flex flex-center justify-center min-h-[400px] py-20">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
        <p className="text-slate-400 font-bold text-sm animate-pulse">{t('loading') || 'جاري التحميل...'}</p>
      </div>
    </div>
  );

  const TABS = [
    { id: "general", label: t('general'), icon: Store },
    { id: "workingHours", label: t('workingHours'), icon: Clock },
    { id: "notifications", label: t('notifications'), icon: Bell },
    { id: "appearance", label: t('appearance'), icon: Globe },
    { id: "subscription", label: t('subscription'), icon: CreditCard },
    { id: "security", label: t('security'), icon: Shield },
  ];

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in" dir={language === 'en' ? 'ltr' : 'rtl'}>
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{t('settings')}</h1>
        <p className="text-muted-foreground font-medium text-sm sm:text-base mt-1">{t('manageSettings')}</p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
        
        {/* Sidebar Tabs - Horizontal on mobile, Vertical on desktop */}
        <div className="lg:col-span-1">
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 p-1.5 bg-surface-2 border border-border rounded-2xl scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-3 p-3.5 rounded-xl transition-all font-bold text-sm ${
                  activeTab === tab.id 
                    ? 'bg-surface text-primary shadow-sm border border-border/50' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-2'
                }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="card p-6 sm:p-10 shadow-md">
            <form onSubmit={handleUpdateShop} className="space-y-10">
              
              {activeTab === "general" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                  <div className="flex flex-col sm:flex-row items-center gap-8 pb-10 border-b border-border">
                    <ImageUpload
                      currentImage={formData.logo || shopData.logo}
                      onUploadSuccess={(url) => {
                        setFormData({ ...formData, logo: url });
                        toast.success("تم تحديث الشعار. اضغط حفظ في الأسفل لتأكيد التغييرات.");
                      }}
                      onRemoveSuccess={() => {
                        setFormData({ ...formData, logo: null });
                      }}
                      type="logo"
                      shopId={shopData.id}
                    />
                    <div className="text-center sm:text-right">
                      <h4 className="font-bold text-foreground text-xl mb-1">{t('shopLogo')}</h4>
                      <p className="text-sm text-muted-foreground font-medium">{t('logoHint')}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-foreground/80 px-1">{t('shopNameAr')}</label>
                      <input 
                        type="text" 
                        className="input h-12 font-semibold" 
                        defaultValue={shopData.nameAr || shopData.name} 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-foreground/80 px-1">{t('shopNameEn')}</label>
                      <input 
                        type="text" 
                        className="input h-12 font-semibold" 
                        defaultValue={shopData.name} 
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-foreground/80 px-1">{t('address')}</label>
                    <div className="relative group">
                      <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                      <input 
                        type="text" 
                        className="input pr-12 h-12 font-semibold" 
                        placeholder={language === 'en' ? 'Riyadh, Al-Malaz District, 60th Street' : 'الرياض، حي الملز، شارع الستين'}
                        defaultValue={shopData.address ?? undefined}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-foreground/80 px-1">{t('phone')}</label>
                    <div className="relative group">
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                      <input 
                        type="tel" 
                        className="input pr-12 h-12 font-semibold text-left" 
                        dir="ltr"
                        defaultValue={formData.phone ?? undefined}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "workingHours" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="p-8 rounded-[2rem] bg-surface-2/50 border border-border space-y-6">
                      <h5 className="font-bold text-base text-primary flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Clock size={18} /></div>
                        أوقات العمل
                      </h5>
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground px-1 uppercase tracking-wider">{t('openTime')}</label>
                          <input type="time" className="input h-12 font-bold" defaultValue={formData.openTime ?? "09:00"} onChange={(e) => setFormData({ ...formData, openTime: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground px-1 uppercase tracking-wider">{t('closeTime')}</label>
                          <input type="time" className="input h-12 font-bold" defaultValue={formData.closeTime ?? "22:00"} onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-surface-2/50 border border-border space-y-6">
                      <h5 className="font-bold text-base text-secondary flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center"><Calendar size={18} /></div>
                        التسجيل الرقمي
                      </h5>
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground px-1 uppercase tracking-wider">{t('regStartTime')}</label>
                          <input type="time" className="input h-12 font-bold" defaultValue={formData.registrationStartTime ?? "09:00"} onChange={(e) => setFormData({ ...formData, registrationStartTime: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground px-1 uppercase tracking-wider">{t('regEndTime')}</label>
                          <input type="time" className="input h-12 font-bold" defaultValue={formData.registrationEndTime ?? "21:00"} onChange={(e) => setFormData({ ...formData, registrationEndTime: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-foreground/80 px-1">{t('dailyLimit')}</label>
                      <input 
                        type="number" 
                        className="input h-12 font-bold" 
                        defaultValue={formData.dailyQueueLimit ?? 50}
                        onChange={(e) => setFormData({ ...formData, dailyQueueLimit: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10 self-end h-12">
                      <input 
                        type="checkbox" 
                        id="autoReset"
                        className="w-5 h-5 accent-primary rounded-lg cursor-pointer"
                        defaultChecked={formData.autoResetEnabled}
                        onChange={(e) => setFormData({ ...formData, autoResetEnabled: e.target.checked })}
                      />
                      <label htmlFor="autoReset" className="text-sm font-bold text-primary cursor-pointer select-none">{t('autoReset')}</label>
                    </div>
                  </div>

                  <div className="space-y-8 pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-lg text-foreground flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center"><Coffee size={20} /></div>
                        {t('breakTimes')}
                      </h4>
                      <button 
                        type="button" 
                        onClick={addBreak}
                        className="btn btn-secondary h-11 px-6 text-sm gap-2"
                      >
                        <Plus size={18} />
                        {t('addBreak')}
                      </button>
                    </div>

                    <div className="grid gap-5">
                      {breakTimes.map((b, i) => (
                        <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-[2rem] bg-surface border border-border shadow-sm animate-fade-in group">
                          <div className="flex-1 w-full space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground px-1 uppercase tracking-widest">عنوان الاستراحة</label>
                            <input 
                              type="text" 
                              className="input h-11 text-sm font-bold bg-surface-2 border-transparent focus:bg-surface focus:border-primary" 
                              placeholder={t('breakTitle')}
                              value={b.title}
                              onChange={(e) => updateBreak(i, { title: e.target.value })}
                            />
                          </div>
                          <div className="flex items-end gap-4 w-full sm:w-auto">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-muted-foreground px-1 uppercase tracking-widest">من</label>
                              <input type="time" className="input h-11 text-sm font-bold bg-surface-2 border-transparent focus:bg-surface focus:border-primary w-full sm:w-32" value={b.startTime} onChange={(e) => updateBreak(i, { startTime: e.target.value })} />
                            </div>
                            <div className="h-11 flex items-center text-muted-foreground opacity-30 px-1">
                              <Clock size={16} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-muted-foreground px-1 uppercase tracking-widest">إلى</label>
                              <input type="time" className="input h-11 text-sm font-bold bg-surface-2 border-transparent focus:bg-surface focus:border-primary w-full sm:w-32" value={b.endTime} onChange={(e) => updateBreak(i, { endTime: e.target.value })} />
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removeBreak(i)}
                              className="p-3 text-danger hover:bg-danger/10 rounded-xl transition-all sm:opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {breakTimes.length === 0 && (
                        <div className="text-center py-16 bg-surface-2/30 rounded-[2.5rem] border-2 border-dashed border-border">
                          <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mx-auto mb-4 text-muted-foreground/30 shadow-inner">
                            <Coffee size={32} />
                          </div>
                          <p className="text-base text-muted-foreground font-bold">لا يوجد أوقات استراحة مضافة حالياً</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "notifications" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  {/* Premium Notification Chime Promotion Card */}
                  <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20 space-y-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0 shadow-inner">
                        <Bell size={28} className="animate-bounce" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-foreground">نظام نغمات الإشعارات والأصوات</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">خصص نغمات الاستدعاء، واختبر الأصوات، وارفع ملفات صوت مخصصة</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push("/settings/notifications")}
                      className="btn btn-primary h-12 px-8 text-xs font-black shadow-glow shrink-0 w-full sm:w-auto"
                    >
                      تخصيص نغمات الاستدعاء
                    </button>
                  </div>

                  <div className="grid gap-5">
                    {[
                      { id: "n1", title: t('notificationsCustomer'), desc: language === 'en' ? 'Notify customers when their turn is near.' : 'إرسال إشعار للعميل عند اقتراب دوره', checked: true },
                      { id: "n2", title: t('notificationsStaff'), desc: language === 'en' ? 'Notify staff when a new customer joins the queue.' : 'إشعار عند انضمام عميل جديد للطابور', checked: false },
                      { id: "n3", title: t('smsNotifications'), desc: language === 'en' ? 'Enable SMS notifications for customers (requires balance).' : 'تفعيل إرسال الرسائل النصية للعملاء (تتطلب رصيد)', checked: false },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-6 sm:p-8 rounded-[2rem] bg-surface border border-border hover:border-primary/20 transition-all shadow-sm group">
                        <div className="max-w-[70%]">
                          <h4 className="text-base sm:text-lg font-bold text-foreground mb-1.5">{item.title}</h4>
                          <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                        </div>
                        <button 
                          type="button"
                          className={`w-14 h-7 rounded-full transition-all relative p-1 ${item.checked ? 'bg-primary' : 'bg-muted'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white transition-all shadow-md ${item.checked ? (language === 'en' ? 'translate-x-7' : '-translate-x-7') : 'translate-x-0'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "appearance" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                  <div className="space-y-8">
                    <h4 className="text-xl font-bold text-foreground flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center shadow-sm border border-warning/10"><Sun size={22} /></div>
                      {t('theme')}
                    </h4>
                    <div className="grid grid-cols-3 gap-6">
                      {[
                        { id: "light", label: t('light'), icon: Sun, color: "text-warning" },
                        { id: "dark", label: t('dark'), icon: Moon, color: "text-secondary" },
                        { id: "system", label: t('system'), icon: Monitor, color: "text-muted-foreground" },
                      ].map((themeOption) => (
                        <button
                          key={themeOption.id}
                          type="button"
                          onClick={() => setTheme(themeOption.id)}
                          className={`p-6 rounded-[2rem] border-2 transition-all group flex flex-col items-center gap-4 ${
                            theme === themeOption.id
                              ? 'border-primary bg-primary/5 shadow-glow'
                              : 'border-border bg-surface hover:border-primary/20 hover:bg-surface-2 shadow-sm'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${theme === themeOption.id ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-surface-2 ' + themeOption.color}`}>
                            <themeOption.icon size={26} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest">
                            {themeOption.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h4 className="text-xl font-bold text-foreground flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm border border-primary/10"><Languages size={22} /></div>
                      {t('language')}
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {[
                        { code: "ar", name: t('arabic'), native: "العربية", flag: "🇸🇦" },
                        { code: "en", name: "English", native: "English", flag: "🇺🇸" },
                      ].map((langOption) => (
                        <button
                          key={langOption.code}
                          type="button"
                          onClick={() => handleLanguageChange(langOption.code as "ar" | "en")}
                          className={`w-full p-6 rounded-[2rem] border-2 transition-all group ${language === langOption.code ? 'border-primary bg-primary/5 shadow-glow' : 'border-border bg-surface hover:border-primary/20 shadow-sm'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                              <span className="text-4xl filter drop-shadow-sm">{langOption.flag}</span>
                              <div className="text-right">
                                <div className="text-base font-bold text-foreground">{langOption.name}</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{langOption.native}</div>
                              </div>
                            </div>
                            {language === langOption.code && (
                              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg border-2 border-surface">
                                <Check size={16} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "subscription" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                  {/* Current Plan Summary */}
                  <div className="p-10 sm:p-12 rounded-[3rem] gradient-primary text-white relative overflow-hidden shadow-glow">
                    <div className="absolute -right-20 -bottom-20 opacity-10 rotate-12 scale-150">
                      <CreditCard size={240} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-8">
                        <span className="badge-premium bg-white/20 backdrop-blur-md text-white border-white/20 px-4">
                          {t('currentPlan')}
                        </span>
                      </div>
                      <h3 className="text-4xl sm:text-6xl font-extrabold mb-3 tracking-tight">{t('freePlan')}</h3>
                      <p className="text-white/70 text-base sm:text-lg font-bold">{language === 'en' ? '7 days trial' : 'باقة تجريبية لمدة 7 أيام'}</p>
                      
                      <div className="mt-12 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                          { label: language === 'en' ? 'Max Queues' : 'أقصى طوابير', val: '1' },
                          { label: language === 'en' ? 'Max Staff' : 'أقصى موظفين', val: '2' },
                          { label: language === 'en' ? 'Analytics' : 'الإحصائيات', val: t('basic') || 'أساسي' },
                          { label: language === 'en' ? 'Support' : 'الدعم', val: t('standard') || 'عادي' },
                        ].map((stat) => (
                          <div key={stat.label}>
                            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">{stat.label}</div>
                            <div className="text-2xl font-extrabold">{stat.val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Plans Selection */}
                  <div className="space-y-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <h4 className="text-2xl font-extrabold text-foreground tracking-tight">{t('availablePlans') || 'اختر باقتك الجديدة'}</h4>
                      <div className="flex p-1.5 bg-surface-2 border border-border rounded-2xl w-fit shadow-sm">
                        {[
                          { id: 'MONTH', label: language === 'en' ? 'Monthly' : 'شهري' },
                          { id: 'YEAR', label: language === 'en' ? 'Yearly' : 'سنوي (وفر 20%)' }
                        ].map((int) => (
                          <button
                            key={int.id}
                            type="button"
                            onClick={() => setSelectedInterval(int.id as any)}
                            className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                              selectedInterval === int.id || (selectedInterval === '6MONTH' && int.id === 'MONTH')
                                ? 'bg-surface text-primary shadow-md border border-border/50'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {int.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                      {plans.filter(p => selectedInterval === 'YEAR' ? p.interval === 'YEAR' : p.interval !== 'YEAR').map((p) => (
                        <div 
                          key={p.id} 
                          className={`p-10 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer relative flex flex-col group ${
                            selectedPlan === p.slug 
                              ? 'border-primary bg-primary/5 shadow-glow scale-[1.02]' 
                              : 'border-border bg-surface hover:border-primary/20 shadow-sm'
                          }`}
                          onClick={() => setSelectedPlan(p.slug)}
                        >
                          {selectedPlan === p.slug && (
                            <div className="absolute top-8 left-8 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg border-4 border-surface animate-fade-in">
                              <Check size={20} strokeWidth={3} />
                            </div>
                          )}
                          <div className="mb-8 text-right">
                            <h5 className="font-extrabold text-foreground text-2xl mb-2 group-hover:text-primary transition-colors">{p.name}</h5>
                            <p className="text-sm font-semibold text-muted-foreground leading-relaxed">{p.description}</p>
                          </div>
                          <div className="flex items-baseline gap-2 mb-10 text-right justify-end">
                            <span className="text-5xl font-extrabold text-foreground tracking-tighter">{p.price / 100}</span>
                            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">$ / {p.interval === 'MONTH' ? (language === 'en' ? 'mo' : 'شهر') : (language === 'en' ? 'yr' : 'سنة')}</span>
                          </div>
                          
                          <ul className="space-y-5 mb-12 flex-1">
                            {Object.entries(p.features || {}).map(([key, val]: [string, any]) => (
                              <li key={key} className="flex items-center gap-4 text-sm font-bold text-foreground/80">
                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sm"><Check size={14} strokeWidth={3} /></div>
                                <span className="leading-tight">
                                  {key === 'maxQueues' ? (language === 'en' ? `${val} Queues` : `${val} طوابير`) :
                                   key === 'maxStaff' ? (language === 'en' ? `${val} Staff Members` : `${val} موظفين`) :
                                   key === 'analytics' ? (language === 'en' ? 'Advanced Analytics' : 'إحصائيات متقدمة') :
                                   key === 'qrCodes' ? (language === 'en' ? 'Custom QR Codes' : 'رموز QR مخصصة') :
                                   key}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="p-10 rounded-[2.5rem] bg-surface-2/30 border-2 border-dashed border-border space-y-8">
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-1 relative group">
                          <input 
                            className="input bg-surface h-14 font-bold px-6 shadow-sm text-base" 
                            placeholder={t('promoCode') || 'أدخل كود الخصم (اختياري)'} 
                            value={promoCode} 
                            onChange={(e) => setPromoCode(e.target.value)} 
                          />
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-primary h-14 px-12 font-bold text-lg shadow-glow"
                          onClick={async () => {
                            try {
                              if (!selectedPlan) return toast.error(language === 'en' ? 'Please select a plan' : 'يرجى اختيار خطة');
                              toast.loading(t('processing') || 'جاري المعالجة...');
                              const res = await axios.post('/api/subscription/upgrade', { planId: selectedPlan, interval: selectedInterval, promoCode });
                              toast.dismiss();
                              if (res.data && res.data.success) {
                                toast.success(t('upgradeSuccess') || 'تم ترقية الاشتراك بنجاح');
                                try { await refreshUser(); } catch {}
                                window.location.reload();
                              } else {
                                toast.error(res.data?.error || t('error'));
                              }
                            } catch (e: any) {
                              toast.dismiss();
                              toast.error(e?.response?.data?.error || t('error'));
                            }
                          }}
                        >
                          {t('upgradePlan')}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                   <div className="p-10 rounded-[2.5rem] border-2 border-danger/20 bg-danger/5 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                      <div className="w-20 h-20 rounded-[1.5rem] bg-danger/10 text-danger flex items-center justify-center shrink-0 shadow-inner">
                        <AlertTriangle size={40} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-extrabold text-danger mb-2 tracking-tight">{t('dangerZone')}</h4>
                        <p className="text-base text-danger/70 font-bold leading-relaxed mb-8">
                          {t('deleteShopWarning')}
                        </p>
                        <button type="button" className="btn bg-danger text-white hover:bg-danger/90 h-14 px-10 text-base font-bold gap-3 shadow-lg shadow-danger/20 transition-all border-none">
                          <Trash2 size={22} />
                          {language === 'en' ? 'Delete shop permanently' : 'حذف المحل والبيانات نهائياً'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Save Footer */}
              <div className="pt-10 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">آخر تحديث: {new Date().toLocaleDateString('ar-SA')}</p>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary px-12 h-14 font-bold text-lg gap-3 shadow-glow w-full sm:w-auto"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                  {t('saveSettings')}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
