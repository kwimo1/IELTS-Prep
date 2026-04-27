import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getUserSession } from "@/lib/auth";
import { evaluateWritingWithGemini } from "@/lib/gemini";
import { writingEvaluationSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getUserSession();

  if (!session) {
    return NextResponse.json(
      { message: "يجب تسجيل الدخول أولاً للوصول إلى هذا التقييم." },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as {
      prompt?: string;
      essay?: string;
    };

    const payload = writingEvaluationSchema.parse(body);
    const evaluation = await evaluateWritingWithGemini(payload.prompt, payload.essay);

    return NextResponse.json({
      evaluation,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "البيانات المرسلة غير مكتملة." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "تعذر الحصول على تقييم الكتابة حالياً." },
      { status: 500 },
    );
  }
}
