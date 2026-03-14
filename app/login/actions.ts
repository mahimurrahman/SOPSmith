"use server";

import type { LoginActionState } from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getRequestOrigin, sanitizeNextPath } from "@/lib/urls";
import { loginSchema } from "@/lib/validators";

export async function sendMagicLinkAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = formData.get("email");
  const nextPath = sanitizeNextPath(formData.get("next")?.toString());
  const parsed = loginSchema.safeParse({
    email: typeof email === "string" ? email : "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.flatten().fieldErrors.email?.[0] ?? "Enter a valid email address.",
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const origin = await getRequestOrigin();
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });

    if (error) {
      return {
        status: "error",
        message: error.message,
      };
    }

    return {
      status: "success",
      message: `Magic link sent to ${parsed.data.email}. Open it on this device to continue. If it does not appear, check spam or promotions.`,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not send your magic link right now.",
    };
  }
}
