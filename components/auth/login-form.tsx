"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { sendMagicLinkAction } from "@/app/login/actions";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { LoginActionState } from "@/lib/types";

const initialState: LoginActionState = {
  status: "idle",
};

function getGoogleSignInErrorMessage(message?: string) {
  const normalized = message?.toLowerCase() ?? "";

  if (normalized.includes("provider") && normalized.includes("not enabled")) {
    return "Google sign-in is not available right now. Check the Supabase Google provider settings.";
  }

  if (normalized.includes("invalid") && normalized.includes("redirect")) {
    return "Google sign-in is misconfigured. Check the Supabase and Google redirect URLs.";
  }

  return "Google sign-in could not be started right now. Please try again.";
}

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
        setGoogleError(getGoogleSignInErrorMessage(error.message));
        setIsGooglePending(false);
      }
    } catch (error) {
      setGoogleError(
        error instanceof Error
          ? getGoogleSignInErrorMessage(error.message)
          : "Google sign-in could not be started right now. Please try again.",
      );
      setIsGooglePending(false);
    }
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] w-full rounded-2xl p-0 md:p-10 md:shadow-lg">
      <div className="flex flex-col gap-8 md:p-0 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-display text-foreground mb-2 tracking-tight">Log in to SOPSmith</h1>
          <p className="text-muted text-sm leading-relaxed">Secure your workflow with magic link and Google SSO.</p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          <input type="hidden" name="next" value={nextPath} />

          <div className="flex flex-col gap-2">
            <label className="text-muted-foreground text-[11px] font-mono uppercase tracking-[0.15em] px-1">Work Email</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl group-focus-within:text-primary transition-colors duration-300">mail</span>
              <input
                required
                type="email"
                name="email"
                placeholder="e.g. ops@company.com"
                className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 text-sm"
                autoComplete="email"
                aria-required="true"
              />
            </div>
          </div>

          {activeNotice?.message ? (
            <div
              role="status"
              aria-live="polite"
              className={`w-full rounded-xl px-5 py-4 flex items-start gap-4 ${
                activeNotice.tone === "success"
                  ? "border border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]"
                  : "border border-[var(--danger)] bg-[var(--danger)]/10 text-[var(--danger)]"
              }`}
            >
              <span className={`material-symbols-outlined text-2xl font-light ${activeNotice.tone === "success" ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                {activeNotice.tone === "success" ? "verified_user" : "error"}
              </span>
              <div className="flex-1">
                <p className={`text-[13px] font-bold font-display tracking-tight ${activeNotice.tone === "success" ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                  {activeNotice.tone === "success" ? "Link sent" : "Error"}
                </p>
                <p className="text-sm leading-snug opacity-90">{activeNotice.message}</p>
              </div>
            </div>
          ) : null}

          <LoginSubmitButton />
        </form>

        <div className="flex items-center gap-4 py-1">
          <div className="h-[1px] flex-1 border-t border-[var(--border)]"></div>
          <span className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-mono">Or connect</span>
          <div className="h-[1px] flex-1 border-t border-[var(--border)]"></div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={isGooglePending}
            type="button"
            className="w-full bg-[var(--surface)] hover:bg-[var(--surface-muted)] text-foreground font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 border border-[var(--border)] text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>{isGooglePending ? "Connecting to Google..." : "Continue with Google"}</span>
          </button>

          {googleError ? (
            <div
              role="alert"
              className="border border-[var(--danger)] bg-[var(--danger)]/10 w-full rounded-xl px-5 py-4 flex items-start gap-4 text-[var(--danger)]"
            >
              <span className="material-symbols-outlined text-[var(--danger)] text-2xl font-light">error</span>
              <div className="flex-1">
                <p className="text-[13px] font-bold font-display tracking-tight">Google Connect Error</p>
                <p className="text-sm leading-snug opacity-90">{googleError}</p>
              </div>
            </div>
          ) : null}
        </div>
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
      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-md shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <span className="text-sm">{pending ? "Sending Magic Link..." : "Continue with Email"}</span>
      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
    </button>
  );
}
