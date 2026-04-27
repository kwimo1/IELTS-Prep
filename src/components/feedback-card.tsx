import type { IeltsEvaluation } from "@/types";

export function FeedbackCard({
  title,
  evaluation,
  previewLabel,
  previewText,
}: {
  title: string;
  evaluation: IeltsEvaluation;
  previewLabel?: string;
  previewText?: string;
}) {
  return (
    <section className="panel rounded-[1.9rem] px-5 py-5 sm:px-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[var(--accent-strong)]">نتيجة الذكاء الاصطناعي</p>
          <h3 className="mt-1 text-2xl font-extrabold text-[var(--text)]">{title}</h3>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{evaluation.summary}</p>
        </div>
        <div className="gold-ring flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-[1.75rem] bg-[var(--surface-strong)] text-white">
          <span className="text-xs font-bold opacity-80">Overall Band</span>
          <span className="mt-1 text-3xl font-extrabold">{evaluation.overallBand}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {evaluation.criteria.map((criterion) => (
          <article
            key={criterion.label}
            className="rounded-[1.5rem] border border-[var(--border)] bg-[rgba(255,255,255,0.82)] px-4 py-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-base font-extrabold text-[var(--text)]">{criterion.label}</h4>
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-bold text-[var(--accent-strong)]">
                {criterion.score}
              </span>
            </div>
            <p className="text-sm leading-7 text-[var(--muted)]">{criterion.feedback}</p>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.5rem] border border-[rgba(30,122,88,0.16)] bg-[rgba(30,122,88,0.06)] px-4 py-4">
          <h4 className="mb-3 text-base font-extrabold text-[var(--text)]">نقاط القوة</h4>
          <div className="space-y-2">
            {evaluation.strengths.length > 0 ? (
              evaluation.strengths.map((item) => (
                <p key={item} className="text-sm leading-7 text-[var(--muted)]">
                  • {item}
                </p>
              ))
            ) : (
              <p className="text-sm leading-7 text-[var(--muted)]">
                • لا توجد ملاحظات كافية في هذه المحاولة.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-[rgba(200,154,46,0.18)] bg-[rgba(247,229,175,0.2)] px-4 py-4">
          <h4 className="mb-3 text-base font-extrabold text-[var(--text)]">خطوات التحسين</h4>
          <div className="space-y-2">
            {evaluation.improvements.length > 0 ? (
              evaluation.improvements.map((item) => (
                <p key={item} className="text-sm leading-7 text-[var(--muted)]">
                  • {item}
                </p>
              ))
            ) : (
              <p className="text-sm leading-7 text-[var(--muted)]">
                • أعد المحاولة مع إجابة أطول للحصول على توصيات أدق.
              </p>
            )}
          </div>
        </article>
      </div>

      {previewText ? (
        <div className="mt-5 rounded-[1.5rem] border border-[var(--border)] bg-[rgba(237,243,255,0.55)] px-4 py-4">
          <p className="mb-2 text-sm font-bold text-[var(--text)]">{previewLabel ?? "النص"}</p>
          <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">{previewText}</p>
        </div>
      ) : null}
    </section>
  );
}
