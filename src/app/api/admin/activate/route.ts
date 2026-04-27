import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAdminSession } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase";
import { activateUserSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json(
      { message: "غير مصرح لك بتنفيذ هذا الإجراء." },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as {
      userId?: string;
    };

    const { userId } = activateUserSchema.parse(body);
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("app_users")
      .update({
        is_activated: true,
        activated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("id")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { message: "المستخدم المطلوب غير موجود." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "تم تفعيل الحساب بنجاح.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "طلب التفعيل غير صالح." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "تعذر تفعيل الحساب حالياً." },
      { status: 500 },
    );
  }
}
