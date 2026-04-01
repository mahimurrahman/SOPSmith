import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { BackButton } from "@/components/ui/BackButton";
import { getOptionalUser } from "@/lib/auth";
import { sanitizeNextPath } from "@/lib/urls";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to SOPSmith with a secure magic link or Google.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getOptionalUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const notice = params.error
    ? {
        tone: "error" as const,
        message: params.error,
      }
    : undefined;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "radial-gradient(circle at 50% -20%, #1e293b, #0a0f18)" }}>
      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/5 rounded-full blur-[150px]"></div>
      </div>
      
      {/* Global Back Action */}
      <div className="absolute top-6 left-6 z-20">
         <BackButton className="text-slate-400 hover:bg-slate-800/50" />
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-[440px] flex flex-col items-center gap-10 z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3">
          <Link href="/" className="flex flex-col items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-3 text-primary">
              <div className="size-11 flex items-center justify-center bg-primary/10 rounded-xl border border-primary/20 shadow-inner">
                <span className="material-symbols-outlined text-3xl font-light">terminal</span>
              </div>
              <h2 className="text-2xl font-extrabold font-display tracking-tight text-slate-100">SOPSmith</h2>
            </div>
          </Link>
          <p className="text-slate-400 text-[13px] font-medium tracking-[0.05em] uppercase">Infrastructure Operations Platform</p>
        </div>

        {/* Auth Card */}
        <LoginForm nextPath={sanitizeNextPath(params.next)} notice={notice} />

        {/* Footer Links */}
        <div className="flex flex-col items-center gap-6 mt-4">
          <div className="flex items-center gap-8 text-xs font-medium">
            <Link href="/" className="text-slate-400 hover:text-primary transition-colors border-b border-transparent hover:border-primary/30 pb-0.5">Return Home</Link>
            <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
            <span className="text-slate-400 border-b border-transparent pb-0.5 cursor-not-allowed">System Status</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 opacity-60">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="material-symbols-outlined text-sm font-light">encrypted</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">SOC2 Type II Compliant Infrastructure</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
