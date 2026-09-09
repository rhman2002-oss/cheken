"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, User, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: username,
          password: password,
        });
        if (authError) {
          setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
          setLoading(false);
          return;
        }
      } else {
        // الوضع المحلي / التجريبي بدون Supabase
        // كلمة المرور الافتراضية: admin123
        const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";
        if (password !== validPassword && password !== "admin123") {
          setError("كلمة المرور غير صحيحة (الافتراضية: admin123)");
          setLoading(false);
          return;
        }
      }

      // حفظ جلسة تسجيل الدخول
      sessionStorage.setItem("restaurant_admin_auth", "true");
      router.push("/admin");
    } catch {
      setError("حدث خطأ أثناء محاولة تسجيل الدخول.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-bg-page">
      <div className="w-full max-w-md bg-surface rounded-card p-6 sm:p-8 border border-border-subtle shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-primary-light text-primary mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text-main">
            لوحة تحكم صاحب المطعم
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            تسجيل الدخول لإدارة قائمة الطعام والطلبات والإعدادات
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-badge bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-main mb-1.5">
              {isSupabaseConfigured ? "البريد الإلكتروني" : "اسم المستخدم أو البريد"}
            </label>
            <div className="relative flex items-center">
              <span className="absolute start-3 text-text-muted pointer-events-none">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  isSupabaseConfigured
                    ? "owner@restaurant.com"
                    : "admin أو بريدك الإلكتروني"
                }
                className="w-full ps-10 pe-3 py-3 rounded-input bg-bg-page border border-border-subtle text-sm text-text-main focus:ring-2 focus:ring-primary/20 outline-none dir-ltr text-right"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-main mb-1.5">
              كلمة المرور
            </label>
            <div className="relative flex items-center">
              <span className="absolute start-3 text-text-muted pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full ps-10 pe-3 py-3 rounded-input bg-bg-page border border-border-subtle text-sm text-text-main focus:ring-2 focus:ring-primary/20 outline-none dir-ltr text-right"
              />
            </div>
            {!isSupabaseConfigured && (
              <p className="text-[11px] text-text-muted mt-1">
                * في الوضع التجريبي، كلمة المرور هي: <code className="text-primary font-bold">admin123</code>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] py-3 rounded-btn bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md transition-all active:scale-98 disabled:opacity-50"
          >
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-border-subtle text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
            <span>العودة للمنيو الرئيسي</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
