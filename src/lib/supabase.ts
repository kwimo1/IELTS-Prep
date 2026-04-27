import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerKey, getSupabaseUrl } from "@/lib/env";

let supabaseClient: SupabaseClient | null = null;

export const PAYMENT_PROOF_BUCKET = "payment-proofs";

export function getSupabaseServerClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(getSupabaseUrl(), getSupabaseServerKey(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseClient;
}
