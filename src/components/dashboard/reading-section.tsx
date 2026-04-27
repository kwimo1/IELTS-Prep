"use client";

import { useEffect, useMemo, useState } from "react";

const initialSeconds = 60 * 60;

export function ReadingSection() {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const formattedTimer = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, [remainingSeconds]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[var(--accent-strong)]">Reading Practice</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[var(--text)]">
            قطعة قراءة مع مؤقت 60 دقيقة
          </h2>
        </div>
        <div className="flex gap-3">
          <div className="gold-ring rounded-2xl bg-[var(--surface-strong)] px-4 py-3 text-center text-white">
            <div className="text-xs font-bold opacity-80">الوقت المتبقي</div>
            <div className="mt-1 text-xl font-extrabold">{formattedTimer}</div>
          </div>
          <button
            type="button"
            onClick={() => setRemainingSeconds(initialSeconds)}
            className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-bold text-[var(--text)] hover:bg-[rgba(237,243,255,0.45)]"
          >
            إعادة ضبط
          </button>
        </div>
      </div>

      <article className="rounded-[1.9rem] border border-[var(--border)] bg-white/90 p-5">
        <h3 className="mb-4 text-lg font-extrabold text-[var(--text)]">النص</h3>
        <p className="text-sm leading-8 text-[var(--muted)]">
          Many community libraries now provide digital study spaces for students
          preparing for international exams. These spaces do more than offer quiet
          desks. They often include guided workshops, mock speaking clubs, and shared
          feedback sessions. Students who use the spaces regularly usually report that
          the fixed schedule helps them build a stronger study habit. However, the
          spaces are most effective when learners arrive with a clear goal for each
          visit rather than expecting the location alone to improve their scores.
        </p>
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.8rem] border border-[var(--border)] bg-white/85 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-extrabold text-[var(--text)]">أسئلة الفهم</h3>
            <button
              type="button"
              onClick={() => setShowAnswers((value) => !value)}
              className="rounded-2xl border border-[rgba(200,154,46,0.38)] bg-[rgba(247,229,175,0.38)] px-4 py-2.5 text-xs font-extrabold text-[var(--surface-strong)]"
            >
              {showAnswers ? "إخفاء الإجابات" : "عرض الإجابات"}
            </button>
          </div>
          <div className="space-y-5 text-sm leading-7 text-[var(--muted)]">
            <div>
              <p className="font-bold text-[var(--text)]">
                1. ما الفكرة الأساسية للنص؟
              </p>
              <p>
                A) المكتبات لم تعد مفيدة للطلاب
                <br />
                B) أماكن الدراسة الرقمية مفيدة عندما تقترن بخطة واضحة
                <br />
                C) الاختبارات الدولية أصبحت أسهل من قبل
              </p>
              {showAnswers ? (
                <p className="mt-2 text-xs font-bold text-[var(--success)]">
                  الإجابة: B
                </p>
              ) : null}
            </div>

            <div>
              <p className="font-bold text-[var(--text)]">2. اختر: True / False / Not Given</p>
              <p>
                A) كل المكتبات الرقمية تقدم دروساً فردية يومية.
                <br />
                B) الانتظام في المكان يساعد على بناء عادة دراسة.
              </p>
              {showAnswers ? (
                <p className="mt-2 text-xs font-bold text-[var(--success)]">
                  A) Not Given
                  <br />
                  B) True
                </p>
              ) : null}
            </div>
          </div>
        </article>

        <article className="rounded-[1.8rem] border border-[var(--border)] bg-[rgba(237,243,255,0.46)] p-5">
          <h3 className="mb-4 text-lg font-extrabold text-[var(--text)]">نصيحة تدريب</h3>
          <p className="text-sm leading-8 text-[var(--muted)]">
            أثناء القسم الحقيقي، حاول أن تخصص 15 دقيقة للقراءة السريعة، و30 دقيقة
            للأسئلة، و15 دقيقة للمراجعة النهائية. هذا القسم هنا تجريبي لعرض شكل
            التجربة داخل التطبيق.
          </p>
        </article>
      </div>
    </section>
  );
}
