"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { sendMagicLinkAction } from "@/app/login/actions";
import { Button } from "@/components/ui/Button";
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
    <div className="glass-panel w-full rounded-2xl p-0 md:p-10 md:shadow-2xl border-none md:border-solid md:border-white/10 md:bg-slate-900/40">
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-display text-white mb-2 tracking-tight">Access Control Center</h1>
          <p className="text-slate-400 text-sm leading-relaxed">Secure authentication for institutional operations.</p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          <input type="hidden" name="next" value={nextPath} />

          <div className="flex flex-col gap-2">
            <label className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.1em] px-1">Professional Email</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl group-focus-within:text-primary transition-colors duration-300">mail</span>
              <input
                required
                type="email"
                name="email"
                placeholder="e.g. ops-lead@organization.io"
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all duration-300 text-sm"
                autoComplete="email"
                aria-required="true"
              />
            </div>
          </div>

          {activeNotice?.message ? (
            <div
              role="status"
              aria-live="polite"
              className={`glass-panel w-full rounded-xl px-5 py-4 flex items-start gap-4 ${
                activeNotice.tone === "success"
                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                  : "border-rose-500/20 bg-rose-500/5 text-rose-400"
              }`}
            >
              <span className={`material-symbols-outlined text-2xl font-light ${activeNotice.tone === "success" ? "text-emerald-400" : "text-rose-400"}`}>
                {activeNotice.tone === "success" ? "verified_user" : "error"}
              </span>
              <div className="flex-1">
                <p className={`text-[13px] font-bold font-display tracking-tight ${activeNotice.tone === "success" ? "text-emerald-400" : "text-rose-400"}`}>
                  {activeNotice.tone === "success" ? "Link Transmitted" : "Authentication Error"}
                </p>
                <p className="text-slate-400 text-[12px] leading-snug">{activeNotice.message}</p>
              </div>
            </div>
          ) : null}

          <LoginSubmitButton />
        </form>

        <div className="flex items-center gap-4 py-2">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
          <span className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Federated Auth</span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={isGooglePending}
            type="button"
            className="w-full bg-white hover:bg-slate-50 text-slate-900 font-bold font-display py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 border border-slate-200 text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <img alt="" className="w-5 h-5 pointer-events-none" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAV3ppaXFF1OZDLVKxy_JBgKF0JxNT1D7ZTAKV5zXZ8sBCjgrjDCeC235MHRi5FNlhmIXO-Pjyl13ds4XsVul8w3onLAEhtZF3cUaBvh_lnLCK4w0MWnn_On61EHsSCTQhO1uUkz0LeBJ-Zq_1AXh77D2RWmOv3xa5Q9YTj8B_QgrB2rFRARXiROtUnnXqiexmgXG8cACx01cEXLIbKJKTPyIw6CdpUCqSQEqV-7mCc6ej7wwvF1iQG-aAp0_zjdlNeZPLlyUzQJFSj"/>
            <span>{isGooglePending ? "Connecting to Google..." : "Enterprise SSO with Google"}</span>
          </button>

          {googleError ? (
            <div
              role="alert"
              className="glass-panel border-rose-500/20 bg-rose-500/5 w-full rounded-xl px-5 py-4 flex items-start gap-4 text-rose-400"
            >
              <span className="material-symbols-outlined text-rose-400 text-2xl font-light">error</span>
              <div className="flex-1">
                <p className="text-rose-400 text-[13px] font-bold font-display tracking-tight">Google Connect Error</p>
                <p className="text-slate-400 text-[12px] leading-snug">{googleError}</p>
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
      className="w-full bg-primary hover:bg-primary/90 text-white font-bold font-display py-4 rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-primary/10 border border-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <span className="text-sm">{pending ? "Initiating Protocol..." : "Initiate Secure Login"}</span>
      <span className="material-symbols-outlined text-lg">bolt</span>
    </button>
  );
}
