import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getUserSession } from "@/lib/auth";
import { evaluateSpeakingWithGemini } from "@/lib/gemini";
import { speakingEvaluationSchema } from "@/lib/validators";

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
      question?: string;
      transcript?: string;
    };

    const payload = speakingEvaluationSchema.parse(body);
    const evaluation = await evaluateSpeakingWithGemini(
      payload.question,
      payload.transcript,
    );

    return NextResponse.json({
      evaluation,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "النص المرسل غير صالح." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "تعذر الحصول على تقييم المحادثة حالياً." },
      { status: 500 },
    );
  }
}
