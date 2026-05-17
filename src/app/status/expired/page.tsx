"use client";
import { motion } from "framer-motion";
import { CreditCard, Phone, LogOut, Globe } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

export default function ExpiredPage() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center" dir="rtl">
      <div className="max-w-md w-full card p-10 space-y-8">
        <div className="w-24 h-24 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xl shadow-red-100/50">
          <CreditCard size={48} />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-slate-900">الاشتراك غير فعال</h1>
          <p className="text-slate-500 font-bold leading-relaxed">
            عذراً، يبدو أن اشتراكك غير فعال حالياً أو انتهت فترة التجربة المجانية. يرجى التواصل مع الإدارة لتفعيل الحساب.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <a href="https://wa.me/966500000000" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all">
            <Phone size={24} />
            <span className="text-xs font-black">واتساب</span>
          </a>
          <a href="mailto:support@dorak.app" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all">
            <Globe size={24} />
            <span className="text-xs font-black">الدعم الفني</span>
          </a>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
          <Link href="/" className="btn btn-secondary w-full py-4 font-black">
            العودة للرئيسية
          </Link>
          <button 
            onClick={logout}
            className="text-slate-400 font-bold text-sm hover:text-red-500 transition-colors flex items-center justify-center gap-2 w-full"
          >
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
}
