import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createUserSessionToken, setUserSessionCookie } from "@/lib/auth";
import { verifyPassword } from "@/lib/passwords";
import { getSupabaseServerClient } from "@/lib/supabase";
import { credentialsSchema, normalizePhone } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      phone?: string;
      password?: string;
    };

    const credentials = credentialsSchema.parse({
      phone: normalizePhone(body.phone ?? ""),
      password: body.password ?? "",
    });

    const supabase = getSupabaseServerClient();
    const { data: user, error } = await supabase
      .from("app_users")
      .select("id, phone_number, password_hash, is_activated")
      .eq("phone_number", credentials.phone)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!user) {
      return NextResponse.json(
        { message: "لا يوجد حساب بهذا الرقم. أرسل إثبات الدفع أولاً." },
        { status: 404 },
      );
    }

    const isValidPassword = await verifyPassword(
      credentials.password,
      user.password_hash as string,
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { message: "رقم الهاتف أو كلمة المرور غير صحيحة." },
        { status: 401 },
      );
    }

    if (!user.is_activated) {
      return NextResponse.json(
        { message: "تم إرسال طلبك، انتظر تفعيل حسابك" },
        { status: 403 },
      );
    }

    const sessionToken = await createUserSessionToken(user.id as string, user.phone_number);
    await setUserSessionCookie(sessionToken);

    return NextResponse.json({
      message: "تم تسجيل الدخول بنجاح.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "تحقق من البيانات المدخلة." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "تعذر تسجيل الدخول حالياً." },
      { status: 500 },
    );
  }
}
