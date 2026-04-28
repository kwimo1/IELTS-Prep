import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { fetchAdminUserLists } from "@/lib/admin-users";
import { getFriendlyServerError } from "@/lib/runtime-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json(
      { message: "غير مصرح لك بالوصول إلى هذه البيانات." },
      { status: 401 },
    );
  }

  try {
    const data = await fetchAdminUserLists();

    return NextResponse.json(
      data,
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: getFriendlyServerError(
          error,
          "تعذر تحميل المستخدمين من قاعدة البيانات.",
        ),
      },
      { status: 503 },
    );
  }
}
