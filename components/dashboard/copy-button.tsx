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
      className={`rounded-[1.5rem] border px-5 py-3 text-left shadow-soft ${
        status === "success"
          ? "border-emerald-500/30 bg-emerald-500/10"
          : status === "error"
            ? "border-rose-500/30 bg-rose-500/10"
            : "border-border bg-surface-muted"
      }`}
    >
      <span className="block text-sm font-semibold text-foreground">
        {status === "success"
          ? "Copied to clipboard"
          : status === "error"
            ? "Copy failed"
            : "Copy SOP"}
      </span>
      <span className="mt-1 block text-xs leading-5 text-muted">
        {status === "success"
          ? "Ready to paste anywhere you need it."
          : status === "error"
            ? "Clipboard access was blocked. Try again."
            : "Plain text with spacing preserved."}
      </span>
    </button>
  );
}
