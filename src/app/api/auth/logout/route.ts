import { NextResponse } from "next/server";
import { clearUserSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  await clearUserSessionCookie();

  return NextResponse.json({
    message: "تم تسجيل الخروج.",
  });
}
