"use client";

import { useState } from "react";

const correctAnswers = {
  multipleChoice: "study-room",
  blankOne: "Friday",
  blankTwo: "7:30",
};

export function ListeningSection() {
  const [selectedOption, setSelectedOption] = useState("");
  const [blankOne, setBlankOne] = useState("");
  const [blankTwo, setBlankTwo] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[var(--accent-strong)]">Listening Practice</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[var(--text)]">
            استمع ثم أجب عن الأسئلة
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setShowAnswers((value) => !value)}
          className="rounded-2xl border border-[rgba(200,154,46,0.38)] bg-[rgba(247,229,175,0.38)] px-4 py-3 text-sm font-extrabold text-[var(--surface-strong)] hover:bg-[rgba(247,229,175,0.7)]"
        >
          {showAnswers ? "إخفاء الإجابات" : "عرض الإجابات"}
        </button>
      </div>

      <div className="rounded-[1.8rem] border border-[var(--border)] bg-[rgba(255,255,255,0.82)] p-5">
        <p className="mb-4 text-sm leading-7 text-[var(--muted)]">
          النموذج التالي تجريبي فقط ويحاكي فكرة الأسئلة السمعية. شغّل الصوت ثم حاول
          الإجابة قبل فتح النص أو الحلول.
        </p>
        <audio
          controls
          preload="metadata"
          className="w-full rounded-2xl"
          src="https://www.w3schools.com/html/horse.mp3"
        >
          المتصفح لا يدعم تشغيل الصوت.
        </audio>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.8rem] border border-[var(--border)] bg-white/85 p-5">
          <h3 className="mb-4 text-lg font-extrabold text-[var(--text)]">
            1. لماذا اتصل الطالب بالمركز؟
          </h3>
          <div className="space-y-3">
            {[
              { value: "library-card", label: "ليطلب بطاقة مكتبة جديدة" },
              { value: "study-room", label: "ليحجز غرفة دراسة من أجل اختبار تجريبي" },
              { value: "exam-date", label: "ليغيّر موعد الامتحان الرسمي" },
            ].map((option) => {
              const isCorrect = option.value === correctAnswers.multipleChoice;
              const isSelected = selectedOption === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedOption(option.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-right text-sm font-semibold ${
                    showAnswers && isCorrect
                      ? "border-[rgba(30,122,88,0.36)] bg-[rgba(30,122,88,0.08)] text-[var(--success)]"
                      : isSelected
                        ? "border-[rgba(13,45,99,0.24)] bg-[rgba(237,243,255,0.8)] text-[var(--text)]"
                        : "border-[var(--border)] bg-white text-[var(--muted)]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </article>

        <article className="rounded-[1.8rem] border border-[var(--border)] bg-white/85 p-5">
          <h3 className="mb-4 text-lg font-extrabold text-[var(--text)]">
            2. أكمل الفراغات
          </h3>
          <div className="space-y-4 text-sm leading-7 text-[var(--muted)]">
            <label className="block space-y-2">
              <span>ينتهي التسجيل يوم</span>
              <input
                value={blankOne}
                onChange={(event) => setBlankOne(event.target.value)}
                className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[rgba(237,243,255,0.46)] px-4 outline-none focus:border-[var(--accent)]"
              />
              {showAnswers ? (
                <span className="block text-xs font-bold text-[var(--success)]">
                  الإجابة النموذجية: {correctAnswers.blankOne}
                </span>
              ) : null}
            </label>

            <label className="block space-y-2">
              <span>تبدأ الحصة التجريبية الساعة</span>
              <input
                value={blankTwo}
                onChange={(event) => setBlankTwo(event.target.value)}
                className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[rgba(237,243,255,0.46)] px-4 outline-none focus:border-[var(--accent)]"
              />
              {showAnswers ? (
                <span className="block text-xs font-bold text-[var(--success)]">
                  الإجابة النموذجية: {correctAnswers.blankTwo}
                </span>
              ) : null}
            </label>
          </div>
        </article>
      </div>

      <div className="rounded-[1.8rem] border border-[var(--border)] bg-[rgba(13,45,99,0.04)] p-5">
        <h3 className="mb-3 text-lg font-extrabold text-[var(--text)]">النص المسموع</h3>
        {showAnswers ? (
          <p className="text-sm leading-8 text-[var(--muted)]">
            Hello, I&apos;m calling to book a study room for the IELTS practice session.
            Registration closes on Friday, and the orientation begins at 7:30 in the evening.
          </p>
        ) : (
          <p className="text-sm leading-8 text-[var(--muted)]">
            النص مخفي حالياً. اضغط على &quot;عرض الإجابات&quot; حتى يظهر النص كاملاً.
          </p>
        )}
      </div>
    </section>
  );
}
