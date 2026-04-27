"use client";

import { useEffect, useRef, useState } from "react";
import { FeedbackCard } from "@/components/feedback-card";
import type { IeltsEvaluation } from "@/types";

interface BrowserSpeechRecognitionEvent {
  results: ArrayLike<{
    0: {
      transcript: string;
    };
  }>;
}

interface BrowserSpeechRecognitionErrorEvent {
  error: string;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  }
}

const speakingQuestion =
  "Describe a skill you would like to learn in the future. You should say what the skill is, why you want to learn it, how you would learn it, and explain how it could help you in your life.";

export function SpeakingSection() {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const latestTranscriptRef = useRef("");
  const [transcript, setTranscript] = useState("");
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<IeltsEvaluation | null>(null);

  async function evaluateTranscript(nextTranscript: string) {
    if (!nextTranscript.trim()) {
      return;
    }

    setIsEvaluating(true);
    setMessage("");

    try {
      const response = await fetch("/api/ai/speaking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: speakingQuestion,
          transcript: nextTranscript,
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        evaluation?: IeltsEvaluation;
      };

      if (!response.ok || !data.evaluation) {
        setMessage(data.message ?? "تعذر تحليل إجابتك الشفوية حالياً.");
        return;
      }

      setEvaluation(data.evaluation);
    } catch {
      setMessage("حدث خطأ في الاتصال أثناء تحليل الإجابة.");
    } finally {
      setIsEvaluating(false);
    }
  }

  function getRecognition() {
    if (recognitionRef.current) {
      return recognitionRef.current;
    }

    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      return null;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const nextTranscript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim();

      latestTranscriptRef.current = nextTranscript;
      setTranscript(nextTranscript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setMessage(
        event.error === "not-allowed"
          ? "يرجى السماح للمتصفح باستخدام الميكروفون أولاً."
          : "حدثت مشكلة أثناء التقاط الصوت. جرّب مرة أخرى.",
      );
    };

    recognition.onend = () => {
      setIsListening(false);

      if (latestTranscriptRef.current.trim()) {
        void evaluateTranscript(latestTranscriptRef.current);
      }
    };

    recognitionRef.current = recognition;
    return recognition;
  }

  function toggleRecording() {
    setMessage("");

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = getRecognition();

    if (!recognition) {
      setMessage("المتصفح الحالي لا يدعم Web Speech API. جرّب Chrome أو Edge.");
      return;
    }

    latestTranscriptRef.current = "";
    setTranscript("");
    setEvaluation(null);
    setIsListening(true);
    recognition.start();
  }

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-bold text-[var(--accent-strong)]">Speaking Practice</p>
        <h2 className="mt-1 text-2xl font-extrabold text-[var(--text)]">
          سجل إجابتك صوتياً ثم استلم التقييم
        </h2>
      </div>

      <div className="rounded-[1.9rem] border border-[var(--border)] bg-white/90 p-5">
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold text-[var(--accent-strong)]">موضوع المحادثة</p>
              <p className="mt-3 text-sm leading-8 text-[var(--muted)]">
                تحدث بالإنجليزية لمدة دقيقة إلى دقيقتين حول السؤال التالي:
              </p>
              <div className="mt-3 rounded-[1.5rem] border border-[var(--border)] bg-[rgba(237,243,255,0.48)] px-4 py-4 text-sm leading-8 text-[var(--text)]">
                {speakingQuestion}
              </div>
            </div>

            <button
              type="button"
              onClick={toggleRecording}
              className={`inline-flex min-h-16 items-center justify-center rounded-[1.5rem] px-6 text-base font-extrabold text-white ${
                isListening ? "bg-[var(--danger)]" : "bg-[var(--surface-strong)]"
              } hover:-translate-y-0.5`}
            >
              {isListening ? "إيقاف التسجيل" : "ابدأ التسجيل"}
            </button>

            <p className="text-xs font-bold text-[var(--muted)]">
              ملاحظة: يتم استخدام Web Speech API المدمجة في المتصفح لاستخراج النص من
              الإجابة الصوتية.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border)] bg-[rgba(255,255,255,0.82)] p-4">
            <p className="mb-3 text-sm font-bold text-[var(--text)]">النص المستخرج من الصوت</p>
            <div className="min-h-40 whitespace-pre-wrap rounded-[1.2rem] bg-[rgba(237,243,255,0.42)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
              {transcript || "بعد التحدث سيظهر النص هنا تلقائياً."}
            </div>
          </div>
        </div>

        {message ? (
          <div className="mt-4 rounded-2xl border border-[rgba(171,61,61,0.16)] bg-[rgba(171,61,61,0.08)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">
            {message}
          </div>
        ) : null}

        {isEvaluating ? (
          <div className="mt-4 rounded-2xl border border-[rgba(13,45,99,0.1)] bg-[rgba(13,45,99,0.05)] px-4 py-3 text-sm font-semibold text-[var(--text)]">
            جارٍ تحليل إجابتك الشفوية وإعداد التغذية الراجعة...
          </div>
        ) : null}
      </div>

      {evaluation ? (
        <FeedbackCard
          title="تقرير تقييم المحادثة"
          evaluation={evaluation}
          previewLabel="النص الذي تم تحليله"
          previewText={transcript}
        />
      ) : null}
    </section>
  );
}
