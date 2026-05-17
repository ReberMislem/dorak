"use client";
// ============================================
// دورك - مساعد دورك الذكي (Premium ChatBot)
// ============================================

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, X, Send, Bot, User, 
  Sparkles, ChevronLeft, HelpCircle, 
  Clock, QrCode, CreditCard, ShieldCheck,
  Minimize2, ExternalLink, Info, MessageSquare
} from "lucide-react";

type Message = {
  id: string;
  type: "bot" | "user";
  content: string;
  timestamp: Date;
};

type FAQ = {
  question: string;
  answer: string;
  icon: React.ReactNode;
  color: string;
};

const KNOWLEDGE_BASE: FAQ[] = [
  {
    question: "ما هو نظام دورك؟",
    answer:
      "دورك هو نظام ذكي لإدارة الطوابير الرقمية مصمم خصيصًا للمحلات الخدمية في السوق العربي. يتيح لعملائك الانضمام إلى الطابور مباشرة عبر مسح رمز QR ومتابعة دورهم لحظيًا من هواتفهم دون الحاجة إلى تحميل أي تطبيق. يساعد النظام على تقليل الازدحام وتحسين تجربة العملاء وتنظيم العمل داخل المحل بطريقة احترافية وحديثة.",
    icon: <Sparkles size={14} />,
    color: "bg-blue-500"
  },

  {
    question: "كيف يعمل النظام للعملاء؟",
    answer:
      "تجربة العميل بسيطة وسريعة للغاية. يقوم العميل بمسح رمز QR الموجود في المحل، ثم تفتح صفحة الطابور مباشرة في المتصفح. بعد إدخال الاسم يحصل على رقم انتظار رقمي ويمكنه متابعة ترتيبه وعدد الأشخاص قبله والوقت المتوقع بشكل لحظي، بالإضافة إلى استلام إشعار عند اقتراب دوره.",
    icon: <QrCode size={14} />,
    color: "bg-indigo-500"
  },

  {
    question: "كيف يساعد دورك أصحاب المحلات؟",
    answer:
      "يوفر دورك لوحة تحكم احترافية تساعد أصحاب المحلات على إدارة الطوابير بسهولة كاملة، مثل استدعاء العميل التالي، تخطي الأدوار، مراقبة أوقات الانتظار، التحكم بساعات العمل، تحديد الحد اليومي للعملاء، وإدارة أوقات الاستراحة. كما يوفر النظام إحصائيات مباشرة تساعد على تحسين جودة الخدمة وتقليل خسارة العملاء بسبب الازدحام والانتظار الطويل.",
    icon: <Bot size={14} />,
    color: "bg-purple-500"
  },

  {
    question: "ما هي الأنشطة التي يدعمها النظام؟",
    answer:
      "تم تصميم دورك ليتناسب مع مختلف الأنشطة الخدمية التي تعتمد على نظام الانتظار، مثل صالونات الحلاقة، المطاعم، العيادات الطبية، صالونات التجميل، مغاسل السيارات، ومراكز الخدمات. كما يمكن تخصيصه وتطويره بسهولة ليتناسب مع أي نشاط آخر يعتمد على إدارة العملاء والطوابير.",
    icon: <Sparkles size={14} />,
    color: "bg-pink-500"
  },

  {
    question: "هل يحتاج العميل إلى تحميل تطبيق؟",
    answer:
      "لا، النظام يعمل بالكامل من خلال المتصفح. كل ما يحتاجه العميل هو مسح رمز QR ليتمكن من الدخول للطابور ومتابعة دوره مباشرة من هاتفه، مما يجعل تجربة الاستخدام أسرع وأسهل لجميع العملاء.",
    icon: <QrCode size={14} />,
    color: "bg-cyan-500"
  },

  {
    question: "هل النظام يدعم التحديثات اللحظية؟",
    answer:
      "نعم، يعتمد دورك على تقنيات التحديث اللحظي الحديثة، لذلك يتم تحديث حالة الطابور والأرقام بشكل مباشر وفوري دون الحاجة إلى إعادة تحميل الصفحة. هذا يمنح العملاء وأصحاب المحلات تجربة سلسة وحديثة تشبه التطبيقات العالمية.",
    icon: <Bot size={14} />,
    color: "bg-violet-500"
  },

  {
    question: "هل يمكن التحكم بساعات العمل والتسجيل؟",
    answer:
      "بالتأكيد، يمكن لصاحب المحل تحديد وقت فتح وإغلاق المحل، ووقت بدء واستقبال الأدوار، وإغلاق التسجيل اليومي، بالإضافة إلى إضافة أوقات استراحة وتحديد الحد الأقصى للعملاء يوميًا. كما يقوم النظام تلقائيًا بإيقاف التسجيل عند انتهاء الوقت أو اكتمال العدد.",
    icon: <Sparkles size={14} />,
    color: "bg-orange-500"
  },

  {
    question: "كيف تتم إدارة الاشتراكات؟",
    answer:
      "يعتمد دورك على نظام اشتراكات احترافي بإدارة كاملة من قبل الإدارة. يتم تفعيل الحسابات يدويًا لضمان جودة الخدمة، كما يمكن للإدارة التحكم بالباقات والتجارب المجانية والخصومات والعملات المختلفة وتحديد مدة الاشتراك وتاريخ الانتهاء.",
    icon: <CreditCard size={14} />,
    color: "bg-emerald-500"
  },

  {
    question: "هل النظام آمن؟",
    answer:
      "نعم، تم تطوير دورك مع التركيز على أعلى معايير الأمان الحديثة، بما يشمل حماية البيانات، تشفير الجلسات، منع محاولات الاختراق الشائعة، عزل بيانات المحلات عن بعضها، وإدارة الصلاحيات بشكل احترافي لضمان أمان واستقرار النظام.",
    icon: <Bot size={14} />,
    color: "bg-red-500"
  },

  {
    question: "هل يمكن استخدام النظام على الهاتف؟",
    answer:
      "نعم، تم تصميم النظام ليعمل بشكل مثالي على جميع الأجهزة والشاشات، بما في ذلك الهواتف الذكية والأجهزة اللوحية وأجهزة الكمبيوتر، مع دعم كامل للوضع الليلي وتجربة استخدام عربية احترافية وسريعة.",
    icon: <QrCode size={14} />,
    color: "bg-teal-500"
  }
];

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: "أهلاً بك في دورك! ✨ أنا مساعدك الذكي، يسعدني جداً الإجابة على استفساراتك حول المنصة.",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleAsk = (faq: FAQ) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      content: faq.question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: faq.answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-end" dir="rtl">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(10px)" }}
            className={`mb-6 w-[350px] max-w-[calc(100vw-48px)] h-[520px] max-h-[calc(100vh-140px)] bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 overflow-hidden flex flex-col transition-all duration-500 ${
              isMinimized ? "h-[80px] w-[200px]" : ""
            }`}
          >
            {/* Premium Header */}
            <div className="p-4 relative">
              <div className="absolute inset-0 gradient-primary opacity-90" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              
              <div className="relative flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                      <Bot size={22} className="text-white drop-shadow-md" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm tracking-tight">مساعد دورك</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 rounded-lg bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all active:scale-90"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide bg-gradient-to-b from-transparent to-slate-50/50">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.type === "bot" ? "justify-start" : "justify-end"}`}
                    >
                      <div className={`flex gap-2 max-w-[92%] ${msg.type === "user" ? "flex-row-reverse" : ""}`}>
                        {msg.type === "bot" && (
                          <div className="w-6 h-6 rounded-lg bg-blue-50 flex-shrink-0 flex items-center justify-center border border-blue-100 mt-0.5">
                            <Bot size={12} className="text-blue-600" />
                          </div>
                        )}
                        <div className={`p-2.5 rounded-2xl text-[12px] font-bold leading-relaxed shadow-sm transition-all hover:shadow-md ${
                          msg.type === "bot" 
                            ? "bg-white text-slate-700 rounded-tr-none border border-slate-100" 
                            : "gradient-primary text-white rounded-tl-none"
                        }`}>
                          {msg.content}
                          <p className={`text-[7px] mt-1 opacity-50 ${msg.type === "user" ? "text-left" : "text-right"}`}>
                            {msg.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                          <Bot size={12} className="text-blue-600" />
                        </div>
                        <div className="bg-white border border-slate-100 p-2.5 rounded-2xl rounded-tr-none flex gap-1 shadow-sm">
                          <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* FAQ Cards */}
                <div className="px-3 py-2.5 bg-slate-50/50 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={10} className="text-blue-500" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">أسئلة مقترحة</span>
                  </div>
                  <div className="max-h-[120px] overflow-y-auto pr-1 custom-scrollbar space-y-1.5">
                    {KNOWLEDGE_BASE.map((faq, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ x: -3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAsk(faq)}
                        className="w-full flex items-center gap-2.5 p-2 bg-white border border-slate-200/60 rounded-xl text-[10px] font-black text-slate-700 hover:border-blue-400 hover:text-blue-600 hover:shadow-md transition-all text-right"
                      >
                        <div className={`w-5 h-5 rounded-md ${faq.color} text-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          {React.isValidElement(faq.icon) && React.cloneElement(faq.icon as React.ReactElement<any>, { size: 10 })}
                        </div>
                        <span className="flex-1">{faq.question}</span>
                        <ChevronLeft size={10} className="opacity-30" />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-slate-100">
                  <div className="relative group">
                    <div className="relative flex items-center gap-2">
                      <div className="flex-1 relative">
                        <input 
                          type="text" 
                          disabled
                          placeholder="اختر سؤالاً..."
                          className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[10px] font-black text-slate-400 cursor-not-allowed transition-all"
                        />
                      </div>
                      <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-300 flex items-center justify-center flex-shrink-0 transition-all">
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.2)] border-4 border-white transition-all duration-700 overflow-hidden ${
          isOpen ? "bg-slate-900 text-white" : "gradient-primary text-white"
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} className="relative">
              <MessageCircle size={24} />
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm" 
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full animate-[shimmer_3s_infinite]" />
      </motion.button>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
