"use client";

import { motion } from "framer-motion";
import { Clock, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

export default function PendingPage() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center" dir="rtl">
      <div className="max-w-md w-full card p-10 space-y-8">
        <div className="w-24 h-24 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xl shadow-amber-100/50">
          <Clock size={48} className="animate-pulse" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-slate-900">بانتظار الموافقة</h1>
          <p className="text-slate-500 font-bold leading-relaxed">
            تم استلام طلب تسجيل محلك بنجاح. حسابك حالياً قيد المراجعة من قبل الإدارة لضمان أفضل جودة خدمة.
          </p>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 text-sm font-bold">
            سيتم إشعارك عبر البريد الإلكتروني فور تفعيل حسابك.
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
          <Link href="/" className="btn btn-primary w-full py-4 font-black">
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
