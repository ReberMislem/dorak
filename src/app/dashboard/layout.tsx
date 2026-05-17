"use client";
// ============================================
// دورك - هيكل لوحة التحكم (Dashboard Layout)
// ============================================

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { 
  LayoutDashboard, Users, Settings, 
  BarChart3, LogOut, Menu, X, 
  Bell, User, ChevronLeft,
  QrCode, Layers, Shield, HelpCircle, Tag
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const { t, isRTL } = useLanguage();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (!isLoading && user && user.role !== 'SUPER_ADMIN') {
        try {
          const res = await axios.get('/api/auth/me');
          const data = res.data.data;
          const status = data.accountStatus;
          const sub = data.shopMemberships?.[0]?.shop?.subscription;

          if (status === 'PENDING') router.push('/status/pending');
          else if (status === 'SUSPENDED') router.push('/status/suspended');
          else if (!sub || (sub.status !== 'ACTIVE' && sub.status !== 'TRIAL')) router.push('/status/expired');
          else if (sub.endDate && new Date(sub.endDate) < new Date()) router.push('/status/expired');
        } catch (e) {
          // Unauthorized or error
        }
      }
    };
    checkStatus();
  }, [user, isLoading, router]);

  const MENU_ITEMS = [
    { icon: LayoutDashboard, label: t('overview'), href: "/dashboard" },
    { icon: Layers, label: t('queues'), href: "/dashboard/queues" },
    { icon: BarChart3, label: t('analytics'), href: "/dashboard/analytics" },
    { icon: QrCode, label: t('qrCodes'), href: "/dashboard/qr-codes" },
    { icon: Users, label: t('staff'), href: "/dashboard/staff" },
    { icon: Settings, label: t('settings'), href: "/dashboard/settings" },
    { icon: HelpCircle, label: 'دليل الاستخدام', href: "/dashboard/help" },
  ];

  if (user?.role === 'SUPER_ADMIN') {
    MENU_ITEMS.push({ icon: Shield, label: 'إدارة المحلات', href: "/dashboard/admin/shops" });
    MENU_ITEMS.push({ icon: Tag, label: 'إدارة الباقات', href: "/dashboard/admin/plans" });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-bg))]">
        <div className="flex flex-col items-center gap-4">
          <Logo showText={false} size="lg" className="animate-bounce" />
          <p className="text-sm font-bold text-[hsl(var(--color-text-muted))] animate-pulse">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      
      {/* ---- Desktop Sidebar ---- */}
      <aside 
        className={`hidden lg:flex flex-col border-l border-border bg-surface transition-all duration-500 relative z-30 ${isSidebarOpen ? 'w-72' : 'w-24'}`}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="absolute -left-3.5 top-12 w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-surface-2 transition-all z-40 shadow-premium"
        >
          <ChevronLeft size={14} className={`text-text-muted transition-transform duration-500 ${isSidebarOpen ? '' : 'rotate-180'}`} />
        </button>

        <div className={`p-10 mb-6 flex items-center gap-4 ${!isSidebarOpen && 'justify-center'}`}>
          <Logo showText={isSidebarOpen} size={isSidebarOpen ? "md" : "sm"} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all group relative ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/25 font-bold' 
                    : 'text-text-muted hover:bg-surface-2 hover:text-primary'
                } ${!isSidebarOpen && 'justify-center'}`}
              >
                <item.icon size={20} className={`shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform duration-300'}`} />
                {isSidebarOpen && <span className="text-sm tracking-tight">{item.label}</span>}
                {isActive && isSidebarOpen && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-3 w-1.5 h-1.5 rounded-full bg-primary-foreground"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Logout */}
        <div className="p-4 mt-auto border-t border-border/60">
          <button 
            onClick={logout}
            className={`flex items-center gap-4 w-full p-3.5 rounded-2xl text-danger hover:bg-danger/5 transition-all group ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} className="shrink-0 group-hover:translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="text-sm font-black">{t('logout')}</span>}
          </button>
        </div>
      </aside>

      {/* ---- Mobile Bottom Navigation ---- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 glass border-t border-border/60 px-6 flex items-center justify-around z-[100] pb-safe shadow-[0_-8px_32px_rgba(0,0,0,0.05)]">
        {MENU_ITEMS.slice(0, 4).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1.5 transition-all ${
                isActive ? 'text-primary' : 'text-text-muted'
              }`}
            >
              <div className={cn(
                "w-12 h-10 rounded-xl flex items-center justify-center transition-all",
                isActive ? "bg-primary/10" : ""
              )}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-black tracking-tight">{item.label}</span>
            </Link>
          );
        })}
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-1.5 text-text-muted"
        >
          <div className="w-12 h-10 rounded-xl flex items-center justify-center">
            <Menu size={22} />
          </div>
          <span className="text-[10px] font-black tracking-tight">المزيد</span>
        </button>
      </nav>

      {/* ---- Mobile Menu Drawer (More Options) ---- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-background/90 backdrop-blur-md z-[110]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface z-[120] rounded-t-[3rem] p-10 border-t border-border/60 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-border/60 rounded-full mx-auto mb-10" />
              <div className="grid grid-cols-3 gap-6 mb-10">
                {MENU_ITEMS.map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all shadow-sm",
                      pathname === item.href ? 'bg-primary text-primary-foreground shadow-primary/20' : 'bg-surface-2 text-text-muted border border-border'
                    )}>
                      <item.icon size={26} />
                    </div>
                    <span className="text-xs font-black text-center text-text">{item.label}</span>
                  </Link>
                ))}
              </div>
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-4 p-5 rounded-[1.5rem] bg-danger/5 text-danger font-black text-lg border border-danger/10 shadow-sm"
              >
                <LogOut size={24} />
                {t('logout')}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ---- Main Content ---- */}
      <main className="flex-1 min-h-screen overflow-y-auto pb-24 lg:pb-0">
        {/* Top Header */}
        <header className="sticky top-0 h-20 lg:h-24 glass border-b border-border/60 px-8 lg:px-12 flex items-center justify-between z-20">
          <div className="flex items-center gap-6">
            <div className="lg:hidden">
              <Logo showText={false} size="sm" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-black text-text-muted flex items-center gap-3 uppercase tracking-widest">
                {t('dashboard')} 
                <ChevronLeft size={14} className="opacity-30" />
                <span className="text-primary font-black">
                  {MENU_ITEMS.find(m => m.href === pathname)?.label || t('overview')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/dashboard/notifications" className="relative p-2.5 rounded-xl text-text-muted hover:bg-surface-2 hover:text-primary transition-all border border-transparent hover:border-border">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-danger border-2 border-surface rounded-full"></span>
              </Link>
              <Link href="/dashboard/settings" className="p-2.5 rounded-xl text-text-muted hover:bg-surface-2 hover:text-primary transition-all border border-transparent hover:border-border">
                <Settings size={20} />
              </Link>
            </div>
            
            <div className="w-px h-8 bg-border/60 hidden sm:block"></div>
            
            <Link href="/dashboard/profile" className="flex items-center gap-4 group">
              <div className="text-left hidden sm:block text-right">
                <div className="text-sm font-black text-text group-hover:text-primary transition-colors">{user?.name}</div>
                <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-0.5">{t('ownerRole')}</div>
              </div>
              <div className="w-10 h-10 lg:w-12 h-12 rounded-[1rem] bg-surface-2 flex items-center justify-center text-text-muted border border-border group-hover:border-primary/40 transition-all overflow-hidden shadow-sm">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={22} />
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 sm:p-10 lg:p-14 max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}

