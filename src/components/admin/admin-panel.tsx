"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import type { AdminUserSummary } from "@/types";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "غير متوفر";
  }

  return new Date(value).toLocaleString("ar-DZ");
}

export function AdminPanel({
  initialSessionActive,
  initialPendingUsers,
  initialActiveUsers,
  adminUsesDefaultCredentials,
  defaultAdminEmail,
  defaultAdminPassword,
  setupMessage,
}: {
  initialSessionActive: boolean;
  initialPendingUsers: AdminUserSummary[];
  initialActiveUsers: AdminUserSummary[];
  adminUsesDefaultCredentials: boolean;
  defaultAdminEmail: string;
  defaultAdminPassword: string;
  setupMessage?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(initialSessionActive);
  const [pendingUsers, setPendingUsers] = useState<AdminUserSummary[]>(initialPendingUsers);
  const [activeUsers, setActiveUsers] = useState<AdminUserSummary[]>(initialActiveUsers);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  async function loadUsers() {
    setIsLoadingUsers(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/users", {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        message?: string;
        pendingUsers?: AdminUserSummary[];
        activeUsers?: AdminUserSummary[];
      };

      if (!response.ok) {
        setMessage(data.message ?? "تعذر تحميل بيانات المستخدمين.");
        setIsSessionActive(false);
        return;
      }

      setPendingUsers(data.pendingUsers ?? []);
      setActiveUsers(data.activeUsers ?? []);
      setIsSessionActive(true);
    } catch {
      setMessage("حدث خطأ أثناء تحميل بيانات الإدارة.");
    } finally {
      setIsLoadingUsers(false);
    }
  }

  async function handleLogin() {
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(data.message ?? "بيانات الدخول غير صحيحة.");
        return;
      }

      setIsSessionActive(true);
      await loadUsers();
    } catch {
      setMessage("تعذر تسجيل الدخول إلى لوحة الإدارة.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    setIsSessionActive(false);
    setPendingUsers([]);
    setActiveUsers([]);
    setEmail("");
    setPassword("");
  }

  async function handleActivate(userId: string) {
    setMessage("");

    try {
      const response = await fetch("/api/admin/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(data.message ?? "تعذر تفعيل المستخدم.");
        return;
      }

      await loadUsers();
    } catch {
      setMessage("حدث خطأ أثناء محاولة التفعيل.");
    }
  }

  if (!isSessionActive) {
    return (
      <section className="mx-auto max-w-xl panel rounded-[2rem] px-6 py-6 sm:px-8">
        <p className="text-sm font-bold text-[var(--accent-strong)]">لوحة الإدارة المخفية</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[var(--text)]">/admin</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          سجّل الدخول ببريد الإدارة وكلمة المرور الموجودة في متغيرات البيئة.
        </p>

        {adminUsesDefaultCredentials ? (
          <div className="mt-4 rounded-[1.5rem] border border-[rgba(200,154,46,0.25)] bg-[rgba(247,229,175,0.28)] px-4 py-4 text-sm leading-7 text-[var(--text)]">
            <p className="font-extrabold text-[var(--accent-strong)]">بيانات إدارة الديمو الحالية</p>
            <p className="mt-2">
              البريد: <span className="font-bold">{defaultAdminEmail}</span>
            </p>
            <p>
              كلمة المرور: <span className="font-bold">{defaultAdminPassword}</span>
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-[1.5rem] border border-[rgba(13,45,99,0.08)] bg-[rgba(237,243,255,0.35)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
            هذا النشر يستخدم بيانات إدارة من متغيرات البيئة `ADMIN_EMAIL` و`ADMIN_PASSWORD`.
          </div>
        )}

        {setupMessage ? (
          <div className="mt-4 rounded-[1.5rem] border border-[rgba(171,61,61,0.16)] bg-[rgba(171,61,61,0.08)] px-4 py-4 text-sm leading-7 text-[var(--danger)]">
            {setupMessage}
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-bold text-[var(--text)]">البريد الإلكتروني</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="h-13 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-base text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-bold text-[var(--text)]">كلمة المرور</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="h-13 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-base text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />
          </label>

          <button
            type="button"
            onClick={handleLogin}
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-[var(--surface-strong)] px-4 py-3.5 text-base font-extrabold text-white hover:bg-[#113878] disabled:opacity-70"
          >
            {isSubmitting ? "جارٍ الدخول..." : "دخول الإدارة"}
          </button>

          {message ? (
            <div className="rounded-2xl border border-[rgba(171,61,61,0.16)] bg-[rgba(171,61,61,0.08)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">
              {message}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="panel rounded-[2rem] px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[var(--accent-strong)]">Admin Dashboard</p>
            <h1 className="mt-1 text-3xl font-extrabold text-[var(--text)]">
              إدارة طلبات التفعيل
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-extrabold text-[var(--text)] hover:bg-[rgba(237,243,255,0.5)]"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>

      {message ? (
        <div className="rounded-2xl border border-[rgba(171,61,61,0.16)] bg-[rgba(171,61,61,0.08)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="panel rounded-[2rem] px-5 py-5 sm:px-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-[var(--accent-strong)]">قيد المراجعة</p>
              <h2 className="text-2xl font-extrabold text-[var(--text)]">الطلبات المعلقة</h2>
            </div>
            <div className="rounded-full bg-[rgba(247,229,175,0.48)] px-3 py-1 text-sm font-extrabold text-[var(--accent-strong)]">
              {pendingUsers.length}
            </div>
          </div>

          {isLoadingUsers ? (
            <p className="text-sm font-semibold text-[var(--muted)]">جارٍ تحميل الطلبات...</p>
          ) : pendingUsers.length === 0 ? (
            <p className="text-sm leading-7 text-[var(--muted)]">
              لا توجد طلبات معلقة حالياً.
            </p>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <article
                  key={user.id}
                  className="rounded-[1.6rem] border border-[var(--border)] bg-white/85 p-4"
                >
                  <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                    <div className="space-y-2">
                      <p className="text-sm font-extrabold text-[var(--text)]">
                        الهاتف: {user.phone_number}
                      </p>
                      <p className="text-xs font-bold text-[var(--muted)]">
                        تاريخ الطلب: {formatDate(user.created_at)}
                      </p>
                      <a
                        href={user.payment_proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-full border border-[var(--border)] px-3 py-2 text-xs font-bold text-[var(--surface-strong)] hover:bg-[rgba(237,243,255,0.4)]"
                      >
                        فتح الصورة بحجم كامل
                      </a>
                      <button
                        type="button"
                        onClick={() => handleActivate(user.id)}
                        className="block rounded-2xl bg-[var(--surface-strong)] px-4 py-3 text-sm font-extrabold text-white hover:bg-[#113878]"
                      >
                        تفعيل الحساب
                      </button>
                    </div>

                    <div className="overflow-hidden rounded-[1.4rem] border border-[var(--border)] bg-[rgba(237,243,255,0.28)]">
                      <img
                        src={user.payment_proof_url}
                        alt={`إثبات الدفع للمستخدم ${user.phone_number}`}
                        className="h-52 w-full object-cover"
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel rounded-[2rem] px-5 py-5 sm:px-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-[var(--accent-strong)]">تم التفعيل</p>
              <h2 className="text-2xl font-extrabold text-[var(--text)]">المستخدمون النشطون</h2>
            </div>
            <div className="rounded-full bg-[rgba(13,45,99,0.08)] px-3 py-1 text-sm font-extrabold text-[var(--surface-strong)]">
              {activeUsers.length}
            </div>
          </div>

          {isLoadingUsers ? (
            <p className="text-sm font-semibold text-[var(--muted)]">جارٍ تحميل المستخدمين...</p>
          ) : activeUsers.length === 0 ? (
            <p className="text-sm leading-7 text-[var(--muted)]">
              لا يوجد مستخدمون مفعّلون بعد.
            </p>
          ) : (
            <div className="space-y-3">
              {activeUsers.map((user) => (
                <article
                  key={user.id}
                  className="rounded-[1.5rem] border border-[var(--border)] bg-white/82 px-4 py-4"
                >
                  <p className="text-sm font-extrabold text-[var(--text)]">{user.phone_number}</p>
                  <p className="mt-2 text-xs font-bold leading-6 text-[var(--muted)]">
                    تاريخ التفعيل: {formatDate(user.activated_at ?? user.created_at)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
