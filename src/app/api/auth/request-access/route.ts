import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { hashPassword } from "@/lib/passwords";
import { PAYMENT_PROOF_BUCKET, getSupabaseServerClient } from "@/lib/supabase";
import {
  credentialsSchema,
  normalizePhone,
  sanitizeFileName,
} from "@/lib/validators";

export const runtime = "nodejs";

const maxUploadSize = 5 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const phoneValue = formData.get("phone");
    const passwordValue = formData.get("password");
    const paymentProof = formData.get("paymentProof");

    if (
      typeof phoneValue !== "string" ||
      typeof passwordValue !== "string" ||
      !(paymentProof instanceof File)
    ) {
      return NextResponse.json(
        { message: "يرجى تعبئة رقم الهاتف وكلمة المرور ورفع صورة الإثبات." },
        { status: 400 },
      );
    }

    const credentials = credentialsSchema.parse({
      phone: normalizePhone(phoneValue),
      password: passwordValue,
    });

    if (!allowedMimeTypes.has(paymentProof.type)) {
      return NextResponse.json(
        { message: "يرجى رفع صورة بصيغة JPG أو PNG أو WEBP." },
        { status: 400 },
      );
    }

    if (paymentProof.size > maxUploadSize) {
      return NextResponse.json(
        { message: "حجم الصورة كبير جداً. الحد الأقصى هو 5MB." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServerClient();
    const { data: existingUser, error: existingUserError } = await supabase
      .from("app_users")
      .select("id, is_activated")
      .eq("phone_number", credentials.phone)
      .maybeSingle();

    if (existingUserError) {
      throw existingUserError;
    }

    if (existingUser?.is_activated) {
      return NextResponse.json(
        { message: "هذا الحساب مفعّل بالفعل. يمكنك تسجيل الدخول مباشرة." },
        { status: 409 },
      );
    }

    const fileExtension = paymentProof.name.split(".").pop() ?? "jpg";
    const filePath = `${credentials.phone}/${Date.now()}-${sanitizeFileName(
      paymentProof.name.replace(`.${fileExtension}`, ""),
    )}.${fileExtension}`;

    const fileBuffer = Buffer.from(await paymentProof.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(PAYMENT_PROOF_BUCKET)
      .upload(filePath, fileBuffer, {
        upsert: true,
        contentType: paymentProof.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(PAYMENT_PROOF_BUCKET).getPublicUrl(filePath);

    const passwordHash = await hashPassword(credentials.password);

    if (existingUser) {
      const { error: updateError } = await supabase
        .from("app_users")
        .update({
          password_hash: passwordHash,
          payment_proof_url: publicUrl,
          is_activated: false,
          activated_at: null,
        })
        .eq("id", existingUser.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      const { error: insertError } = await supabase.from("app_users").insert({
        phone_number: credentials.phone,
        password_hash: passwordHash,
        payment_proof_url: publicUrl,
        is_activated: false,
      });

      if (insertError) {
        throw insertError;
      }
    }

    return NextResponse.json({
      message: "تم إرسال طلبك، انتظر تفعيل حسابك",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "تحقق من البيانات المدخلة." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: "تعذر إرسال الطلب حالياً. تأكد من إعداد Supabase ثم حاول مجدداً.",
      },
      { status: 500 },
    );
  }
}
