"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserCheck, SkipForward, XCircle,
  Loader2, Plus, Ticket as TicketIcon,
  Play, Pause, RefreshCw, CheckCircle2,
  Trash2, X, Square, UserMinus, Layers, ChevronRight,
  Clock
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { io as socketIO, Socket } from "socket.io-client";
import { cn } from "@/lib/utils";

type Ticket = {
  id: string;
  ticketNumber: number;
  customerName: string | null;
  status: string;
  createdAt: string;
  position: number;
  calledAt?: string | null;
};

type QueueDetail = {
  id: string;
  name: string;
  nameAr?: string | null;
  status: "OPEN" | "PAUSED" | "CLOSED";
  currentNumber: number;
  waitingCount: number;
  avgServiceTime: number;
  tickets: Ticket[];
};

type CreateQueueForm = {
  name: string;
  nameAr: string;
  avgServiceTime: number;
  maxCapacity: number;
};

export default function QueuesManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [queues, setQueues] = useState<QueueDetail[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateQueueForm>({
    name: "", nameAr: "", avgServiceTime: 15, maxCapacity: 100,
  });
  const [creating, setCreating] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get("/api/queues?includeTickets=true");
      if (res.data.success) {
        setQueues(res.data.data);
        if (!selectedQueueId && res.data.data.length > 0) {
          setSelectedQueueId(res.data.data[0].id);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedQueueId]);

  // WebSocket for real-time updates
  useEffect(() => {
    if (!user?.shopId) return;
    const socket = socketIO({ path: "/api/socket", reconnection: true, reconnectionDelay: 2000 });
    socketRef.current = socket;
    socket.emit("join:shop", user.shopId);
    socket.on("QUEUE_UPDATED", () => fetchData());
    socket.on("TICKET_UPDATED", () => fetchData());
    socket.on("ticket:called", () => fetchData());
    socket.on("connect_error", () => console.warn("[Socket] connection error"));
    return () => { socket.disconnect(); };
  }, [user?.shopId, fetchData]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const selectedQueue = queues.find(q => q.id === selectedQueueId);

  const handleQueueStatus = async (id: string, current: string) => {
    let newStatus: string;
    if (current === "OPEN") newStatus = "PAUSED";
    else if (current === "PAUSED") newStatus = "OPEN";
    else newStatus = "OPEN"; // CLOSED → OPEN
    try {
      await axios.patch(`/api/queues/${id}/status`, { status: newStatus });
      const labels: Record<string, string> = { OPEN: "تم فتح الطابور", PAUSED: "تم إيقاف الطابور مؤقتاً" };
      toast.success(labels[newStatus] || "تم تحديث الطابور");
      fetchData();
    } catch { toast.error("فشل تغيير حالة الطابور"); }
  };

  const handleCloseQueue = async (id: string) => {
    try {
      await axios.patch(`/api/queues/${id}/status`, { status: "CLOSED" });
      toast.success("تم إغلاق الطابور");
      fetchData();
    } catch { toast.error("فشل إغلاق الطابور"); }
  };

  const handleDeleteQueue = async () => {
    if (!selectedQueueId) return;
    try {
      await axios.delete(`/api/queues/${selectedQueueId}`);
      toast.success("تم حذف الطابور");
      setShowDeleteConfirm(false);
      setSelectedQueueId(null);
      fetchData();
    } catch { toast.error("فشل حذف الطابور"); }
  };

  const handleCallNext = async () => {
    if (!selectedQueueId) return;
    setActionLoading(true);
    try {
      const res = await axios.post(`/api/queues/${selectedQueueId}/call-next`);
      if (res.data.data) {
        toast.success(`تم استدعاء رقم ${res.data.data.ticketNumber}`, { icon: "🔔" });
      } else {
        toast("لا يوجد أحد في الانتظار", { icon: "ℹ️" });
      }
      fetchData();
    } catch { toast.error("فشل الاستدعاء"); }
    finally { setActionLoading(false); }
  };

  const handleTicketAction = async (ticketId: string, action: string) => {
    try {
      await axios.post(`/api/tickets/${ticketId}/action`, { action });
      const labels: Record<string, string> = {
        COMPLETE: "تمت الخدمة", SKIP: "تم التخطي", CANCEL: "تم الإلغاء",
        RECALL: "تم الاستدعاء مجدداً", START_SERVING: "بدأت الخدمة",
      };
      toast.success(labels[action] || "تم تنفيذ الإجراء");
      fetchData();
    } catch { toast.error("فشل تنفيذ الإجراء"); }
  };

  const handleCreateQueue = async () => {
    if (!createForm.name.trim()) { toast.error("اسم الطابور مطلوب"); return; }
    setCreating(true);
    try {
      await axios.post("/api/queues", createForm);
      toast.success("تم إنشاء الطابور بنجاح");
      setShowCreateModal(false);
      setCreateForm({ name: "", nameAr: "", avgServiceTime: 15, maxCapacity: 100 });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "فشل إنشاء الطابور");
    } finally { setCreating(false); }
  };

  const statusLabel = (s: string) =>
    ({ OPEN: "مفتوح", PAUSED: "متوقف", CLOSED: "مغلق" }[s] || s);
  const statusColor = (s: string) =>
    ({ OPEN: "bg-emerald-50 text-emerald-600", PAUSED: "bg-amber-50 text-amber-600", CLOSED: "bg-slate-100 text-slate-500" }[s] || "");
  const statusDot = (s: string) =>
    ({ OPEN: "bg-emerald-500", PAUSED: "bg-amber-500", CLOSED: "bg-slate-400" }[s] || "bg-slate-400");

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-primary mb-4" size={40} />
      <p className="text-muted-foreground font-bold">جاري تحميل الطوابير...</p>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-4">
             <div className="p-3 bg-primary/10 rounded-2xl border border-primary/10 shadow-sm">
              <Layers className="w-8 h-8 text-primary" />
            </div>
            إدارة الطوابير الحية
          </h1>
          <p className="text-muted-foreground font-medium text-sm sm:text-base mt-2">إدارة العملاء، الاستدعاء، والتحكم في حالة الطوابير لحظياً</p>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button onClick={() => fetchData()} className="p-3 bg-surface hover:bg-surface-2 border border-border rounded-xl transition-all text-muted-foreground hover:text-primary shadow-sm group">
            <RefreshCw size={20} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary gap-3 px-8 h-12 text-sm font-bold shadow-glow">
            <Plus size={20} /> إنشاء طابور جديد
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8 sm:gap-10">
        {/* Sidebar: Queues List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">قائمة الطوابير</h3>
            <span className="badge-premium bg-primary/10 text-primary border-primary/20">{queues.length}</span>
          </div>
          
          {queues.length === 0 && !loading && (
            <div className="card p-12 text-center text-muted-foreground bg-surface-2/30 border-dashed border-2">
              <TicketIcon size={40} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold text-sm">لا توجد طوابير حالياً</p>
            </div>
          )}

          {/* Horizontal scroll on mobile, vertical on desktop */}
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-4 pb-4 lg:pb-0 scrollbar-hide -mx-2 px-2">
            {queues.map((q) => (
              <button
                key={q.id}
                onClick={() => setSelectedQueueId(q.id)}
                className={`flex-shrink-0 w-[240px] lg:w-full text-right p-5 rounded-[1.5rem] border-2 transition-all relative overflow-hidden group ${
                  selectedQueueId === q.id
                    ? "border-primary bg-primary/5 text-primary shadow-glow"
                    : "border-border bg-surface hover:border-primary/20 hover:bg-surface-2 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-extrabold text-sm truncate ml-3">{q.nameAr || q.name}</span>
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${statusDot(q.status)}`} />
                </div>
                <div className="text-[11px] font-bold opacity-60 mb-4 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Users size={12} /> {q.waitingCount}</span>
                  <span className="w-1 h-1 rounded-full bg-current opacity-20" />
                  <span className="flex items-center gap-1"><Clock size={12} /> {q.avgServiceTime}د</span>
                </div>
                <div className={`badge-premium border-none text-[9px] px-3 py-1 ${statusColor(q.status)}`}>
                  {statusLabel(q.status)}
                </div>
                {selectedQueueId === q.id && (
                  <motion.div layoutId="activeQueueIndicator" className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-1 bg-primary rounded-l-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Panel */}
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence mode="wait">
            {selectedQueue ? (
              <motion.div
                key={selectedQueue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Control Card */}
                <div className="card p-8 sm:p-12 bg-surface shadow-lg border-border/50 text-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-2 gradient-primary opacity-80" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-12">
                    <div className="text-right">
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">{selectedQueue.nameAr || selectedQueue.name}</h2>
                      <div className="flex items-center gap-3 mt-3">
                        <span className={`badge-premium px-5 py-1.5 rounded-full border-none font-extrabold ${statusColor(selectedQueue.status)}`}>
                          {statusLabel(selectedQueue.status)}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-surface-2 px-3 py-1.5 rounded-full border border-border/50">ID: {selectedQueue.id.slice(0, 8)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-center">
                      {selectedQueue.status !== "CLOSED" && (
                        <button
                          onClick={() => handleQueueStatus(selectedQueue.id, selectedQueue.status)}
                          className={`p-3.5 rounded-2xl border transition-all shadow-sm ${
                            selectedQueue.status === "OPEN"
                              ? "bg-warning/5 text-warning border-warning/20 hover:bg-warning/10"
                              : "bg-success/5 text-success border-success/20 hover:bg-success/10"
                          }`}
                        >
                          {selectedQueue.status === "OPEN" ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                      )}
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="p-3.5 rounded-2xl border border-danger/10 bg-danger/5 text-danger hover:bg-danger/10 transition-all shadow-sm"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </div>

                  <div className="py-6 relative">
                    <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4 opacity-60">الرقم الحالي قيد الخدمة</div>
                      <div className="text-8xl sm:text-9xl font-extrabold gradient-text mb-12 tracking-tighter drop-shadow-md">
                        {selectedQueue.currentNumber || "---"}
                      </div>
                      
                      <div className="flex items-center justify-center gap-10 sm:gap-20 mb-16">
                        <div className="text-center group/stat">
                          <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-2 opacity-60 group-hover/stat:text-primary transition-colors">في الانتظار</div>
                          <div className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">{selectedQueue.waitingCount}</div>
                        </div>
                        <div className="w-px h-16 bg-border opacity-50" />
                        <div className="text-center group/stat">
                          <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-2 opacity-60 group-hover/stat:text-primary transition-colors">وقت الخدمة</div>
                          <div className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">{selectedQueue.avgServiceTime}<span className="text-xl ml-1 font-bold text-muted-foreground">د</span></div>
                        </div>
                      </div>

                      <div className="max-w-md mx-auto">
                        <button
                          onClick={handleCallNext}
                          disabled={actionLoading || selectedQueue.status !== "OPEN"}
                          className="btn btn-primary w-full py-6 text-xl font-extrabold gap-5 shadow-glow disabled:opacity-50 active:scale-[0.98] transition-all rounded-3xl"
                        >
                          {actionLoading ? <Loader2 className="animate-spin" size={28} /> : <UserCheck size={32} />}
                          استدعاء العميل التالي
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tickets Table Section */}
                <div className="card overflow-hidden shadow-lg border-border/50">
                  <div className="p-6 sm:p-10 border-b border-border bg-surface-2/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <h4 className="font-bold text-lg text-foreground flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                        <Users size={22} />
                      </div>
                      قائمة الانتظار الحالية
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="badge-premium bg-primary/5 text-primary border-primary/10 px-5 py-2 rounded-full font-bold text-xs">
                        {selectedQueue.tickets?.filter(t => t.status === "WAITING").length || 0} عملاء ينتظرون
                      </div>
                    </div>
                  </div>

                  <div className="table-container border-none rounded-none shadow-none">
                    <table className="table-premium">
                      <thead>
                        <tr>
                          <th className="w-32">رقم التذكرة</th>
                          <th>العميل</th>
                          <th className="hidden sm:table-cell">وقت الوصول</th>
                          <th>الحالة</th>
                          <th className="text-left">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedQueue.tickets?.filter(t => ["WAITING", "CALLED", "SERVING"].includes(t.status)).map((ticket) => (
                          <tr key={ticket.id} className={cn(
                            "group transition-all duration-300",
                            ticket.status === "CALLED" ? "bg-warning/[0.03] animate-pulse" : "hover:bg-primary/[0.01]"
                          )}>
                            <td>
                              <span className="text-2xl font-extrabold text-primary tracking-tight">#{ticket.ticketNumber}</span>
                            </td>
                            <td>
                              <div className="font-bold text-foreground text-base group-hover:text-primary transition-colors">{ticket.customerName || "عميل زائر"}</div>
                              <div className="sm:hidden text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-wider">
                                {new Date(ticket.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </td>
                            <td className="hidden sm:table-cell">
                              <div className="text-sm font-semibold text-muted-foreground">
                                {new Date(ticket.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </td>
                            <td>
                              {ticket.status === "WAITING" && (
                                <span className="badge-premium bg-surface-2 text-muted-foreground border-border/50 font-bold">
                                  دور رقم {ticket.position}
                                </span>
                              )}
                              {ticket.status === "CALLED" && (
                                <span className="badge-premium bg-warning/10 text-warning border-warning/20 font-extrabold animate-bounce">
                                  يتم الاستدعاء...
                                </span>
                              )}
                              {ticket.status === "SERVING" && (
                                <span className="badge-premium bg-success/10 text-success border-success/20 font-extrabold">
                                  قيد الخدمة الآن
                                </span>
                              )}
                            </td>
                            <td className="text-left">
                              <div className="flex justify-end gap-2 sm:gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                {ticket.status === "CALLED" && (
                                  <>
                                    <button onClick={() => handleTicketAction(ticket.id, "START_SERVING")} className="p-3 rounded-xl bg-success/10 text-success hover:bg-success hover:text-white transition-all shadow-sm border border-success/10" title="بدء الخدمة"><Play size={18} /></button>
                                    <button onClick={() => handleTicketAction(ticket.id, "RECALL")} className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm border border-primary/10" title="إعادة استدعاء"><RefreshCw size={18} /></button>
                                  </>
                                )}
                                {ticket.status === "SERVING" && (
                                  <button onClick={() => handleTicketAction(ticket.id, "COMPLETE")} className="p-3 rounded-xl bg-success/10 text-success hover:bg-success hover:text-white transition-all shadow-sm border border-success/10" title="إتمام الخدمة"><CheckCircle2 size={18} /></button>
                                )}
                                <button onClick={() => handleTicketAction(ticket.id, "SKIP")} className="p-3 rounded-xl bg-warning/10 text-warning hover:bg-warning hover:text-white transition-all shadow-sm border border-warning/10" title="تخطي"><SkipForward size={18} /></button>
                                <button onClick={() => handleTicketAction(ticket.id, "CANCEL")} className="p-3 rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all shadow-sm border border-danger/10" title="إلغاء"><X size={18} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!selectedQueue.tickets || selectedQueue.tickets.filter(t => ["WAITING", "CALLED", "SERVING"].includes(t.status)).length === 0) && (
                      <div className="py-24 text-center text-muted-foreground bg-surface-2/10">
                        <div className="w-20 h-20 rounded-[2rem] bg-surface-2 border border-border flex items-center justify-center mx-auto mb-6 opacity-30 shadow-inner">
                          <Users size={40} />
                        </div>
                        <p className="font-bold text-base uppercase tracking-widest text-muted-foreground/60">لا يوجد عملاء في الانتظار حالياً</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[540px] text-center card bg-surface-2/30 border-dashed border-2 shadow-inner px-8">
                <div className="w-24 h-24 rounded-[2.5rem] bg-surface border border-border flex items-center justify-center text-muted-foreground/30 mb-8 shadow-sm">
                  <TicketIcon size={48} />
                </div>
                <h3 className="text-2xl font-extrabold text-foreground mb-3 tracking-tight">لم يتم تحديد طابور</h3>
                <p className="text-muted-foreground max-w-sm font-medium text-base leading-relaxed">اختر أحد الطوابير من القائمة الجانبية لإدارة العملاء أو قم بإنشاء طابور جديد للبدء.</p>
                <button onClick={() => setShowCreateModal(true)} className="btn btn-secondary mt-10 h-12 px-10 font-bold border-primary/20 text-primary hover:bg-primary/5">إنشاء طابور جديد</button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Queue Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card max-w-md w-full p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">إنشاء طابور جديد</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">اسم الطابور (عربي) *</label>
                  <input type="text" className="input w-full" placeholder="مثال: الطابور الرئيسي" value={createForm.nameAr} onChange={e => setCreateForm(f => ({ ...f, nameAr: e.target.value, name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">متوسط وقت الخدمة (د)</label>
                    <input type="number" className="input w-full" min={1} max={120} value={createForm.avgServiceTime} onChange={e => setCreateForm(f => ({ ...f, avgServiceTime: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">الحد الأقصى للعملاء</label>
                    <input type="number" className="input w-full" min={1} max={500} value={createForm.maxCapacity} onChange={e => setCreateForm(f => ({ ...f, maxCapacity: Number(e.target.value) }))} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary flex-1 py-3">إلغاء</button>
                <button onClick={handleCreateQueue} disabled={creating} className="btn btn-primary flex-1 py-3 gap-2">
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  إنشاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card max-w-sm w-full p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center mx-auto">
                <Trash2 size={32} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-2">حذف الطابور؟</h2>
                <p className="text-slate-500 font-bold text-sm">سيتم إلغاء جميع التذاكر النشطة وحذف الطابور نهائياً. لا يمكن التراجع عن هذا الإجراء.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary flex-1 py-3">إلغاء</button>
                <button onClick={handleDeleteQueue} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black hover:bg-red-600 transition-colors">
                  حذف نهائياً
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
