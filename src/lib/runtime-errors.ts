import { AppConfigError } from "@/lib/env";

export function getFriendlyServerError(
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof AppConfigError) {
    return error.message;
  }

  if (error instanceof Error) {
    const message = error.message;

    if (
      message.includes("app_users") ||
      message.includes("relation") ||
      message.includes("schema cache")
    ) {
      return "جدول المستخدمين غير موجود في Supabase. نفّذ ملف supabase/schema.sql داخل SQL Editor ثم أعد المحاولة.";
    }

    if (message.includes("payment-proofs") || message.includes("bucket")) {
      return "مستودع الصور payment-proofs غير موجود أو غير مضبوط. نفّذ schema.sql وتأكد من إنشاء Storage bucket.";
    }
  }

  return fallbackMessage;
}
