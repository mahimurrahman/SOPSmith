import { z } from "zod";

export type PublicSupabaseEnv = {
  url: string;
  anonKey: string;
};

export type GroqEnv = {
  apiKey: string;
  model: string;
};

const supabaseUrlSchema = z
  .string()
  .trim()
  .min(1, "NEXT_PUBLIC_SUPABASE_URL is required.")
  .refine(
    (val) => {
      try {
        const parsed = new URL(val);
        const isLocal = ["127.0.0.1", "localhost"].includes(parsed.hostname);
        return parsed.protocol === "https:" || (isLocal && parsed.protocol === "http:");
      } catch {
        return false;
      }
    },
    { message: "NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase project URL (https)." },
  );

const supabaseAnonKeySchema = z
  .string()
  .trim()
  .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required.")
  .refine(
    (val) => {
      const lower = val.toLowerCase();
      return !lower.startsWith("sb_secret_") && !lower.includes("service_role");
    },
    {
      message:
        "NEXT_PUBLIC_SUPABASE_ANON_KEY must be the public anon/publishable key — never a secret or service-role key.",
    },
  );

const publicSupabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: supabaseUrlSchema,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKeySchema,
});

const groqEnvSchema = z.object({
  GROQ_API_KEY: z.string().trim().min(1, "GROQ_API_KEY is required."),
  GROQ_MODEL: z.string().trim().min(1, "GROQ_MODEL is required."),
});

export function getPublicSupabaseEnv(): PublicSupabaseEnv {
  const result = publicSupabaseEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!result.success) {
    const messages = result.error.issues.map((i) => `  • ${i.message}`).join("\n");
    throw new Error(`[SOPSmith] Environment configuration error:\n${messages}`);
  }

  return {
    url: result.data.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: result.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function getGroqEnv(): GroqEnv {
  const result = groqEnvSchema.safeParse({
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GROQ_MODEL: process.env.GROQ_MODEL,
  });

  if (!result.success) {
    const messages = result.error.issues.map((i) => `  • ${i.message}`).join("\n");
    throw new Error(`[SOPSmith] Environment configuration error:\n${messages}`);
  }

  return {
    apiKey: result.data.GROQ_API_KEY,
    model: result.data.GROQ_MODEL,
  };
}
