"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Ticket, Plus, Calendar, Hash, Percent, Store, 
  Trash2, Loader2, Search, Info, CheckCircle2,
  Clock, AlertCircle, Sparkles
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Promo = {
  id: string
  code: string
  discountPercent: number
  startAt: string
  endAt: string
  maxUses?: number | null
  uses?: number
  shopId?: string | null
}

export default function PromotionsAdminPage() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ 
    code: "", 
    discountPercent: "10", 
    startAt: "", 
    endAt: "", 
    maxUses: "", 
    shopId: "" 
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { fetchPromos() }, [])

  async function fetchPromos() {
    setLoading(true)
    try {
      const res = await fetch('/api/promotions')
      const data = await res.json()
      setPromos(data)
    } catch (e: any) {
      setError(e?.message || 'فشل تحميل العروض الترويجية')
    } finally { setLoading(false) }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)
    setError(null)
    try {
      const payload = {
        code: form.code,
        discountPercent: Number(form.discountPercent),
        startAt: form.startAt || new Date().toISOString(),
        endAt: form.endAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        shopId: form.shopId || null,
      }
      const res = await fetch('/api/promotions', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      })
      if (!res.ok) throw new Error(await res.text())
      setForm({ code: '', discountPercent: '10', startAt: '', endAt: '', maxUses: '', shopId: '' })
      setShowAddForm(false)
      await fetchPromos()
    } catch (e: any) { 
      setError(e?.message || 'فشل إنشاء الكود') 
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 lg:pb-8 px-4 sm:px-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl">
              <Ticket className="w-7 h-7 text-primary" />
            </div>
            أكواد الخصم والعروض
          </h1>
          <p className="text-text-muted mt-1 font-medium italic">إدارة كوبونات الخصم والحملات الترويجية للمنصة</p>
        </div>
        
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={cn(
            "rounded-2xl h-12 px-6 font-black transition-all shadow-lg shadow-primary/20",
            showAddForm ? "bg-muted text-text-muted hover:bg-muted/80" : "btn-primary"
          )}
        >
          {showAddForm ? 'إلغاء' : (
            <>
              <Plus className="w-5 h-5 ml-2" />
              إنشاء كود جديد
            </>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-primary/20 bg-primary/[0.02] backdrop-blur-xl shadow-premium rounded-3xl">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted flex items-center gap-2 uppercase tracking-wider">
                      <Hash className="w-3 h-3" /> كود الخصم
                    </label>
                    <Input 
                      placeholder="مثال: DORAK2024" 
                      className="h-12 bg-white rounded-xl font-bold pr-4 border-border/60"
                      value={form.code} 
                      onChange={(e) => setForm({ ...form, code: e.target.value })} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted flex items-center gap-2 uppercase tracking-wider">
                      <Percent className="w-3 h-3" /> نسبة الخصم (%)
                    </label>
                    <Input 
                      type="number"
                      className="h-12 bg-white rounded-xl font-bold pr-4 border-border/60"
                      value={form.discountPercent} 
                      onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted flex items-center gap-2 uppercase tracking-wider">
                      <Calendar className="w-3 h-3" /> تاريخ البدء
                    </label>
                    <Input 
                      type="date"
                      className="h-12 bg-white rounded-xl font-bold pr-4 border-border/60"
                      value={form.startAt} 
                      onChange={(e) => setForm({ ...form, startAt: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted flex items-center gap-2 uppercase tracking-wider">
                      <Calendar className="w-3 h-3" /> تاريخ الانتهاء
                    </label>
                    <Input 
                      type="date"
                      className="h-12 bg-white rounded-xl font-bold pr-4 border-border/60"
                      value={form.endAt} 
                      onChange={(e) => setForm({ ...form, endAt: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted flex items-center gap-2 uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" /> أقصى استخدام
                    </label>
                    <Input 
                      type="number"
                      placeholder="اختياري (مثال: 100)"
                      className="h-12 bg-white rounded-xl font-bold pr-4 border-border/60"
                      value={form.maxUses} 
                      onChange={(e) => setForm({ ...form, maxUses: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted flex items-center gap-2 uppercase tracking-wider">
                      <Store className="w-3 h-3" /> مخصص لمتجر (ID)
                    </label>
                    <Input 
                      placeholder="اختياري (للعروض العامة اتركه فارغاً)"
                      className="h-12 bg-white rounded-xl font-bold pr-4 border-border/60"
                      value={form.shopId} 
                      onChange={(e) => setForm({ ...form, shopId: e.target.value })} 
                    />
                  </div>
                  <div className="md:col-span-3 pt-4 flex items-center justify-between border-t border-primary/10">
                    <p className="text-xs font-bold text-text-muted/60 max-w-sm">
                      تأكد من مراجعة كود الخصم ونسبته قبل الحفظ، حيث لا يمكن تعديل الكود بعد الإنشاء.
                    </p>
                    <div className="flex items-center gap-4">
                      {error && <div className="text-danger text-sm font-black flex items-center gap-2 bg-danger/5 px-4 py-2 rounded-xl border border-danger/10"><AlertCircle className="w-4 h-4" /> {error}</div>}
                      <Button type="submit" disabled={isCreating} className="btn-primary h-12 px-8 rounded-2xl font-black">
                        {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تفعيل الكود الآن'}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black text-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            الأكواد النشطة حالياً
          </h2>
          <div className="relative group hidden sm:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input placeholder="بحث عن كود..." className="h-10 pr-10 bg-surface rounded-xl border-border/40 w-64 text-sm font-bold" />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-black text-text-muted italic">جاري تحميل قائمة الأكواد...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {promos.length === 0 ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-muted/20 rounded-3xl border border-dashed border-border">
                  <div className="w-16 h-16 bg-muted/40 rounded-full flex items-center justify-center mb-4">
                    <Ticket className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-lg font-black text-text">لا توجد أكواد ترويجية</h3>
                  <p className="text-sm text-text-muted font-medium mt-1">ابدأ بإنشاء أول كود خصم لمنصتك الآن</p>
                </div>
              ) : (
                promos.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="border-border/50 bg-surface/50 backdrop-blur-xl shadow-premium rounded-3xl overflow-hidden group hover:border-primary/30 transition-all">
                      <CardContent className="p-0">
                        <div className="p-5 bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-border/30 relative overflow-hidden">
                          <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/20 rounded-full blur-2xl" />
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-white rounded-xl shadow-sm border border-border/40">
                                <Ticket className="w-5 h-5 text-primary" />
                              </div>
                              <span className="text-lg font-black text-text tracking-wider group-hover:text-primary transition-colors">{p.code}</span>
                            </div>
                            <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white shadow-sm">
                              <span className="text-xl font-black text-primary">%{p.discountPercent}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-5 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-text-muted uppercase tracking-tighter flex items-center gap-1">
                                <Clock className="w-3 h-3" /> الصلاحية
                              </p>
                              <p className="text-xs font-black text-text">
                                {new Date(p.endAt).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-text-muted uppercase tracking-tighter flex items-center gap-1">
                                <Store className="w-3 h-3" /> النطاق
                              </p>
                              <p className="text-xs font-black text-text">
                                {p.shopId ? 'متجر خاص' : 'عام للمنصة'}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-border/40">
                            <div className="flex items-center justify-between text-xs font-black">
                              <span className="text-text-muted">إجمالي الاستخدام</span>
                              <span className="text-text">{p.uses ?? 0} / {p.maxUses ?? '∞'}</span>
                            </div>
                            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 transition-all duration-500" 
                                style={{ width: p.maxUses ? `${((p.uses ?? 0) / p.maxUses) * 100}%` : '20%' }} 
                              />
                            </div>
                          </div>

                          <div className="pt-2 flex items-center justify-between">
                             <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted italic">
                               بدأ في: {new Date(p.startAt).toLocaleDateString('ar-SA')}
                             </div>
                             <button className="p-2 text-danger hover:bg-danger/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
