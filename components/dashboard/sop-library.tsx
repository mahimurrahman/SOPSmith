"use client";

import { useState } from "react";
import Link from "next/link";

import { formatDate } from "@/lib/format";
import type { SopSummary } from "@/lib/sops/types";

type SopLibraryProps = {
  sops: SopSummary[];
};

export function SopLibrary({ sops }: SopLibraryProps) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? sops.filter((sop) =>
        sop.title.toLowerCase().includes(query.toLowerCase()),
      )
    : sops;

  return (
    <>
      {/* Search Input */}
      <div className="relative mb-8">
        <span className="material-symbols-outlined text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 text-[20px] pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search SOPs by title…"
          className="w-full pl-12 pr-10 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--accent)] transition-all"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        ) : null}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-[var(--border)] rounded-2xl p-12 text-center">
          <div className="mx-auto max-w-md">
            <span className="material-symbols-outlined text-muted text-4xl mb-4 block">
              search_off
            </span>
            <h3 className="text-lg font-bold font-display mb-2">
              No results for &ldquo;{query}&rdquo;
            </h3>
            <p className="text-sm text-muted">
              Try a different search term or{" "}
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-primary font-medium hover:underline"
              >
                clear the filter
              </button>
              .
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((sop) => (
            <Link
              key={sop.id}
              href={`/dashboard/${sop.id}`}
              className="group bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl hover:border-primary/40 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col h-full"
            >
              <h3 className="text-lg font-bold group-hover:text-primary transition-colors leading-tight font-display line-clamp-2 mb-2">
                {sop.title}
              </h3>
              <p className="text-muted text-[13px] leading-relaxed line-clamp-2 flex-1">
                {sop.preview}
              </p>
              <div className="mt-5 pt-4 flex items-center justify-between border-t border-[var(--border)]">
                <span className="text-muted-foreground text-[11px] font-mono uppercase tracking-wider">
                  {formatDate(sop.created_at)}
                </span>
                <span className="text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Open
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
