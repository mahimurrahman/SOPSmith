export type PublicSupabaseEnv = {
  url: string;
  anonKey: string;
};

export type GroqEnv = {
  apiKey: string;
  model: string;
};

const requiredEnvReaders = {
  GROQ_API_KEY: () => process.env.GROQ_API_KEY,
  GROQ_MODEL: () => process.env.GROQ_MODEL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_URL: () => process.env.NEXT_PUBLIC_SUPABASE_URL,
} as const;

type RequiredEnvName = keyof typeof requiredEnvReaders;

function readRequiredEnvValue(name: RequiredEnvName) {
  const normalizedValue = requiredEnvReaders[name]()?.trim();

  if (!normalizedValue) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return normalizedValue;
}

function validateSupabaseUrl(url: string) {
  try {
    const parsed = new URL(url);
    const isLocalHost = ["127.0.0.1", "localhost"].includes(parsed.hostname);

    if (parsed.protocol !== "https:" && !(isLocalHost && parsed.protocol === "http:")) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL must use https, or http only for local Supabase development.");
    }
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase URL.");
  }
}

function validatePublicSupabaseKey(key: string) {
  const normalized = key.toLowerCase();

  if (normalized.startsWith("sb_secret_") || normalized.includes("service_role")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY must use the public anon or publishable key, not a secret key.",
    );
  }
}

export function getPublicSupabaseEnv(): PublicSupabaseEnv {
  const anonKey = readRequiredEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const url = readRequiredEnvValue("NEXT_PUBLIC_SUPABASE_URL");

  validatePublicSupabaseKey(anonKey);
  validateSupabaseUrl(url);

  return {
    anonKey,
    url,
  };
}

export function getGroqEnv(): GroqEnv {
  return {
    apiKey: readRequiredEnvValue("GROQ_API_KEY"),
    model: readRequiredEnvValue("GROQ_MODEL"),
  };
}
