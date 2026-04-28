const DEFAULT_ADMIN_EMAIL = "admin@ieltsprep.dz";
const DEFAULT_ADMIN_PASSWORD = "IeltsAdmin2026";
const DEFAULT_JWT_SECRET = "ielts-prep-demo-jwt-secret-change-me";

function getOptionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function getRequiredEnv(name: string) {
  const value = getOptionalEnv(name);

  if (!value) {
    throw new AppConfigError(
      [name],
      `متغير البيئة ${name} غير مضبوط على هذا النشر.`,
    );
  }

  return value;
}

export class AppConfigError extends Error {
  constructor(
    public readonly missingEnvVars: string[],
    message: string,
  ) {
    super(message);
    this.name = "AppConfigError";
  }
}

export function getAdminCredentials() {
  const adminEmail = getOptionalEnv("ADMIN_EMAIL");
  const adminPassword = getOptionalEnv("ADMIN_PASSWORD");
  const usingDefaultCredentials = !(adminEmail && adminPassword);
  const email = usingDefaultCredentials ? DEFAULT_ADMIN_EMAIL : adminEmail!;
  const password = usingDefaultCredentials ? DEFAULT_ADMIN_PASSWORD : adminPassword!;

  return {
    email: email.toLowerCase(),
    password,
    usingDefaultCredentials,
  };
}

export function getPublicAppStatus() {
  const missingSupabaseEnvVars = ["SUPABASE_URL", "SUPABASE_ANON_KEY"].filter(
    (key) => !getOptionalEnv(key),
  );
  const admin = getAdminCredentials();

  return {
    missingSupabaseEnvVars,
    defaultAdminEmail: DEFAULT_ADMIN_EMAIL,
    defaultAdminPassword: DEFAULT_ADMIN_PASSWORD,
    adminUsesDefaultCredentials: admin.usingDefaultCredentials,
  };
}

export function getGeminiApiKey() {
  return getRequiredEnv("GEMINI_API_KEY");
}

export function getJwtSecret() {
  return getOptionalEnv("JWT_SECRET") ?? DEFAULT_JWT_SECRET;
}

export function getSupabaseConfig() {
  const url = getOptionalEnv("SUPABASE_URL");
  const serviceRoleKey = getOptionalEnv("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = getOptionalEnv("SUPABASE_ANON_KEY");
  const key = serviceRoleKey ?? anonKey;

  const missingEnvVars = [
    ...(url ? [] : ["SUPABASE_URL"]),
    ...(key ? [] : ["SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY"]),
  ];

  if (missingEnvVars.length > 0) {
    throw new AppConfigError(
      missingEnvVars,
      "إعدادات Supabase غير مكتملة على هذا النشر. أضف SUPABASE_URL وSUPABASE_ANON_KEY على Vercel ثم أعد النشر.",
    );
  }

  return {
    url: url!,
    key: key!,
  };
}
