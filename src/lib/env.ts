function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getAdminCredentials() {
  return {
    email: getRequiredEnv("ADMIN_EMAIL").toLowerCase(),
    password: getRequiredEnv("ADMIN_PASSWORD"),
  };
}

export function getGeminiApiKey() {
  return getRequiredEnv("GEMINI_API_KEY");
}

export function getJwtSecret() {
  return getRequiredEnv("JWT_SECRET");
}

export function getSupabaseUrl() {
  return getRequiredEnv("SUPABASE_URL");
}

export function getSupabaseServerKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? getRequiredEnv("SUPABASE_ANON_KEY");
}
