"use client";
// ============================================
// دورك - صفحة تسجيل الدخول
// ============================================

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/components/providers/AuthProvider";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";

import { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    // If we just logged out, clear the URL and show a toast
    if (searchParams.get("logout")) {
      toast.success("تم تسجيل الخروج بنجاح");
      // Clean up URL without triggering navigation
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      
      const redirect = searchParams.get("redirect") || "/dashboard";
      // Full reload on login to ensure fresh state
      window.location.href = redirect;
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.error : "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      toast.error(message || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background overflow-hidden relative">
      {/* Premium SaaS Background Glow */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10 opacity-60" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 -z-10 opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[460px] relative"
      >
        <div className="text-center mb-10 flex flex-col items-center">
          <Logo size="lg" className="mb-8 hover:scale-105 transition-transform duration-500" showText={true} />
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">تسجيل الدخول</h1>
          <p className="text-muted-foreground font-bold text-base">مرحباً بك مجدداً في منصة دورك</p>
        </div>

        <div className="card p-8 sm:p-12 shadow-2xl border-border/50">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground/80 px-1">البريد الإلكتروني</label>
              <div className="relative group">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="input pr-12 h-14 font-semibold text-base"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-sm font-bold text-foreground/80">كلمة المرور</label>
                <Link href="#" className="text-[11px] text-primary font-bold hover:underline underline-offset-4 uppercase tracking-wider">نسيت كلمة المرور؟</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input pr-12 h-14 font-semibold tracking-widest text-base"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full h-14 text-lg font-bold shadow-glow gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  جاري التحقق...
                </>
              ) : (
                <>
                  دخول للوحة التحكم
                  <ArrowRight size={22} className="rotate-180" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-border text-center">
            <p className="text-sm text-muted-foreground font-bold">
              ليس لديك حساب؟{" "}
              <Link href="/register" className="text-primary font-extrabold hover:underline underline-offset-4 transition-all">
                أنشئ حساباً مجانياً الآن
              </Link>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 p-6 rounded-[2rem] bg-surface-2/50 border border-border flex gap-5 items-start shadow-sm group hover:border-primary/20 transition-all duration-500"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/10 group-hover:scale-110 transition-transform">
            <AlertCircle size={24} />
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground font-bold uppercase tracking-wide">
            هذه اللوحة مخصصة لأصحاب المحلات والموظفين فقط. إذا كنت عميلاً، يرجى مسح كود الـ QR الموجود في المحل لمتابعة دورك.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-6 bg-[hsl(var(--color-bg))]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
