import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getRequestOrigin, sanitizeNextPath } from "@/lib/urls";

import type { LoginActionState } from "./types";
import { getMagicLinkErrorMessage } from "./shared";

type MagicLinkRequest = {
  email: string;
  nextPath?: string;
};

export async function requestMagicLinkSignIn({
  email,
  nextPath,
}: MagicLinkRequest): Promise<LoginActionState> {
  try {
    const supabase = await createServerSupabaseClient();
    const origin = await getRequestOrigin();
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(
      sanitizeNextPath(nextPath),
    )}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error("[auth:requestMagicLinkSignIn]", {
        message: error.message,
      });

      return {
        status: "error",
        message: getMagicLinkErrorMessage(error.message),
      };
    }

    return {
      status: "success",
      message: `Magic link sent to ${email}. Open it on this device to continue. If it does not appear, check spam or promotions.`,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? getMagicLinkErrorMessage(error.message)
          : "We could not send your magic link right now.",
    };
  }
}
