"use client";

import { useState } from "react";
import { Users, X, Loader2, Mail, Lock, User, Phone } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function AddStaffModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t, language } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/api/staff", formData);
      if (res.data.success) {
        toast.success(language === 'en' ? "Staff member added successfully" : "تم إضافة الموظف بنجاح");
        setIsOpen(false);
        setFormData({ name: "", email: "", password: "", phone: "" });
        window.location.reload(); // Refresh to show new staff
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn btn-primary gap-2" 
        type="button"
      >
        <Users size={18} />
        {language === 'en' ? 'Add Staff Member' : 'إضافة موظف جديد'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900">
                {language === 'en' ? 'Add New Staff' : 'إضافة موظف جديد'}
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1.5 ml-1">
                  {language === 'en' ? 'Full Name' : 'الاسم الكامل'}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="text"
                    className="input pl-12"
                    placeholder={language === 'en' ? 'Ahmed Mohamed' : 'أحمد محمد'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1.5 ml-1">
                  {language === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="email"
                    className="input pl-12"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1.5 ml-1">
                  {language === 'en' ? 'Password' : 'كلمة المرور'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="password"
                    className="input pl-12"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1.5 ml-1">
                  {language === 'en' ? 'Phone Number (Optional)' : 'رقم الهاتف (اختياري)'}
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="tel"
                    className="input pl-12"
                    placeholder="05xxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  disabled={loading}
                  type="submit"
                  className="btn btn-primary w-full py-4 font-black"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    language === 'en' ? 'Create Staff Account' : 'إنشاء حساب الموظف'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
