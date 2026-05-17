"use client";
// ============================================
// دورك - صفحة رموز QR (QR Codes) - Premium UI
// ============================================

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, Copy, ExternalLink,
  Loader2, Printer, QrCode, Info, 
  CheckCircle2, Share2, Sparkles
} from "lucide-react";
import QRCode from "qrcode";
import axios from "axios";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QueueForQr = {
  id: string;
  name: string;
  nameAr?: string | null;
};

type QrCodeItem = {
  id: string;
  name: string;
  code: string;
  url: string;
};

export default function QrCodesPage() {
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<QrCodeItem[]>([]);

  useEffect(() => {
    const fetchQrCodes = async () => {
      try {
        const res = await axios.get<{ success: boolean; data: QueueForQr[] }>("/api/queues");
        if (res.data.success) {
          const qrs = res.data.data.map((q) => ({
            id: q.id,
            name: q.nameAr || q.name,
            code: q.id.substring(0, 8),
            url: `${window.location.origin}/q/${q.id.substring(0, 8)}`,
          }));
          setQrCodes(qrs);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchQrCodes();
  }, []);

  const downloadQR = async (url: string, name: string) => {
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, url, {
      width: 1024,
      margin: 2,
      color: { dark: "#2563eb", light: "#ffffff" },
    });
    
    const link = document.createElement("a");
    link.download = `QR-Dorak-${name}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("بدأ تحميل الرمز بنجاح");
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("تم نسخ الرابط");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-text-muted font-black italic">جاري تحميل الرموز...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 lg:pb-8 px-4 sm:px-0">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl">
              <QrCode className="w-7 h-7 text-primary" />
            </div>
            رموز الاستجابة (QR)
          </h1>
          <p className="text-text-muted mt-1 font-medium italic">اطبع الرموز وضعها في محلك لكي يستطيع العملاء الانضمام بسهولة</p>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          <Button variant="outline" className="rounded-xl h-12 border-border/60 font-black gap-2 whitespace-nowrap bg-surface hover:bg-surface-2 shadow-sm">
            <Printer size={18} />
            طباعة الكل
          </Button>
          <Button className="btn-primary rounded-xl h-12 px-6 font-black gap-2 whitespace-nowrap shadow-lg shadow-primary/20">
            <Share2 size={18} />
            مشاركة الروابط
          </Button>
        </div>
      </div>

      {/* Info Alert - Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 rounded-3xl glass border-primary/20 bg-primary/[0.03] flex flex-col sm:flex-row gap-5 items-start sm:items-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <Sparkles className="text-white w-7 h-7" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-black text-primary mb-1">كيف تعمل رموز دورك؟</h4>
          <p className="text-sm text-text-muted font-medium leading-relaxed max-w-3xl">
            كل طابور له رمز خاص. عند مسحه، يتم توجيه العميل فوراً للانضمام. ننصح بطباعة الرموز بجودة عالية ووضعها عند مدخل المحل أو بجانب مكتب الاستقبال.
          </p>
        </div>
        <Button variant="ghost" className="text-primary font-black text-xs hover:bg-primary/10 rounded-xl">دليل الطباعة</Button>
      </motion.div>

      {/* QR Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        <AnimatePresence>
          {qrCodes.map((qr, i) => (
            <motion.div
              key={qr.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-border/50 bg-surface/50 backdrop-blur-xl shadow-premium rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-all">
                <CardContent className="p-8 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                        <QrCode size={20} />
                      </div>
                      <span className="font-black text-text tracking-tight text-lg">{qr.name}</span>
                    </div>
                    <span className="badge-premium bg-success/10 text-success border border-success/10 px-3 py-1">نشط</span>
                  </div>

                  <div className="relative group/qr p-6 bg-white rounded-[2rem] shadow-inner border border-border/40 mb-8 transition-all hover:shadow-xl group-hover:border-primary/20">
                    <QrPreview url={qr.url} />
                    <div className="absolute inset-0 bg-primary/90 backdrop-blur-sm opacity-0 group-hover/qr:opacity-100 transition-all duration-300 flex flex-col items-center justify-center rounded-[2rem] gap-3">
                      <button 
                        onClick={() => downloadQR(qr.url, qr.name)}
                        className="w-14 h-14 rounded-full bg-white text-primary flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95"
                        title="تحميل بجودة عالية"
                      >
                        <Download size={28} />
                      </button>
                      <span className="text-[10px] font-black text-white tracking-widest uppercase">حفظ الصورة</span>
                    </div>
                    
                    {/* Scan Me Indicator */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-4 py-1.5 rounded-full shadow-md border border-border/50 text-[10px] font-black text-primary flex items-center gap-2 whitespace-nowrap">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      امسح الرمز للانضمام
                    </div>
                  </div>

                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/30 border border-border/40 group-hover:bg-white/50 transition-colors">
                      <code className="flex-1 text-[10px] font-mono text-text-muted overflow-hidden text-ellipsis whitespace-nowrap text-left" dir="ltr">
                        {qr.url}
                      </code>
                      <button 
                        onClick={() => copyLink(qr.url)}
                        className="p-2 rounded-xl hover:bg-white text-text-muted hover:text-primary transition-all shadow-sm active:scale-90"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={() => downloadQR(qr.url, qr.name)}
                        variant="outline"
                        className="h-11 rounded-2xl text-xs font-black gap-2 border-border/60 hover:bg-primary/5 hover:text-primary transition-all"
                      >
                        <Download size={16} />
                        تحميل PNG
                      </Button>
                      <a 
                        href={qr.url} 
                        target="_blank" 
                        className="h-11 flex items-center justify-center rounded-2xl bg-muted text-text-muted text-xs font-black gap-2 hover:bg-primary/10 hover:text-primary transition-all border border-border/40"
                      >
                        <ExternalLink size={16} />
                        فتح الرابط
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function QrPreview({ url }: { url: string }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    QRCode.toDataURL(url, {
      margin: 1,
      width: 400,
      color: { dark: "#2563eb", light: "#ffffff" },
    }).then(setSrc);
  }, [url]);

  return src ? (
    <Image src={src} alt="QR Preview" width={240} height={240} className="w-48 h-48 sm:w-56 sm:h-56" unoptimized />
  ) : (
    <div className="w-48 h-48 sm:w-56 sm:h-56 bg-muted/20 animate-pulse rounded-2xl flex items-center justify-center">
       <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
    </div>
  );
}
