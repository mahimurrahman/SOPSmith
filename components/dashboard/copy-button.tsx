"use client";

import { useEffect, useRef, useState } from "react";

type CopyFormat = "markdown" | "plain" | "notion";

type CopyButtonProps = {
  content: string;
};

function convertToPlainText(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^- \[[ x]\] /gim, "• ")
    .replace(/^[-*]\s+/gm, "• ")
    .replace(/^\d+\.\s+/gm, (m) => m)
    .trim();
}

function convertToNotion(markdown: string): string {
  return markdown
    .replace(/^# (.+)$/gm, "$1\n")
    .replace(/^## (.+)$/gm, "[$1]")
    .trim();
}

const FORMAT_CONFIG: Record<CopyFormat, { label: string; icon: string; transform: (c: string) => string }> = {
  markdown: {
    label: "Copy Markdown",
    icon: "content_copy",
    transform: (c) => c,
  },
  plain: {
    label: "Copy Plain Text",
    icon: "format_clear",
    transform: convertToPlainText,
  },
  notion: {
    label: "Copy for Notion",
    icon: "drag_indicator",
    transform: convertToNotion,
  },
};

export function CopyButton({ content }: CopyButtonProps) {
  const timeoutRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [successFormat, setSuccessFormat] = useState<CopyFormat>("markdown");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  async function handleCopy(format: CopyFormat) {
    setOpen(false);
    const text = FORMAT_CONFIG[format].transform(content);

    try {
      await navigator.clipboard.writeText(text);
      setSuccessFormat(format);
      setStatus("success");
    } catch {
      setStatus("error");
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setStatus("idle");
    }, 2200);
  }

  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className="relative flex items-center gap-1" ref={dropdownRef}>
      {/* Primary copy button — copies as Markdown by default */}
      <button
        type="button"
        onClick={() => handleCopy("markdown")}
        aria-live="polite"
        aria-label="Copy SOP as Markdown"
        className={`flex items-center gap-2 px-5 py-2.5 rounded-l-full font-bold text-sm transition-all shadow-lg active:scale-95 ${
          isSuccess
            ? "bg-emerald-500 text-white shadow-emerald-500/25"
            : isError
              ? "bg-rose-500 text-white shadow-rose-500/25"
              : "bg-primary text-white shadow-primary/25 hover:bg-primary/90"
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">
          {isSuccess ? "check" : isError ? "error" : "content_copy"}
        </span>
        <span>
          {isSuccess
            ? `Copied as ${FORMAT_CONFIG[successFormat].label.replace("Copy ", "")}`
            : isError
              ? "Copy failed"
              : "Copy SOP"}
        </span>
      </button>

      {/* Format picker chevron */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Choose copy format"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center justify-center px-3 py-2.5 rounded-r-full font-bold text-sm transition-all shadow-lg active:scale-95 border-l border-white/20 ${
          isSuccess
            ? "bg-emerald-500 text-white shadow-emerald-500/25"
            : isError
              ? "bg-rose-500 text-white shadow-rose-500/25"
              : "bg-primary text-white shadow-primary/25 hover:bg-primary/90"
        }`}
      >
        <span className={`material-symbols-outlined text-[16px] transition-transform duration-150 ${open ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Copy format options"
          className="absolute top-full left-0 mt-2 w-52 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] shadow-[var(--shadow-panel)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {(Object.keys(FORMAT_CONFIG) as CopyFormat[]).map((fmt) => {
            const cfg = FORMAT_CONFIG[fmt];
            return (
              <button
                key={fmt}
                role="option"
                aria-selected={fmt === "markdown"}
                type="button"
                onClick={() => handleCopy(fmt)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-[var(--surface-muted)] transition-colors text-left first:rounded-t-xl last:rounded-b-xl"
              >
                <span className="material-symbols-outlined text-[17px] text-muted-foreground">{cfg.icon}</span>
                {cfg.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
