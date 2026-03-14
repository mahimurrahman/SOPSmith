"use server";

import { requestMagicLinkSignIn, type LoginActionState } from "@/lib/auth";
import { sanitizeNextPath } from "@/lib/urls";
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
    return requestMagicLinkSignIn({
      email: parsed.data.email,
      nextPath,
    });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "We could not send your magic link right now.",
    };
  }
}
