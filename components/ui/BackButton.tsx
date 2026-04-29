"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

type BackButtonProps = {
  className?: string;
  label?: string;
};

export function BackButton({ className, label = "Back" }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors",
        className
      )}
      aria-label="Go back"
    >
      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
      <span>{label}</span>
    </button>
  );
}
