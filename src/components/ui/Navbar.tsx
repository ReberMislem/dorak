"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronLeft, LayoutDashboard, LogIn, UserPlus } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/pricing", label: "الأسعار" },
    { href: "/#features", label: "الميزات" },
    { href: "/#contact", label: "تواصل معنا" },
  ];

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out px-4 sm:px-6",
          scrolled 
            ? "py-3 glass shadow-lg" 
            : "py-6 bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-10">
            <Logo showText={true} className="hover:scale-105 transition-transform" />
            
            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link 
                href="/dashboard" 
                className="btn btn-primary h-10 px-5 text-sm"
              >
                <LayoutDashboard size={16} />
                لوحة التحكم
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="hidden sm:flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-4 h-10"
                >
                  دخول
                </Link>
                <Link 
                  href="/register" 
                  className="btn btn-primary h-10 px-6 text-sm"
                >
                  ابدأ مجاناً
                </Link>
              </>
            )}

            {/* Mobile Toggle */}
            <button 
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all border border-border/50"
              onClick={() => setIsOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[110] lg:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-xs bg-surface z-[120] lg:hidden shadow-2xl flex flex-col border-l border-border"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <Logo />
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 px-2">التنقل</p>
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl text-base font-semibold text-foreground hover:bg-accent transition-all group"
                  >
                    {link.label}
                    <ChevronLeft size={18} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                ))}
              </div>

              <div className="p-6 border-t border-border bg-surface-2 space-y-3">
                {isAuthenticated ? (
                  <Link 
                    href="/dashboard" 
                    className="btn btn-primary w-full h-12 text-base"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard size={20} />
                    لوحة التحكم
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="btn btn-secondary w-full h-12 text-base"
                      onClick={() => setIsOpen(false)}
                    >
                      تسجيل الدخول
                    </Link>
                    <Link 
                      href="/register" 
                      className="btn btn-primary w-full h-12 text-base"
                      onClick={() => setIsOpen(false)}
                    >
                      ابدأ مجاناً الآن
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
