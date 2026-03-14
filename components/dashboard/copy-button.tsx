"use client";

import { useEffect, useRef, useState } from "react";

type CopyButtonProps = {
  content: string;
};

export function CopyButton({ content }: CopyButtonProps) {
  const timeoutRef = useRef<number | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setStatus("success");
    } catch {
      setStatus("error");
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setStatus("idle");
    }, 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      aria-label="Copy SOP text to clipboard"
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg active:scale-95 ${
        status === "success"
          ? "bg-emerald-500 text-white shadow-emerald-500/25 shadow-lg"
          : status === "error"
            ? "bg-rose-500 text-white shadow-rose-500/25 shadow-lg"
            : "bg-primary text-white shadow-primary/25 hover:bg-primary/90"
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">
        {status === "success" ? "check" : status === "error" ? "error" : "content_copy"}
      </span>
      <span>
        {status === "success" ? "Copied!" : status === "error" ? "Failed" : "Copy SOP"}
      </span>
    </button>
  );
}
