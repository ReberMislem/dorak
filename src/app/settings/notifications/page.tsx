"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Volume2, UploadCloud, Play, Check, 
  Smartphone, Eye, ShieldAlert, ArrowRight, Loader2, Sparkles
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { playSound } from "@/lib/soundSynthesizer";
import { useAuth } from "@/components/providers/AuthProvider";

type SoundOption = {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
};

const PRESETS: SoundOption[] = [
  { id: "classic-bell", nameAr: "جرس كلاسيكي", nameEn: "Classic Bell", descAr: "صوت رنين جرس كلاسيكي نقي ومألوف", descEn: "A pure and familiar classic ringing bell chime" },
  { id: "soft-notification", nameAr: "تنبيه هادئ", nameEn: "Soft Notification", descAr: "نغمة صاعدة وناعمة مناسبة للبيئات الهادئة", descEn: "A gentle upward melody suitable for quiet environments" },
  { id: "arabic-bell", nameAr: "جرس شرقي", nameEn: "Arabic Bell", descAr: "نغمة وترية دافئة تحاكي طابع العود الشرقي", descEn: "A warm string chime resembling traditional Arabic oud chords" },
  { id: "modern-ping", nameAr: "رنين عصري", nameEn: "Modern Ping", descAr: "صوت رقمي سريع ونظيف لسرعة الاستجابة", descEn: "A fast, clean digital ping for rapid attention" },
  { id: "queue-alert", nameAr: "تنبيه الطابور", nameEn: "Queue Alert", descAr: "رنين مزدوج واضح ينبه العميل بشكل مباشر", descEn: "A clear double-ping pattern that directly alerts waiting users" },
];

export default function NotificationsSettingsPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shop, setShop] = useState<any>(null);
  
  // Settings state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState("classic-bell");
  const [customSoundUrl, setCustomSoundUrl] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.8);
  const [vibrate, setVibrate] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(false);
  
  // Custom Sound Upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Test Preview Notification Popup State
  const [showPreviewPopup, setShowPreviewPopup] = useState(false);
  const [previewTicketNumber, setPreviewTicketNumber] = useState(12);

  useEffect(() => {
    // Load Settings
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        if (res.data.success && res.data.data.shops?.length > 0) {
          const s = res.data.data.shops[0];
          setShop(s);
          
          const settings = s.settings?.notifications || {};
          setSoundEnabled(settings.soundEnabled ?? true);
          setSelectedSound(settings.selectedSound ?? "classic-bell");
          setCustomSoundUrl(settings.customSoundUrl ?? null);
          setVolume(settings.volume ?? 0.8);
          setVibrate(settings.vibrate ?? true);
          
          if (typeof window !== "undefined" && "Notification" in window) {
            setBrowserNotifications(Notification.permission === "granted" && (settings.browserNotifications ?? false));
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("فشل تحميل إعدادات التنبيهات");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handlePlayPreview = (soundId: string) => {
    if (soundId === "custom" && customSoundUrl) {
      playSound(customSoundUrl, volume);
    } else {
      playSound(soundId, volume);
    }
  };

  const handleSoundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !shop) return;

    // Validate type: mp3, wav, ogg
    const validExts = [".mp3", ".wav", ".ogg"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExts.includes(ext)) {
      toast.error("صيغة الملف غير مدعومة. يرجى اختيار ملف بصيغة MP3, WAV أو OGG");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الملف كبير جداً. الحد الأقصى هو 5 ميجابايت");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("shopId", shop.id);

    try {
      const res = await axios.post("/api/upload/sound", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(pct);
          }
        }
      });

      if (res.data.success) {
        toast.success("تم رفع الملف بنجاح!");
        const newUrl = res.data.data.soundUrl;
        setCustomSoundUrl(newUrl);
        setSelectedSound("custom");
        // Play the newly uploaded custom sound
        playSound(newUrl, volume);
      } else {
        toast.error(res.data.error || "فشل رفع ملف الصوت");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ أثناء رفع ملف الصوت");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRequestPushPermission = () => {
    if (!("Notification" in window)) {
      toast.error("متصفحك لا يدعم إشعارات سطح المكتب");
      return;
    }
    
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        setBrowserNotifications(true);
        toast.success("تم تفعيل إشعارات المتصفح بنجاح!");
      } else {
        setBrowserNotifications(false);
        toast.error("تم رفض الصلاحية. يرجى تفعيلها من إعدادات المتصفح");
      }
    });
  };

  const handleTriggerTestPreview = () => {
    // 1. Play selected sound
    const soundToPlay = selectedSound === "custom" && customSoundUrl ? customSoundUrl : selectedSound;
    playSound(soundToPlay, volume);

    // 2. Vibrate phone
    if (vibrate && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([150, 100, 150]);
    }

    // 3. Show beautiful notification preview popup
    setShowPreviewPopup(true);
    setTimeout(() => {
      setShowPreviewPopup(false);
    }, 5500);

    // 4. Trigger Web push if permitted
    if (browserNotifications && "Notification" in window && Notification.permission === "granted") {
      new Notification(`دورك - تذكرة رقم ${previewTicketNumber}`, {
        body: `يرجى التوجه إلى منطقة تقديم الخدمة الآن في ${shop?.nameAr || shop?.name || "المحل"}`,
        icon: shop?.logo || "/favicon.ico",
      });
    }
  };

  const handleSaveSettings = async () => {
    if (!shop) return;
    setSaving(true);

    try {
      const res = await axios.patch(`/api/shops/${shop.id}`, {
        settings: {
          ...shop.settings,
          notifications: {
            soundEnabled,
            selectedSound,
            customSoundUrl,
            volume,
            vibrate,
            browserNotifications
          }
        }
      });

      if (res.data.success) {
        toast.success("تم حفظ إعدادات التنبيهات بنجاح!");
        await refreshUser();
      } else {
        toast.error(res.data.error || "فشل حفظ الإعدادات");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary w-12 h-12 mb-3" />
        <p className="text-muted-foreground font-black animate-pulse">جاري تحميل إعدادات التنبيهات...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      {/* Test Notification Preview Banner */}
      <AnimatePresence>
        {showPreviewPopup && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-surface/95 backdrop-blur-md border border-primary/20 shadow-glow rounded-[2rem] p-6 z-[1000] flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-inner">
              <Bell className="animate-bounce" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h5 className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
                  تذكرة رقم {previewTicketNumber}
                  <span className="badge-premium bg-primary/10 text-primary px-2 py-0.5 text-[9px]">حان دورك</span>
                </h5>
                <span className="text-[9px] text-muted-foreground">الآن</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                يرجى التوجه إلى منطقة تقديم الخدمة مباشرة في <span className="font-bold text-foreground">{shop?.nameAr || shop?.name}</span>.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="bg-surface border-b border-border py-6 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/dashboard/settings")}
            className="p-3 hover:bg-surface-2 rounded-2xl transition-all border border-transparent hover:border-border text-muted-foreground"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground flex items-center gap-2">
              إعدادات نغمات التنبيهات
              <Sparkles size={20} className="text-primary animate-pulse" />
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">خصص نغمات وتنبيهات استدعاء العملاء لطوابيرك</p>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="btn btn-primary h-12 px-8 text-sm font-bold shadow-glow"
        >
          {saving ? <Loader2 className="animate-spin w-5 h-5" /> : "حفظ التغييرات"}
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="md:col-span-2 space-y-8">
          {/* 1. General Controls */}
          <div className="card p-6 md:p-8 space-y-6 shadow-md">
            <h3 className="text-base font-extrabold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
              <Bell size={18} className="text-primary" />
              تنبيهات الصوت والاهتزاز
            </h3>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-2/40 border border-border/50">
              <div>
                <h4 className="text-sm font-bold text-foreground">تفعيل نغمات الإشعارات</h4>
                <p className="text-xs text-muted-foreground mt-0.5">تشغيل صوت التنبيه عند استدعاء العميل التالي</p>
              </div>
              <button 
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-14 h-7 rounded-full transition-all relative p-1 ${soundEnabled ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-all shadow-md ${soundEnabled ? '-translate-x-7' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-2/40 border border-border/50">
              <div>
                <h4 className="text-sm font-bold text-foreground">اهتزاز الهاتف للهاتف الذكي</h4>
                <p className="text-xs text-muted-foreground mt-0.5">تفعيل اهتزاز خفيف للموبايل عند إطلاق الإشعار</p>
              </div>
              <button 
                type="button"
                onClick={() => setVibrate(!vibrate)}
                className={`w-14 h-7 rounded-full transition-all relative p-1 ${vibrate ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-all shadow-md ${vibrate ? '-translate-x-7' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Volume Control */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                  <Volume2 size={16} className="text-muted-foreground" />
                  مستوى صوت النغمة
                </span>
                <span className="text-xs font-black text-primary">{Math.round(volume * 100)}%</span>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-primary h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 2. Audio Library Presets */}
          <div className="card p-6 md:p-8 space-y-6 shadow-md">
            <h3 className="text-base font-extrabold text-foreground border-b border-border/60 pb-3">
              مكتبة النغمات المدمجة
            </h3>

            <div className="grid gap-4">
              {PRESETS.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => setSelectedSound(p.id)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                    selectedSound === p.id 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-border bg-surface hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedSound === p.id ? 'border-primary bg-primary text-white' : 'border-border bg-transparent'
                    }`}>
                      {selectedSound === p.id && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-foreground">{p.nameAr}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{p.descAr}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayPreview(p.id);
                    }}
                    className="p-3 bg-surface-2 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-xl transition-all"
                  >
                    <Play size={16} fill="currentColor" />
                  </button>
                </div>
              ))}

              {/* Custom sound choice */}
              {customSoundUrl && (
                <div 
                  onClick={() => setSelectedSound("custom")}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                    selectedSound === "custom" 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-border bg-surface hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedSound === "custom" ? 'border-primary bg-primary text-white' : 'border-border bg-transparent'
                    }`}>
                      {selectedSound === "custom" && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                        النغمة المرفوعة الخاصة بك
                        <span className="badge-premium bg-success/10 text-success px-2 py-0.5 text-[9px]">نشط</span>
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">ملف الصوت المخصص الذي تم رفعه بواسطتك</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayPreview("custom");
                    }}
                    className="p-3 bg-surface-2 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-xl transition-all"
                  >
                    <Play size={16} fill="currentColor" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 3. Custom Audio File Upload */}
          <div className="card p-6 md:p-8 space-y-6 shadow-md">
            <h3 className="text-base font-extrabold text-foreground border-b border-border/60 pb-3">
              رفع نغمة تنبيه مخصصة
            </h3>

            <div className="border-2 border-dashed border-border/80 hover:border-primary/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all relative">
              <input 
                type="file"
                id="customSoundInput"
                accept=".mp3,.wav,.ogg"
                onChange={handleSoundUpload}
                disabled={isUploading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              
              <div className="w-14 h-14 bg-surface-2 rounded-2xl flex items-center justify-center mb-4 text-muted-foreground border border-border">
                {isUploading ? <Loader2 className="animate-spin text-primary w-8 h-8" /> : <UploadCloud size={28} />}
              </div>
              <h4 className="text-sm font-bold text-foreground mb-1">اسحب ملف الصوت أو اضغط للتصفح</h4>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">الامتدادات المدعومة: MP3, WAV, OGG بحد أقصى 5 ميجابايت للملف</p>

              {isUploading && (
                <div className="w-full max-w-xs mt-4">
                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <span className="text-[10px] text-primary font-bold mt-1.5 block">{uploadProgress}% جاري الرفع...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info & Tester Panel */}
        <div className="space-y-8">
          {/* Test Sandbox */}
          <div className="card p-6 md:p-8 space-y-6 shadow-md bg-gradient-to-br from-primary/[0.03] to-indigo-500/[0.03]">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Eye size={18} className="text-primary animate-pulse" />
              منطقة تجربة الإشعار
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              قم بتجربة محاكاة استدعاء عميل واختبر الصوت، والاهتزاز، والـ Browser Notification معاً في لحظة واحدة!
            </p>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-foreground/80 px-1">رقم التذكرة للتجربة</label>
              <input 
                type="number"
                value={previewTicketNumber}
                onChange={(e) => setPreviewTicketNumber(parseInt(e.target.value) || 1)}
                className="input h-11 text-center font-black bg-surface border-border"
              />
            </div>

            <button
              onClick={handleTriggerTestPreview}
              className="btn btn-primary w-full h-12 text-sm font-black shadow-glow flex items-center justify-center gap-2"
            >
              <Play size={16} fill="currentColor" />
              أطلق تجربة تنبيه الاستدعاء
            </button>
          </div>

          {/* Browser Notification Helper */}
          <div className="card p-6 md:p-8 space-y-4 shadow-md">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Smartphone size={16} className="text-muted-foreground" />
              إشعارات المتصفح والـ PWA
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              تفعيل إشعارات سطح المكتب يضمن استلامك واستلام العملاء للإشعارات حتى في حال تصغير النافذة أو استخدام الموبايل كـ PWA.
            </p>

            <div className="pt-2">
              {browserNotifications ? (
                <div className="p-3 bg-success/10 text-success border border-success/20 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
                  <Check size={16} strokeWidth={3} />
                  إشعارات المتصفح مفعلة ونشطة
                </div>
              ) : (
                <button
                  onClick={handleRequestPushPermission}
                  className="btn btn-secondary w-full h-11 text-xs font-bold"
                >
                  تفعيل إشعارات المتصفح
                </button>
              )}
            </div>
          </div>

          {/* System Autoplay Info */}
          <div className="card p-6 md:p-8 bg-amber-500/5 border border-amber-500/10 rounded-[2rem] space-y-3">
            <div className="flex items-center gap-2 text-amber-600 font-extrabold text-xs">
              <ShieldAlert size={16} />
              ملاحظة قيود تشغيل الأصوات
            </div>
            <p className="text-[11px] text-amber-700/80 leading-relaxed">
              تشترط المتصفحات الحديثة (Chrome, Safari, iOS Safari) حصول تفاعل للمستخدم مع الصفحة (كقرص زر أو لمسة شاشة) كشرط أساسي للسماح بتشغيل الأصوات (Autoplay restrictions). نظام دورك الذكي يتعامل مع هذا القيد بشكل تلقائي لضمان عمل النغمات بثبات.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
