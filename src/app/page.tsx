import { redirect } from "next/navigation";
import { AccessPortal } from "@/components/home/access-portal";
import { getUserSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const heroStats = [
  "4 أقسام عملية تحاكي بنية الاختبار",
  "تفعيل يدوي بعد مراجعة إثبات الدفع",
  "مراجعة Writing وSpeaking بالعربية عبر Gemini",
];

const featureCards = [
  {
    title: "مسار واضح للطالب الجزائري",
    description:
      "واجهة عربية بالكامل مع توجيهات مباشرة للدفع عبر BaridiMob ثم انتظار التفعيل من الإدارة.",
  },
  {
    title: "محتوى جاهز للتجربة",
    description:
      "كل قسم يحتوي على نموذج عملي أولي حتى يكون المشروع جاهزاً للعرض والنشر مباشرة.",
  },
  {
    title: "تقييم فوري بالذكاء الاصطناعي",
    description:
      "في قسمي الكتابة والمحادثة يحصل الطالب على Band Score وتعليقات تفصيلية بالعربية.",
  },
];

export default async function HomePage() {
  const session = await getUserSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="relative overflow-hidden pb-16 pt-6 sm:pb-24 sm:pt-10">
      <div className="absolute inset-x-0 top-[-12rem] -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(13,45,99,0.16),_transparent_52%)]" />
      <div className="shell">
        <section className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
          <div className="space-y-6">
            <div className="panel rounded-[2rem] px-6 py-7 sm:px-8 sm:py-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(200,154,46,0.35)] bg-[rgba(247,229,175,0.35)] px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]">
                منصة عربية للتحضير لاختبار IELTS
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
                <div className="space-y-4">
                  <h1 className="text-4xl font-extrabold leading-[1.15] text-[var(--text)] sm:text-5xl">
                    IELTS Prep
                    <span className="mt-2 block text-2xl font-bold text-[var(--accent-strong)] sm:text-3xl">
                      التحضير الذكي والمركز للطلاب الجزائريين
                    </span>
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                    ادفع 1000 دج عبر <span className="font-bold text-[var(--text)]">BaridiMob</span>
                    ، ارفع إثبات الدفع، وانتظر التفعيل اليدوي من الإدارة قبل الدخول إلى بنك
                    التمارين والتقييم الذكي.
                  </p>
                </div>
                <div className="soft-grid rounded-[1.75rem] border border-[var(--border)] bg-[rgba(13,45,99,0.03)] p-5">
                  <div className="mb-4 text-sm font-bold text-[var(--accent-strong)]">
                    ماذا ستحصل عليه بعد التفعيل؟
                  </div>
                  <div className="space-y-3">
                    {heroStats.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-[rgba(13,45,99,0.08)] bg-white/80 px-4 py-3 text-sm font-semibold text-[var(--text)]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {featureCards.map((card) => (
                <article key={card.title} className="panel rounded-[1.75rem] px-5 py-5">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-sm font-extrabold text-[var(--surface-strong)]">
                    IELTS
                  </div>
                  <h2 className="mb-2 text-lg font-bold text-[var(--text)]">{card.title}</h2>
                  <p className="text-sm leading-7 text-[var(--muted)]">{card.description}</p>
                </article>
              ))}
            </div>
          </div>

          <AccessPortal />
        </section>
      </div>
    </main>
  );
}
