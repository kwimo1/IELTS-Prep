import { getGeminiApiKey } from "@/lib/env";
import type { EvaluationCriterion, IeltsEvaluation } from "@/types";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
}

function clampBand(score: number) {
  return Math.max(0, Math.min(9, Math.round(score * 2) / 2));
}

function stripCodeFences(value: string) {
  return value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function sanitizeCriteria(input: unknown, labels: string[]): EvaluationCriterion[] {
  if (!Array.isArray(input)) {
    return labels.map((label) => ({
      label,
      score: 0,
      feedback: "لم يتم إرجاع تقييم صالح لهذا المعيار.",
    }));
  }

  return labels.map((fallbackLabel, index) => {
    const item = input[index] as
      | {
          label?: string;
          score?: number | string;
          feedback?: string;
        }
      | undefined;

    return {
      label:
        typeof item?.label === "string" && item.label.trim().length > 0
          ? item.label
          : fallbackLabel,
      score: clampBand(Number(item?.score ?? 0)),
      feedback:
        typeof item?.feedback === "string" && item.feedback.trim().length > 0
          ? item.feedback
          : "لم يتم إرجاع شرح كافٍ لهذا المعيار.",
    };
  });
}

function sanitizeEvaluation(input: unknown, labels: string[]): IeltsEvaluation {
  const raw = (input ?? {}) as {
    overallBand?: number | string;
    summary?: string;
    strengths?: string[];
    improvements?: string[];
    criteria?: unknown;
  };

  const strengths = Array.isArray(raw.strengths)
    ? raw.strengths.filter(
        (item): item is string => typeof item === "string" && item.trim().length > 0,
      )
    : [];

  const improvements = Array.isArray(raw.improvements)
    ? raw.improvements.filter(
        (item): item is string => typeof item === "string" && item.trim().length > 0,
      )
    : [];

  return {
    overallBand: clampBand(Number(raw.overallBand ?? 0)),
    summary:
      typeof raw.summary === "string" && raw.summary.trim().length > 0
        ? raw.summary
        : "تم إنشاء تقييم أولي، لكن الملخص كان غير مكتمل.",
    strengths,
    improvements,
    criteria: sanitizeCriteria(raw.criteria, labels),
  };
}

async function callGeminiJson<T>({
  systemInstruction,
  userPrompt,
}: {
  systemInstruction: string;
  userPrompt: string;
}) {
  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": getGeminiApiKey(),
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.35,
        responseMimeType: "application/json",
      },
    }),
  });

  const body = (await response.json()) as GeminiApiResponse;

  if (!response.ok) {
    throw new Error(body.error?.message ?? "تعذر الاتصال بـ Gemini حالياً.");
  }

  const text = body.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("لم يتم استلام رد صالح من نموذج Gemini.");
  }

  return JSON.parse(stripCodeFences(text)) as T;
}

export async function evaluateWritingWithGemini(prompt: string, essay: string) {
  const labels = [
    "تحقيق المهمة",
    "الترابط والتنظيم",
    "الثروة اللغوية",
    "القواعد والدقة",
  ];

  const systemInstruction = `
أنت ممتحن IELTS محترف. أعد التقييم باللغة العربية فقط.
أعد JSON صالحاً فقط بدون أي شرح إضافي خارج JSON.
صيغة JSON المطلوبة:
{
  "overallBand": 0,
  "summary": "ملخص عربي من 2-3 جمل",
  "strengths": ["نقطة قوة 1", "نقطة قوة 2"],
  "improvements": ["خطوة تحسين 1", "خطوة تحسين 2", "خطوة تحسين 3"],
  "criteria": [
    { "label": "تحقيق المهمة", "score": 0, "feedback": "..." },
    { "label": "الترابط والتنظيم", "score": 0, "feedback": "..." },
    { "label": "الثروة اللغوية", "score": 0, "feedback": "..." },
    { "label": "القواعد والدقة", "score": 0, "feedback": "..." }
  ]
}
استخدم درجات band بين 0 و9 ويمكن استعمال نصف درجة.
`.trim();

  const userPrompt = `
قيّم الإجابة التالية كممتحن IELTS Writing.

نص المهمة:
${prompt}

إجابة الطالب:
${essay}
`.trim();

  const result = await callGeminiJson<IeltsEvaluation>({
    systemInstruction,
    userPrompt,
  });

  return sanitizeEvaluation(result, labels);
}

export async function evaluateSpeakingWithGemini(question: string, transcript: string) {
  const labels = ["الطلاقة", "المفردات", "القواعد", "النطق"];

  const systemInstruction = `
أنت ممتحن IELTS Speaking محترف. أعطِ التقييم باللغة العربية فقط.
التقييم يجب أن يعتمد على النص المفرغ فقط، لذلك كن صريحاً عندما يكون حكمك على النطق تقريبياً اعتماداً على البنية النصية والترددات والأخطاء الظاهرة.
أعد JSON صالحاً فقط بدون أي شرح إضافي خارج JSON.
صيغة JSON المطلوبة:
{
  "overallBand": 0,
  "summary": "ملخص عربي من 2-3 جمل",
  "strengths": ["نقطة قوة 1", "نقطة قوة 2"],
  "improvements": ["خطوة تحسين 1", "خطوة تحسين 2", "خطوة تحسين 3"],
  "criteria": [
    { "label": "الطلاقة", "score": 0, "feedback": "..." },
    { "label": "المفردات", "score": 0, "feedback": "..." },
    { "label": "القواعد", "score": 0, "feedback": "..." },
    { "label": "النطق", "score": 0, "feedback": "..." }
  ]
}
استخدم درجات band بين 0 و9 ويمكن استعمال نصف درجة.
`.trim();

  const userPrompt = `
سؤال المحادثة:
${question}

النص الناتج عن كلام الطالب:
${transcript}
`.trim();

  const result = await callGeminiJson<IeltsEvaluation>({
    systemInstruction,
    userPrompt,
  });

  return sanitizeEvaluation(result, labels);
}
