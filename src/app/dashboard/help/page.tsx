"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronDown, ChevronUp,
  Layers, Users, QrCode, BarChart3,
  Shield, Zap, Clock, CheckCircle2,
  Play, Settings, HelpCircle, Phone
} from "lucide-react";

type Section = {
  id: string;
  icon: React.ElementType;
  color: string;
  title: string;
  description: string;
  steps?: { title: string; desc: string }[];
  faqs?: { q: string; a: string }[];
};

const sections: Section[] = [
  {
    id: "create-queue",
    icon: Layers,
    color: "blue",
    title: "إنشاء وإدارة الطوابير",
    description: "تعلّم كيفية إنشاء طوابير جديدة والتحكم الكامل بها",
    steps: [
      { title: "الدخول لقسم الطوابير", desc: "من القائمة الجانبية، انقر على \"الطوابير\" للوصول إلى لوحة إدارة الطوابير الحية." },
      { title: "إنشاء طابور جديد", desc: "انقر على زر \"إنشاء طابور\" في أعلى يمين الشاشة. أدخل اسم الطابور ومتوسط وقت الخدمة والحد الأقصى للعملاء." },
      { title: "فتح الطابور", desc: "بعد الإنشاء، انقر على زر ▶ (تشغيل) بجانب الطابور لفتحه والسماح للعملاء بالانضمام." },
      { title: "إيقاف الطابور مؤقتاً", desc: "انقر على زر ⏸ (إيقاف) لإيقاف الطابور مؤقتاً. سيُمنع العملاء الجدد من الانضمام مع إبقاء العملاء الحاليين." },
      { title: "إغلاق الطابور", desc: "انقر على زر ⬛ (إغلاق) لإغلاق الطابور نهائياً لهذا اليوم." },
    ],
    faqs: [
      { q: "كم عدد الطوابير التي يمكنني إنشاؤها؟", a: "يعتمد ذلك على خطتك. الخطة المجانية تتيح طاباراً واحداً، بينما الخطط المدفوعة تتيح عدداً أكبر." },
      { q: "هل يمكنني حذف الطابور؟", a: "نعم، يمكنك حذف الطابور من خلال زر الحذف الأحمر. سيتم إلغاء جميع التذاكر النشطة تلقائياً." },
    ]
  },
  {
    id: "customer-management",
    icon: Users,
    color: "emerald",
    title: "إدارة العملاء والتذاكر",
    description: "كيفية التعامل مع عملائك ومعالجة التذاكر",
    steps: [
      { title: "استدعاء التالي", desc: "انقر على زر \"استدعاء التالي\" الأزرق الكبير لاستدعاء العميل التالي في الطابور. سيتم إشعاره على الفور." },
      { title: "بدء الخدمة", desc: "بعد الاستدعاء، انقر على ▶ بجانب التذكرة لتحويل العميل من \"مستدعى\" إلى \"جارٍ خدمته\"." },
      { title: "إتمام الخدمة", desc: "انقر على ✔ للتأكيد على اكتمال خدمة العميل. سيُحسب في الإحصائيات اليومية تلقائياً." },
      { title: "تخطي عميل", desc: "إذا لم يحضر العميل، انقر على زر ⏩ لتخطيه والانتقال للتالي." },
      { title: "إلغاء تذكرة", desc: "لإلغاء تذكرة عميل معين، انقر على زر ✕ الأحمر بجانب تذكرته." },
      { title: "إعادة استدعاء", desc: "إذا لم يسمع العميل، انقر على 🔄 لإعادة استدعائه مجدداً." },
    ],
    faqs: [
      { q: "هل يتم تحديث قائمة الانتظار تلقائياً؟", a: "نعم، الصفحة تستخدم WebSocket للتحديث الفوري دون الحاجة لإعادة تحميل الصفحة." },
      { q: "ماذا يحدث للعميل إذا تخطيته؟", a: "يتم تحويل حالة تذكرته إلى 'مُتخطّى' وتُزال من قائمة الانتظار." },
    ]
  },
  {
    id: "qr-codes",
    icon: QrCode,
    color: "violet",
    title: "رموز QR وانضمام العملاء",
    description: "اجعل انضمام العملاء سهلاً وسريعاً عبر QR",
    steps: [
      { title: "عرض رموز QR", desc: "من القائمة الجانبية، انقر على \"رموز QR\" لعرض جميع الرموز المرتبطة بطوابيرك." },
      { title: "طباعة رمز QR", desc: "انقر على زر \"طباعة\" لطباعة رمز QR الخاص بطاباركم. ضعه في مكان مرئي بالمحل." },
      { title: "كيف يستخدمه العميل", desc: "العميل يصوّر رمز QR بكاميرا هاتفه، يُدخل اسمه ورقم هاتفه، ثم ينضم للطابور في ثوانٍ." },
    ],
    faqs: [
      { q: "هل يحتاج العميل لتثبيت تطبيق؟", a: "لا، كل ما يحتاجه هو متصفح الإنترنت. لا يوجد تطبيق مطلوب." },
      { q: "هل يمكنني تغيير رمز QR؟", a: "كل طابور له رمز QR خاص به، ويمكنك إنشاء رموز إضافية من صفحة QR." },
    ]
  },
  {
    id: "analytics",
    icon: BarChart3,
    color: "amber",
    title: "قراءة الإحصائيات والتقارير",
    description: "فهم بيانات محلك واتخاذ قرارات ذكية",
    steps: [
      { title: "لوحة التحكم الرئيسية", desc: "الصفحة الرئيسية تعرض ملخصاً فورياً: إجمالي التذاكر اليوم، المنتظرين الآن، المكتملة، ومتوسط وقت الانتظار." },
      { title: "قسم الإحصائيات", desc: "من القائمة الجانبية، انقر على \"الإحصائيات\" لعرض الرسوم البيانية خلال الأسبوع الماضي وتوزيع أوقات الذروة." },
      { title: "معدل الإكمال", desc: "يُحسب تلقائياً: عدد التذاكر المكتملة ÷ إجمالي التذاكر × 100." },
    ],
    faqs: [
      { q: "هل يتم الاحتفاظ بالإحصائيات القديمة؟", a: "نعم، يتم حفظ الإحصائيات اليومية في قاعدة البيانات ويمكنك استعراض تاريخ كامل." },
    ]
  },
  {
    id: "staff",
    icon: Users,
    color: "rose",
    title: "إدارة الموظفين",
    description: "إضافة وإدارة فريق عملك بكفاءة",
    steps: [
      { title: "إضافة موظف", desc: "من قسم \"الموظفون\"، انقر \"إضافة موظف\" وأدخل اسمه وبريده الإلكتروني وكلمة المرور." },
      { title: "تحديد الصلاحيات", desc: "يمكنك تحديد دور كل موظف: صاحب محل (كامل الصلاحيات) أو موظف (صلاحيات محدودة)." },
      { title: "إلغاء نشاط موظف", desc: "يمكنك إلغاء نشاط أي موظف في أي وقت دون حذف بياناته." },
    ],
    faqs: [
      { q: "ما الفرق بين صاحب المحل والموظف؟", a: "صاحب المحل يمكنه تعديل الإعدادات وإدارة الاشتراك. الموظف يمكنه فقط إدارة الطوابير والتذاكر." },
    ]
  },
  {
    id: "admin-guide",
    icon: Shield,
    color: "indigo",
    title: "دليل الأدمن (إدارة النظام)",
    description: "للمسؤولين: إدارة المشتركين والاشتراكات",
    steps: [
      { title: "الوصول لإدارة النظام", desc: "من القائمة الجانبية، انقر على \"إدارة النظام\" (يظهر للأدمن فقط)." },
      { title: "الموافقة على حساب جديد", desc: "ابحث عن المحل الجديد ذي الحالة 'بانتظار الموافقة'، انقر على زر التحرير، ثم انقر 'تفعيل الحساب والموافقة'." },
      { title: "تفعيل اشتراك", desc: "بعد الموافقة، انقر على زر ⚡ لتغيير الباقة واختر الخطة المناسبة لتفعيل اشتراك المحل." },
      { title: "فترة تجريبية", desc: "انقر على 'إدارة' ثم في قسم 'الاشتراك' حدد عدد أيام التجربة واضغط 'تفعيل'. سيُفعّل الحساب تلقائياً." },
      { title: "تمديد الاشتراك", desc: "حدد عدد أيام التمديد في الحقل المخصص واضغط 'تمديد'. سيُضاف الوقت فوق تاريخ الانتهاء الحالي." },
      { title: "تاريخ انتهاء مخصص", desc: "اختر تاريخاً محدداً من خلال حقل 'تحديد تاريخ انتهاء' وانقر تحديد." },
      { title: "إيقاف حساب", desc: "انقر 'تعليق الحساب مؤقتاً' لمنع المستخدم من الوصول دون حذف بياناته." },
    ],
    faqs: [
      { q: "هل يتم إشعار المشترك عند تفعيل اشتراكه؟", a: "النظام يوفر الحالة مباشرة. يمكنك إضافة نظام إشعارات البريد الإلكتروني في مرحلة قادمة." },
      { q: "ماذا يحدث إذا انتهى الاشتراك؟", a: "يتم منع الوصول للوحة التحكم تلقائياً وتحويل المستخدم لصفحة 'انتهى الاشتراك'." },
    ]
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-right p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
      >
        <span className="font-black text-slate-800 text-sm">{q}</span>
        {open ? <ChevronUp size={16} className="text-blue-500 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 text-sm text-slate-600 font-bold leading-relaxed border-t border-slate-50"
          >
            <div className="pt-3">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const colorMap: Record<string, string> = {
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  indigo: "bg-indigo-500",
};
const lightMap: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  violet: "bg-violet-50 text-violet-600 border-violet-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  rose: "bg-rose-50 text-rose-600 border-rose-100",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
};

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const filtered = sections.filter(s =>
    searchQuery === "" ||
    s.title.includes(searchQuery) ||
    s.description.includes(searchQuery) ||
    s.steps?.some(step => step.title.includes(searchQuery) || step.desc.includes(searchQuery)) ||
    s.faqs?.some(faq => faq.q.includes(searchQuery) || faq.a.includes(searchQuery))
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="text-center py-10 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl -z-10" />
        <div className="w-16 h-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30">
          <HelpCircle size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">دليل الاستخدام</h1>
        <p className="text-slate-500 font-bold max-w-md mx-auto">
          كل ما تحتاج معرفته لاستخدام منصة دورك بكفاءة واحترافية
        </p>
        <div className="relative mt-6 max-w-md mx-auto">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث في الدليل..."
            className="input w-full pr-12 py-4 rounded-2xl text-sm shadow-sm"
          />
        </div>
      </div>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-2 justify-center">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => {
              setActiveSection(activeSection === s.id ? null : s.id);
              document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black border transition-all ${
              activeSection === s.id ? colorMap[s.color] + " text-white border-transparent" : lightMap[s.color]
            }`}
          >
            <s.icon size={14} />
            {s.title.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {filtered.map((section, si) => (
          <motion.div
            key={section.id}
            id={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.05 }}
            className="card p-8 space-y-6"
          >
            {/* Section header */}
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl ${colorMap[section.color]} text-white flex items-center justify-center shrink-0 shadow-lg`}>
                <section.icon size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">{section.title}</h2>
                <p className="text-slate-500 font-bold text-sm mt-1">{section.description}</p>
              </div>
            </div>

            {/* Steps */}
            {section.steps && (
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">خطوات الاستخدام</h3>
                <div className="space-y-4">
                  {section.steps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className={`w-7 h-7 rounded-full ${colorMap[section.color]} text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm`}>
                        {i + 1}
                      </div>
                      <div className="pt-0.5">
                        <div className="font-black text-slate-900 text-sm mb-1">{step.title}</div>
                        <div className="text-slate-500 font-bold text-sm leading-relaxed">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {section.faqs && section.faqs.length > 0 && (
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">أسئلة شائعة</h3>
                <div className="space-y-2">
                  {section.faqs.map((faq, i) => (
                    <AccordionItem key={i} q={faq.q} a={faq.a} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-300">
            <Search size={48} className="mx-auto mb-4" />
            <p className="font-black text-lg">لا توجد نتائج للبحث</p>
            <p className="text-sm mt-2">جرّب كلمات مختلفة</p>
          </div>
        )}
      </div>

      {/* Contact Support */}
      <div className="card p-8 bg-gradient-to-br from-blue-600 to-indigo-700 border-none text-white relative overflow-hidden">
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <h3 className="text-xl font-black mb-2">لا تجد ما تبحث عنه؟</h3>
          <p className="text-white/70 font-bold mb-6">فريق الدعم متاح لمساعدتك في أي وقت</p>
          <div className="flex flex-wrap gap-4">
            <a href="mailto:support@dorak.app" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-600 font-black text-sm hover:bg-blue-50 transition-colors shadow-lg">
              <Phone size={16} /> تواصل مع الدعم
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
