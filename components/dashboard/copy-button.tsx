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
      className="rounded-full border border-white/10 bg-white/4 px-5 py-3 text-sm font-semibold text-foreground"
    >
      {status === "success"
        ? "Copied!"
        : status === "error"
          ? "Copy failed"
          : "Copy SOP"}
    </button>
  );
}
