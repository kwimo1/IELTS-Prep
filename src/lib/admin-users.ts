import type { AdminUserSummary } from "@/types";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function fetchAdminUserLists() {
  const supabase = getSupabaseServerClient();
  const [pendingResult, activeResult] = await Promise.all([
    supabase
      .from("app_users")
      .select("id, phone_number, payment_proof_url, created_at")
      .eq("is_activated", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("app_users")
      .select("id, phone_number, payment_proof_url, created_at, activated_at")
      .eq("is_activated", true)
      .order("activated_at", { ascending: false }),
  ]);

  if (pendingResult.error) {
    throw pendingResult.error;
  }

  if (activeResult.error) {
    throw activeResult.error;
  }

  return {
    pendingUsers: (pendingResult.data ?? []) as AdminUserSummary[],
    activeUsers: (activeResult.data ?? []) as AdminUserSummary[],
  };
}
