import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell,
  CheckCircle2, XCircle, RefreshCw, 
  Phone, MapPin, Ticket as TicketIcon, Volume2
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { Ticket } from "@/types";
import { useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import { playSound } from "@/lib/soundSynthesizer";

interface TicketPageProps {
  params: Promise<{ token: string }>;
}

export default function TicketStatusPage({ params }: TicketPageProps) {
  const router = useRouter();
  const { token } = use(params);
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const { socket } = useSocket();
  const [hasInteracted, setHasInteracted] = useState(false);

  const fetchTicketStatus = useCallback(async () => {
    try {
      const res = await axios.get(`/api/tickets/${token}`);
      if (res.data.success) {
        const newData = res.data.data;
        
        // Notification & Sound logic
        if (ticket && newData.status === "CALLED" && ticket.status === "WAITING") {
          const soundSettings = newData.shop?.settings?.notifications || {};
          const isEnabled = soundSettings.soundEnabled ?? true;
          const selectedChime = soundSettings.selectedSound ?? "classic-bell";
          const customUrl = soundSettings.customSoundUrl ?? null;
          const volume = soundSettings.volume ?? 0.8;
          const vibrateEnabled = soundSettings.vibrate ?? true;

          if (isEnabled) {
            const finalChime = selectedChime === "custom" && customUrl ? customUrl : selectedChime;
            playSound(finalChime, volume);
          }

          if (vibrateEnabled && typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`حان دورك الآن! تذكرة رقم ${newData.ticketNumber}`, { 
              body: `يرجى التوجه إلى منطقة الخدمة في ${newData.shop.nameAr || newData.shop.name}`,
              icon: newData.shop.logo || undefined
            });
          }
          toast("حان دورك الآن! يرجى التوجه للموظف", { icon: '🔔', duration: 10000 });
        }

        setTicket(newData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token, ticket]);

  // Real-time WebSocket listener
  useEffect(() => {
    if (socket && ticket?.queueId) {
      // Join the queue room
      socket.emit("join:queue", ticket.queueId);

      const handleCalled = (data: any) => {
        if (data && (data.id === ticket.id || data.ticketNumber === ticket.ticketNumber)) {
          fetchTicketStatus();
        }
      };

      const handleUpdated = () => {
        fetchTicketStatus();
      };

      socket.on("ticket:called", handleCalled);
      socket.on("position:updated", handleUpdated);
      socket.on("queue:status", handleUpdated);

      return () => {
        socket.off("ticket:called", handleCalled);
        socket.off("position:updated", handleUpdated);
        socket.off("queue:status", handleUpdated);
      };
    }
  }, [socket, ticket?.id, ticket?.queueId, fetchTicketStatus]);

  // Poll for updates every 15 seconds as a robust backup
  useEffect(() => {
    const fetchStatus = async () => {
      await fetchTicketStatus();
    };
    fetchStatus();
    const interval = setInterval(fetchTicketStatus, 15000);
    return () => clearInterval(interval);
  }, [token, fetchTicketStatus]);


  const handleCancel = async () => {
    if (!confirm("هل أنت متأكد من إلغاء دورك؟")) return;
    
    setCancelling(true);
    try {
      await axios.post(`/api/tickets/${token}/cancel`);
      toast.success("تم إلغاء الدور بنجاح");
      fetchTicketStatus();
    } catch (error) {
      console.error(error);
    } finally {
      setCancelling(false);
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          toast.success("تم تفعيل الإشعارات");
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <RefreshCw className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-500 font-bold animate-pulse">جاري تحديث الحالة...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="text-red-500 mb-4" size={60} />
        <h1 className="text-2xl font-black mb-2">التذكرة غير موجودة</h1>
        <p className="text-slate-500 mb-8">عذراً، لم نتمكن من العثور على بيانات التذكرة الخاصة بك.</p>
      </div>
    );
  }

  const isCalled = ticket.status === "CALLED";
  const isWaiting = ticket.status === "WAITING";
  const isFinished = ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(ticket.status);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header Info */}
      <div className={`pt-12 pb-24 px-6 relative overflow-hidden transition-colors duration-700 ${isCalled ? 'bg-amber-500' : 'bg-blue-600'}`}>
        <div className="max-w-md mx-auto relative z-10 flex flex-col items-center text-center text-white">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md p-4 mb-4 shadow-xl">
            <TicketIcon size={48} />
          </div>
          <h1 className="text-xl font-bold mb-1">{ticket.shop?.nameAr || ticket.shop?.name}</h1>
          <p className="opacity-80 text-sm">{ticket.queue?.nameAr || ticket.queue?.name}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-16 relative z-20">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="card overflow-hidden shadow-2xl border-none"
        >
          {/* Ticket Number Section */}
          <div className="p-8 text-center bg-white">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">رقم تذكرتك هو</div>
            <div className={`ticket-number mb-4 ${isCalled ? 'pulse-ring' : ''}`}>
              {ticket.ticketNumber}
            </div>
            
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold ${
              isCalled ? 'bg-amber-100 text-amber-700' : 
              isWaiting ? 'bg-blue-100 text-blue-700' : 
              'bg-slate-100 text-slate-700'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                isCalled ? 'bg-amber-500' : isWaiting ? 'bg-blue-500' : 'bg-slate-500'
              }`} />
              {isCalled ? 'حان دورك الآن!' : isWaiting ? 'في الانتظار' : 'انتهى الدور'}
            </div>
          </div>

          {/* Stats Bar */}
          {!isFinished && (
            <div className="grid grid-cols-2 border-y border-slate-50 bg-slate-50/50">
              <div className="p-6 text-center border-l border-slate-50">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">ترتيبك الحالي</div>
                <div className="text-3xl font-black text-slate-800">
                  {isCalled ? "0" : ticket.position}
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">الوقت المتوقع</div>
                <div className="text-3xl font-black text-slate-800 flex items-center justify-center gap-1">
                  {ticket.estimatedWait}
                  <span className="text-xs font-bold text-slate-400">دق</span>
                </div>
              </div>
            </div>
          )}

          {/* Action/Info Content */}
          <div className="p-8 bg-white">
            <AnimatePresence mode="wait">
              {isCalled ? (
                <motion.div 
                  key="called"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <Bell className="text-amber-600 animate-bounce" size={32} />
                  </div>
                  <h3 className="text-xl font-black text-amber-700 mb-2">يرجى التوجه للموظف!</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    لقد حان دورك الآن، نرجو منك التوجه إلى منطقة تقديم الخدمة مباشرة.
                  </p>
                </motion.div>
              ) : isWaiting ? (
                <motion.div key="waiting" className="space-y-6">
                  {!hasInteracted && (
                    <div 
                      onClick={() => {
                        setHasInteracted(true);
                        playSound("classic-bell", 0.05);
                        toast.success("تم تفعيل التنبيهات الصوتية بنجاح!", { icon: "🔊" });
                      }}
                      className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100/80 cursor-pointer border border-amber-200 flex gap-4 items-center transition-all animate-pulse"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 text-white shadow-md">
                        <Volume2 size={20} />
                      </div>
                      <div className="flex-1 text-right">
                        <h4 className="text-xs font-black text-amber-900 mb-0.5">اضغط لتفعيل الصوت</h4>
                        <p className="text-[10px] text-amber-700 leading-normal">يرجى الضغط هنا للتأكد من تشغيل نغمة الاستدعاء فوراً عند وصول دورك.</p>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-blue-50 flex gap-4 items-start border border-blue-100">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                      <Bell className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-blue-900 mb-1">هل تود تفعيل الإشعارات؟</h4>
                      <p className="text-xs text-blue-700 leading-relaxed mb-3">
                        سنرسل لك إشعاراً عندما يقترب دورك لكي تستطيع التحرك بحرية.
                      </p>
                      <button 
                        onClick={requestNotificationPermission}
                        className="text-xs font-bold px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        تفعيل التنبيهات
                      </button>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-4 flex items-center justify-center gap-1">
                      <RefreshCw size={12} className="animate-spin" />
                      يتم التحديث تلقائياً كل 10 ثوانٍ
                    </p>
                    <button 
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors flex items-center justify-center gap-1 mx-auto"
                    >
                      {cancelling ? <RefreshCw className="animate-spin" size={14} /> : <XCircle size={14} />}
                      إلغاء تذكرة الانتظار
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="finished" className="text-center py-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    ticket.status === 'COMPLETED' ? 'bg-green-100' : 'bg-slate-100'
                  }`}>
                    {ticket.status === 'COMPLETED' ? <CheckCircle2 className="text-green-600" size={32} /> : <XCircle className="text-slate-500" size={32} />}
                  </div>
                  <h3 className="text-xl font-black mb-2">
                    {ticket.status === 'COMPLETED' ? 'تمت خدمتك بنجاح' : 
                     ticket.status === 'CANCELLED' ? 'تم إلغاء التذكرة' : 'انتهى وقت الانتظار'}
                  </h3>
                  <p className="text-sm text-slate-500 mb-8">نتمنى أن تكون تجربتك مع {ticket.shop?.nameAr || ticket.shop?.name} مرضية.</p>
                  <button 
                    onClick={() => router.push(`/q/${token.substring(0, 8)}`)} 
                    className="btn btn-secondary w-full"
                  >
                    انضم للطابور مرة أخرى
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Shop Contact Info */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
              <MapPin size={20} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">الموقع</div>
              <div className="text-xs font-bold text-slate-700">{ticket.shop?.address || "غير محدد"}</div>
            </div>
          </div>
          {ticket.shop?.phone && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Phone size={20} />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">للاتصال بالمحل</div>
                <div className="text-xs font-bold text-slate-700" dir="ltr">{ticket.shop?.phone}</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
            مشغل بواسطة <span className="font-bold text-slate-600">منصة دورك</span>
          </p>
        </div>
      </div>
    </div>
  );
}
