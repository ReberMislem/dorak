import type { Metadata, Viewport } from "next";
import { Cairo, Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { AppContent } from "@/components/providers/AppContent";
import { PWARegistry } from "@/components/providers/PWARegistry";
import { Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";

// ---- Fonts ----
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex",
  display: "swap",
});
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

// ---- Metadata ----
export const metadata: Metadata = {
  title: {
    default: "دورك - إدارة الطوابير الرقمية",
    template: "%s | دورك",
  },
  description:
    "منصة دورك لإدارة الطوابير الرقمية للمحلات الخدمية. احصل على رقمك وتابع دورك بدون انتظار!",
  keywords: ["طابور رقمي", "إدارة الانتظار", "QR", "صالون حلاقة", "عيادة", "دورك"],
  authors: [{ name: "دورك" }],
  creator: "Dorak Platform",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "دورك - إدارة الطوابير الرقمية",
    description: "احصل على رقمك الرقمي وتابع دورك بدون انتظار",
    siteName: "دورك",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4287f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1f2e" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body
        className={`${cairo.variable} ${inter.variable} ${ibmPlexArabic.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <AppContent>
              <AuthProvider>
                {children}
                <PWARegistry />
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: "hsl(var(--color-surface))",
                      color: "hsl(var(--color-text))",
                      border: "1px solid hsl(var(--color-border))",
                      borderRadius: "12px",
                      fontFamily: "Cairo, Inter, sans-serif",
                      fontSize: "14px",
                      padding: "12px 20px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    },
                    success: {
                      iconTheme: { primary: "#22c55e", secondary: "white" },
                    },
                    error: {
                      iconTheme: { primary: "#ef4444", secondary: "white" },
                    },
                  }}
                />
              </AuthProvider>
            </AppContent>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
