import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { adminLoginSchema } from "@/lib/validators";
import { createAdminSessionToken, setAdminSessionCookie } from "@/lib/auth";
import { getAdminCredentials } from "@/lib/env";
import { getFriendlyServerError } from "@/lib/runtime-errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const credentials = adminLoginSchema.parse({
      email: (body.email ?? "").toLowerCase(),
      password: body.password ?? "",
    });

    const admin = getAdminCredentials();

    if (
      credentials.email !== admin.email ||
      credentials.password !== admin.password
    ) {
      return NextResponse.json(
        { message: "بيانات الإدارة غير صحيحة." },
        { status: 401 },
      );
    }

    const sessionToken = await createAdminSessionToken(admin.email);
    await setAdminSessionCookie(sessionToken);

    return NextResponse.json({
      message: "تم تسجيل الدخول إلى لوحة الإدارة.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "تحقق من بيانات الإدارة." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: getFriendlyServerError(
          error,
          "تعذر تسجيل الدخول إلى لوحة الإدارة.",
        ),
      },
      { status: 503 },
    );
  }
}
