"use client";

import { useMemo, useState } from "react";
import { FeedbackCard } from "@/components/feedback-card";
import type { IeltsEvaluation } from "@/types";

const writingTasks = [
  {
    id: "task-1",
    title: "Writing Task 1",
    label: "وصف بيانات أو رسم",
    prompt:
      "The chart below shows the percentage of students using three different study methods over five years. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
  },
  {
    id: "task-2",
    title: "Writing Task 2",
    label: "مقال رأي",
    prompt:
      "Some people believe that university education should focus mainly on job skills, while others think it should develop broader knowledge. Discuss both views and give your own opinion.",
  },
] as const;

export function WritingSection() {
  const [selectedTaskId, setSelectedTaskId] = useState<(typeof writingTasks)[number]["id"]>(
    "task-1",
  );
  const [essay, setEssay] = useState("");
  const [evaluation, setEvaluation] = useState<IeltsEvaluation | null>(null);
  const [message, setMessage] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);

  const selectedTask = useMemo(
    () => writingTasks.find((task) => task.id === selectedTaskId) ?? writingTasks[0],
    [selectedTaskId],
  );

  async function handleEvaluate() {
    setMessage("");
    setIsEvaluating(true);

    try {
      const response = await fetch("/api/ai/writing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: selectedTask.prompt,
          essay,
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        evaluation?: IeltsEvaluation;
      };

      if (!response.ok || !data.evaluation) {
        setMessage(data.message ?? "تعذر إنشاء التقييم حالياً.");
        return;
      }

      setEvaluation(data.evaluation);
    } catch {
      setMessage("حدث خطأ في الاتصال أثناء إرسال الإجابة.");
    } finally {
      setIsEvaluating(false);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-bold text-[var(--accent-strong)]">Writing Practice</p>
        <h2 className="mt-1 text-2xl font-extrabold text-[var(--text)]">
          اكتب إجابتك ثم اطلب التقييم بالذكاء الاصطناعي
        </h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {writingTasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => setSelectedTaskId(task.id)}
            className={`rounded-[1.8rem] border px-5 py-5 text-right ${
              selectedTaskId === task.id
                ? "border-[rgba(200,154,46,0.42)] bg-[rgba(247,229,175,0.34)]"
                : "border-[var(--border)] bg-white/85"
            }`}
          >
            <div className="text-xs font-bold text-[var(--accent-strong)]">{task.title}</div>
            <h3 className="mt-2 text-lg font-extrabold text-[var(--text)]">{task.label}</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{task.prompt}</p>
          </button>
        ))}
      </div>

      <div className="rounded-[1.9rem] border border-[var(--border)] bg-white/90 p-5">
        <h3 className="text-lg font-extrabold text-[var(--text)]">المهمة المختارة</h3>
        <p className="mt-3 text-sm leading-8 text-[var(--muted)]">{selectedTask.prompt}</p>

        <label className="mt-5 block space-y-3">
          <span className="text-sm font-bold text-[var(--text)]">اكتب إجابتك هنا</span>
          <textarea
            value={essay}
            onChange={(event) => setEssay(event.target.value)}
            placeholder="ابدأ بكتابة إجابتك باللغة الإنجليزية كما في الاختبار الحقيقي..."
            className="min-h-56 w-full rounded-[1.5rem] border border-[var(--border)] bg-[rgba(237,243,255,0.42)] px-4 py-4 text-sm leading-7 text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(200,154,46,0.14)]"
          />
        </label>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold text-[var(--muted)]">
            عدد الأحرف الحالي: {essay.length}
          </p>
          <button
            type="button"
            onClick={handleEvaluate}
            disabled={essay.trim().length < 50 || isEvaluating}
            className="rounded-2xl bg-[var(--surface-strong)] px-5 py-3.5 text-sm font-extrabold text-white hover:-translate-y-0.5 hover:bg-[#113878] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEvaluating ? "جارٍ تحليل الإجابة..." : "تقييم إجابتي بالذكاء الاصطناعي"}
          </button>
        </div>

        {message ? (
          <div className="mt-4 rounded-2xl border border-[rgba(171,61,61,0.16)] bg-[rgba(171,61,61,0.08)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">
            {message}
          </div>
        ) : null}
      </div>

      {evaluation ? (
        <FeedbackCard
          title="تقرير تقييم الكتابة"
          evaluation={evaluation}
          previewLabel="مقتطف من إجابتك"
          previewText={essay}
        />
      ) : null}
    </section>
  );
}
