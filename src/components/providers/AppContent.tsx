"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

export function AppContent({ children }: { children: React.ReactNode }) {
  const { isRTL } = useLanguage();

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      {children}
    </div>
  );
}
