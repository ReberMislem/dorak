"use client";

import { motion } from "framer-motion";
import { ShieldAlert, LogOut, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

export default function SuspendedPage() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full card p-10 space-y-8"
      >
        <div className="w-24 h-24 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xl shadow-red-100/50">
          <ShieldAlert size={48} />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-black text-slate-900">تم إيقاف حسابك</h1>
          <p className="text-slate-500 font-bold leading-relaxed">
            تم تعليق حسابك مؤقتاً من قِبل الإدارة. لا تستطيع الوصول إلى لوحة التحكم في الوقت الحالي.
          </p>
          <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm font-bold">
            للاستفسار عن سبب الإيقاف أو لطلب إعادة التفعيل، يرجى التواصل مع الإدارة.
          </div>
        </div>

        <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-100 text-right">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">التواصل مع الدعم</h3>
          <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Mail size={14} />
            </div>
            support@dorak.app
          </div>
          <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Phone size={14} />
            </div>
            920000000
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 text-red-500 font-black hover:bg-red-100 transition-colors w-full"
          >
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </div>
      </motion.div>
    </div>
  );
}
