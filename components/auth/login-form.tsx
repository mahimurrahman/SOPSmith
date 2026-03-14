"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { sendMagicLinkAction } from "@/app/login/actions";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { LoginActionState } from "@/lib/types";

const initialState: LoginActionState = {
  status: "idle",
};

type LoginFormProps = {
  nextPath: string;
  notice?: {
    tone: "error" | "success";
    message: string;
  };
};

export function LoginForm({ nextPath, notice }: LoginFormProps) {
  const [state, formAction] = useActionState(sendMagicLinkAction, initialState);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const activeNotice =
    state.status === "idle"
      ? notice
      : {
          tone: state.status === "success" ? "success" : "error",
          message: state.message ?? "",
        };

  async function handleGoogleSignIn() {
    setGoogleError(null);
    setIsGooglePending(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        setGoogleError(error.message);
        setIsGooglePending(false);
      }
    } catch (error) {
      setGoogleError(
        error instanceof Error
          ? error.message
          : "Google sign-in could not be started. Please try again.",
      );
      setIsGooglePending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="eyebrow">Sign in</div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Check your inbox, then continue in one click.
        </h2>
        <p className="text-sm leading-6 text-muted">
          Use the same email address you want tied to your SOP library. The sign-in link
          works best when opened in the same browser you used here.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="next" value={nextPath} />

        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Email address</span>
          <p className="text-sm leading-6 text-muted">
            We will send a one-time login link. No password required.
          </p>
          <input
            required
            type="email"
            name="email"
            placeholder="you@company.com"
            className="field-input"
          />
        </label>

        {activeNotice?.message ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
              activeNotice.tone === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : "border-rose-500/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            {activeNotice.message}
          </div>
        ) : null}

        <div className="muted-panel rounded-2xl px-4 py-3 text-xs leading-6 text-muted">
          If the email takes a minute, check spam, promotions, or any email security filter.
        </div>

        <LoginSubmitButton />
      </form>

      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
        <div className="h-px flex-1 bg-white/10" />
        <span>Or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGooglePending}
          className="secondary-button w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGooglePending ? "Connecting to Google..." : "Continue with Google"}
        </button>

        {googleError ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-200">
            {googleError}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending link..." : "Send magic link"}
    </button>
  );
}
