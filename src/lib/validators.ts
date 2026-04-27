import { z } from "zod";

export const credentialsSchema = z.object({
  phone: z.string().min(8, "رقم الهاتف غير صالح.").max(16, "رقم الهاتف غير صالح."),
  password: z
    .string()
    .min(6, "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل.")
    .max(72, "كلمة المرور طويلة جداً."),
});

export const adminLoginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح."),
  password: z.string().min(1, "كلمة المرور مطلوبة."),
});

export const activateUserSchema = z.object({
  userId: z.string().uuid("معرف المستخدم غير صالح."),
});

export const writingEvaluationSchema = z.object({
  prompt: z.string().min(12, "نص المهمة قصير جداً."),
  essay: z
    .string()
    .min(50, "اكتب إجابة أطول حتى تحصل على تقييم مفيد.")
    .max(6000, "الإجابة طويلة جداً لهذا النموذج."),
});

export const speakingEvaluationSchema = z.object({
  question: z.string().min(8, "سؤال المحادثة غير صالح."),
  transcript: z
    .string()
    .min(10, "لم يتم التقاط نص كافٍ من التسجيل.")
    .max(4000, "النص طويل جداً لهذا النموذج."),
});

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function sanitizeFileName(name: string) {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, "-");
  return cleaned.length > 0 ? cleaned : "proof-image";
}
