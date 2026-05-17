"use client";
// ============================================
// دورك - صفحة الانضمام للطابور (عند مسح QR)
// URL: /q/[code]
// ============================================

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Users, Clock, AlertCircle, CheckCircle2, 
  ArrowRight, Loader2, MapPin,
  User, Phone, XCircle
} from "lucide-react";
import axios, { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Shop, Queue } from "@/types";

interface QrData {
  shop: Shop & {
    openTime?: string;
    closeTime?: string;
    registrationEndTime?: string;
  };
  shopStatus: {
    status: string;
    message: string;
    canRegister: boolean;
    nextRegistrationTime?: string;
    nextBreakTime?: {
      title: string;
      startTime: string;
      endTime: string;
    };
    remainingDailyLimit?: number;
  };
  queue: Queue & { waitingCount: number; estimatedWait: number };
}

interface QrPageProps {
  params: Promise<{ code: string }>;
}

export default function JoinQueuePage({ params }: QrPageProps) {
  const router = useRouter();
  const { code } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<QrData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    const fetchQrData = async () => {
      try {
        console.log("Fetching QR data for code:", code);
        const res = await axios.get(`/api/qr/${code}`);
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError(res.data.error || "كود QR غير صالح");
        }
      } catch (err: any) {
        console.error("QR Fetch Error:", err);
        const msg = err.response?.data?.error || "حدث خطأ أثناء التحقق من الكود";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    if (code) fetchQrData();
  }, [code]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.queue?.id) return;

    setSubmitting(true);
    try {
      const res = await axios.post("/api/tickets", {
        queueId: data.queue.id,
        customerName: formData.name,
        customerPhone: formData.phone,
      });

      if (res.data.success) {
        const ticketToken = res.data.data.ticket.customerToken;
        toast.success("تم الانضمام بنجاح!");
        router.push(`/ticket/${ticketToken}`);
      }
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.error : "حدث خطأ أثناء الانضمام";
      toast.error(message || "حدث خطأ أثناء الانضمام");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-slate-500 font-bold animate-pulse">جاري التحميل...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <AlertCircle className="text-red-500 mb-4" size={60} />
        <h1 className="text-2xl font-black mb-2">{error || "عذراً، كود QR غير صحيح"}</h1>
        <p className="text-slate-500 mb-8">يرجى التأكد من مسح الكود الصحيح الموجود في المحل.</p>
        <div className="flex flex-col gap-3">
          <button onClick={() => window.location.reload()} className="btn btn-primary">إعادة المحاولة</button>
          <button onClick={() => router.push("/")} className="btn btn-secondary">العودة للرئيسية</button>
        </div>
      </div>
    );
  }

  const { shop, queue, shopStatus } = data;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header with Shop Info */}
      <div className="gradient-hero pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-md mx-auto relative z-10 flex flex-col items-center text-center text-white">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }}
            className="relative w-24 h-24 rounded-3xl bg-white p-1 shadow-2xl mb-4 overflow-hidden"
          >
            {shop.logo ? (
              <Image src={shop.logo} alt={shop.name} fill sizes="96px" className="object-cover" />
            ) : (
              <div className="w-full h-full gradient-primary flex items-center justify-center text-3xl font-black">
                {shop.name.charAt(0)}
              </div>
            )}
          </motion.div>
          <h1 className="text-2xl font-black mb-1">{shop.nameAr || shop.name}</h1>
          <p className="opacity-80 text-sm flex items-center gap-1 justify-center">
            <MapPin size={14} />
            {shop.address || "الموقع غير محدد"}
          </p>
          
          {shop.openTime && (
            <div className="mt-4 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/10">
              ساعات العمل: {shop.openTime} - {shop.closeTime}
            </div>
          )}
        </div>
      </div>

      {/* Main Form Content */}
      <div className="max-w-md mx-auto px-6 -mt-16 relative z-20">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="card p-6 shadow-xl mb-6"
        >
          {shopStatus.canRegister ? (
            <>
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-1">في الانتظار</div>
                  <div className="text-xl font-black text-blue-600 flex items-center gap-1">
                    <Users size={18} />
                    {queue.waitingCount}
                  </div>
                </div>
                <div className="h-10 w-px bg-slate-100" />
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-1">الوقت المتوقع</div>
                  <div className="text-xl font-black text-blue-600 flex items-center gap-1">
                    <Clock size={18} />
                    {queue.estimatedWait} د
                  </div>
                </div>
              </div>

              {shopStatus.nextBreakTime && (
                <div className="mb-6 p-3 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-3 text-orange-700">
                  <Clock size={18} />
                  <div className="text-xs font-bold">
                    الاستراحة القادمة: {shopStatus.nextBreakTime.startTime} ({shopStatus.nextBreakTime.title})
                  </div>
                </div>
              )}

              {shopStatus.remainingDailyLimit !== undefined && shopStatus.remainingDailyLimit <= 5 && (
                <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
                  <AlertCircle size={18} />
                  <div className="text-xs font-bold">
                    متبقي {shopStatus.remainingDailyLimit} أماكن فقط لليوم!
                  </div>
                </div>
              )}

              <h2 className="text-lg font-black mb-6 text-center">أدخل بياناتك للحصول على رقم</h2>
              
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2 mr-1">الاسم (اختياري)</label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="مثلاً: محمد علي"
                      className="input pr-12"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 mr-1">رقم الهاتف (اختياري)</label>
                  <div className="relative">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="tel"
                      placeholder="لإرسال إشعار لك"
                      className="input pr-12 text-left"
                      dir="ltr"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 mr-1">سنقوم بإرسال إشعار لك عندما يقترب دورك</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary w-full py-5 text-lg font-black gap-2 shadow-blue-500/25 mt-4"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      جاري الانضمام...
                    </>
                  ) : (
                    <>
                      احصل على رقمي
                      <ArrowRight size={22} className="rotate-180" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                shopStatus.status === 'BREAK' ? 'bg-orange-50' : 'bg-red-50'
              }`}>
                {shopStatus.status === 'BREAK' ? (
                  <Clock className="text-orange-500" size={40} />
                ) : (
                  <XCircle className="text-red-500" size={40} />
                )}
              </div>
              <h2 className="text-xl font-black mb-3">{shopStatus.message}</h2>
              <p className="text-slate-500 leading-relaxed">
                {shopStatus.status === 'BREAK' 
                  ? 'المحل حالياً في فترة استراحة قصيرة، يرجى المحاولة مرة أخرى لاحقاً.'
                  : 'نعتذر منك، التسجيل غير متاح حالياً. يرجى مراجعة ساعات العمل أو زيارتنا في وقت آخر.'}
              </p>
              {shopStatus.nextRegistrationTime && (
                <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-blue-700 font-bold text-sm">يبدأ التسجيل في تمام الساعة</p>
                  <p className="text-2xl font-black text-blue-600 mt-1">{shopStatus.nextRegistrationTime}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Benefits Footer */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4 text-center border-none bg-blue-50">
            <CheckCircle2 className="text-blue-500 mx-auto mb-2" size={24} />
            <div className="text-[10px] font-bold text-blue-700 uppercase">بدون تطبيق</div>
            <div className="text-xs text-blue-900 font-bold">مباشرة من المتصفح</div>
          </div>
          <div className="card p-4 text-center border-none bg-indigo-50">
            <Clock className="text-indigo-500 mx-auto mb-2" size={24} />
            <div className="text-[10px] font-bold text-indigo-700 uppercase">تحديث لحظي</div>
            <div className="text-xs text-indigo-900 font-bold">تابع دورك مباشرة</div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            مشغل بواسطة <span className="font-bold text-slate-600">منصة دورك</span>
          </p>
        </div>
      </div>
    </div>
  );
}
