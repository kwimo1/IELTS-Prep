"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function AccessPortal() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loginMessage, setLoginMessage] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  const canSubmitAccessRequest = useMemo(() => {
    return phone.trim().length > 0 && password.trim().length >= 6 && Boolean(file);
  }, [file, password, phone]);

  async function handleLogin() {
    setLoginMessage("");
    setRequestMessage("");
    setIsLoggingIn(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          password,
        }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setLoginMessage(data.message ?? "تعذر تسجيل الدخول حالياً.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setLoginMessage("حدث خطأ في الاتصال. حاول مرة أخرى.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleAccessRequest() {
    if (!file) {
      setRequestMessage("يرجى اختيار صورة لإثبات الدفع أولاً.");
      return;
    }

    setLoginMessage("");
    setRequestMessage("");
    setIsSubmittingProof(true);

    try {
      const formData = new FormData();
      formData.append("phone", phone);
      formData.append("password", password);
      formData.append("paymentProof", file);

      const response = await fetch("/api/auth/request-access", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { message?: string };

      setRequestMessage(
        data.message ??
          (response.ok
            ? "تم إرسال طلبك، انتظر تفعيل حسابك"
            : "تعذر إرسال الطلب حالياً."),
      );

      if (response.ok) {
        setFile(null);
      }
    } catch {
      setRequestMessage("تعذر رفع إثبات الدفع حالياً. حاول مرة أخرى.");
    } finally {
      setIsSubmittingProof(false);
    }
  }

  return (
    <aside className="panel rounded-[2rem] px-5 py-6 sm:px-7 sm:py-7">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[var(--accent-strong)]">بوابة الدخول</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[var(--text)]">ابدأ من هنا</h2>
        </div>
        <div className="gold-ring rounded-2xl bg-[var(--surface-strong)] px-4 py-3 text-center text-xs font-bold text-white">
          1000 دج
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[1.4rem] border border-[rgba(13,45,99,0.08)] bg-[rgba(237,243,255,0.4)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
          تسجيل دخول الطالب يعمل فقط بعد:
          <br />
          1. رفع إثبات الدفع
          <br />
          2. تفعيل الحساب من الإدارة
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-bold text-[var(--text)]">رقم الهاتف</span>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="مثال: 0555123456"
            className="h-13 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-base text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(200,154,46,0.14)]"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-bold text-[var(--text)]">كلمة المرور</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="أدخل كلمة مرور من 6 أحرف أو أكثر"
            className="h-13 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-base text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(200,154,46,0.14)]"
          />
        </label>

        <button
          type="button"
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full rounded-2xl bg-[var(--surface-strong)] px-4 py-3.5 text-base font-extrabold text-white hover:-translate-y-0.5 hover:bg-[#113878] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoggingIn ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
        </button>

        {loginMessage ? (
          <div className="rounded-2xl border border-[rgba(171,61,61,0.16)] bg-[rgba(171,61,61,0.08)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">
            {loginMessage}
          </div>
        ) : null}
      </div>

      <div className="my-6 h-px bg-[linear-gradient(90deg,transparent,rgba(13,45,99,0.12),transparent)]" />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-extrabold text-[var(--text)]">رفع إثبات الدفع</h3>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            يجب دفع <span className="font-bold text-[var(--accent-strong)]">1000 دج</span> عبر
            BaridiMob ثم رفع صورة واضحة لإثبات الدفع للحصول على التفعيل.
          </p>
        </div>

        <label className="flex min-h-34 cursor-pointer flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-[rgba(13,45,99,0.22)] bg-[rgba(237,243,255,0.7)] px-4 py-5 text-center hover:border-[var(--accent)] hover:bg-[rgba(247,229,175,0.18)]">
          <span className="text-sm font-bold text-[var(--text)]">
            {file ? file.name : "اختر صورة إثبات الدفع"}
          </span>
          <span className="mt-2 text-xs leading-6 text-[var(--muted)]">
            الصيغ المدعومة: JPG, PNG, WEBP
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>

        <button
          type="button"
          onClick={handleAccessRequest}
          disabled={!canSubmitAccessRequest || isSubmittingProof}
          className="w-full rounded-2xl border border-[rgba(200,154,46,0.42)] bg-[rgba(247,229,175,0.45)] px-4 py-3.5 text-base font-extrabold text-[var(--surface-strong)] hover:-translate-y-0.5 hover:bg-[rgba(247,229,175,0.7)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmittingProof ? "جارٍ إرسال الطلب..." : "إرسال إثبات الدفع"}
        </button>

        {requestMessage ? (
          <div className="rounded-2xl border border-[rgba(30,122,88,0.18)] bg-[rgba(30,122,88,0.08)] px-4 py-3 text-sm font-semibold text-[var(--success)]">
            {requestMessage}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
