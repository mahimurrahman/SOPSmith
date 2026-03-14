type PublicSupabaseEnv = {
  url: string;
  anonKey: string;
};

type GroqEnv = {
  apiKey: string;
  model: string;
};

function getRequiredEnvValue(
  name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY" | "GROQ_API_KEY" | "GROQ_MODEL",
  value: string | undefined,
) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return normalizedValue;
}

export function getPublicSupabaseEnv(): PublicSupabaseEnv {
  return {
    url: getRequiredEnvValue(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    anonKey: getRequiredEnvValue(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}

export function getGroqEnv(): GroqEnv {
  return {
    apiKey: getRequiredEnvValue("GROQ_API_KEY", process.env.GROQ_API_KEY),
    model: getRequiredEnvValue("GROQ_MODEL", process.env.GROQ_MODEL),
  };
}
