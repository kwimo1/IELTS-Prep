import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/env";

let supabaseClient: SupabaseClient | null = null;

export const PAYMENT_PROOF_BUCKET = "payment-proofs";

export function getSupabaseServerClient() {
  if (!supabaseClient) {
    const { url, key } = getSupabaseConfig();

    supabaseClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseClient;
}
