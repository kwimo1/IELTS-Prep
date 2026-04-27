"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ListeningSection } from "@/components/dashboard/listening-section";
import { ReadingSection } from "@/components/dashboard/reading-section";
import { SpeakingSection } from "@/components/dashboard/speaking-section";
import { WritingSection } from "@/components/dashboard/writing-section";
import type { DashboardSectionId } from "@/types";

const sections: Array<{
  id: DashboardSectionId;
  title: string;
  description: string;
}> = [
  {
    id: "listening",
    title: "Listening",
    description: "صوت + أسئلة اختيار من متعدد + فراغات",
  },
  {
    id: "reading",
    title: "Reading",
    description: "قطعة قراءة مع مؤقت 60 دقيقة",
  },
  {
    id: "writing",
    title: "Writing",
    description: "مهام كتابة مع تقييم Gemini بالعربية",
  },
  {
    id: "speaking",
    title: "Speaking",
    description: "تسجيل صوتي وتحويل للنص ثم تقييم فوري",
  },
];

export function UserDashboard({ phone }: { phone: string }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<DashboardSectionId>("listening");
  const [isPending, startTransition] = useTransition();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.push("/");
      router.refresh();
      setIsLoggingOut(false);
    }
  }

  return (
    <main className="pb-14 pt-6 sm:pb-20 sm:pt-10">
      <div className="shell space-y-6">
        <section className="panel rounded-[2rem] px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--accent-strong)]">الحساب مفعّل</p>
              <h1 className="mt-1 text-3xl font-extrabold text-[var(--text)] sm:text-4xl">
                لوحة الطالب
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-8 text-[var(--muted)]">
                مرحباً بك. يمكنك الآن التنقل بين أقسام الاختبار الأربعة والتدرب على
                النماذج التجريبية داخل المنصة.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl border border-[var(--border)] bg-white/75 px-4 py-3 text-sm font-bold text-[var(--text)]">
                رقمك: {phone}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-2xl border border-[rgba(13,45,99,0.14)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-extrabold text-white hover:bg-[#113878] disabled:opacity-70"
              >
                {isLoggingOut ? "جارٍ تسجيل الخروج..." : "تسجيل الخروج"}
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.34fr_0.66fr]">
          <aside className="panel rounded-[2rem] px-4 py-4 sm:px-5">
            <h2 className="mb-4 text-lg font-extrabold text-[var(--text)]">أقسام التدريب</h2>
            <div className="space-y-3">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() =>
                    startTransition(() => {
                      setActiveSection(section.id);
                    })
                  }
                  className={`w-full rounded-[1.4rem] border px-4 py-4 text-right ${
                    activeSection === section.id
                      ? "border-[rgba(200,154,46,0.42)] bg-[rgba(247,229,175,0.36)]"
                      : "border-[var(--border)] bg-white/82"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-[var(--accent-strong)]">
                      0{index + 1}
                    </span>
                    <span className="text-sm font-extrabold text-[var(--text)]">
                      {section.title}
                    </span>
                  </div>
                  <p className="text-xs leading-6 text-[var(--muted)]">{section.description}</p>
                </button>
              ))}
            </div>
          </aside>

          <section className="panel rounded-[2rem] px-4 py-5 sm:px-6">
            {isPending ? (
              <div className="mb-4 rounded-2xl border border-[rgba(13,45,99,0.08)] bg-[rgba(13,45,99,0.04)] px-4 py-3 text-sm font-semibold text-[var(--muted)]">
                جارٍ تبديل القسم...
              </div>
            ) : null}

            <div className={activeSection === "listening" ? "block" : "hidden"}>
              <ListeningSection />
            </div>
            <div className={activeSection === "reading" ? "block" : "hidden"}>
              <ReadingSection />
            </div>
            <div className={activeSection === "writing" ? "block" : "hidden"}>
              <WritingSection />
            </div>
            <div className={activeSection === "speaking" ? "block" : "hidden"}>
              <SpeakingSection />
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
