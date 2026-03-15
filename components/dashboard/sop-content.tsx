"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type SopSection = {
  body: string;
  heading: string;
};

type SopContentProps = {
  content: string;
  title: string;
};

const KNOWN_HEADINGS = [
  "Purpose",
  "Scope",
  "Tools Needed",
  "Inputs",
  "Steps",
  "Quality Checks",
  "Checklist",
  "Notes",
] as const;

type KnownHeading = (typeof KNOWN_HEADINGS)[number];

function parseHeadingType(heading: string): KnownHeading | null {
  const normalized = heading.toLowerCase().trim();
  for (const known of KNOWN_HEADINGS) {
    if (normalized === known.toLowerCase()) return known;
  }
  return null;
}

function parseBulletItems(body: string): string[] {
  return body
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

function parseOwner(body: string): { owner: string | null; rest: string } {
  const lines = body.split("\n");
  let owner: string | null = null;
  const rest: string[] = [];

  for (const line of lines) {
    const match = line.match(/^Owner:\s*(.+)$/i);
    if (match && !owner) {
      owner = match[1].trim();
    } else {
      rest.push(line);
    }
  }

  return { owner, rest: rest.join("\n").trim() };
}

function parseSteps(body: string): Array<{ number: string; text: string }> {
  return body
    .split("\n")
    .map((line) => {
      const match = line.match(/^(\d+)\.\s*(.+)$/);
      if (match) return { number: match[1], text: match[2] };
      return null;
    })
    .filter(Boolean) as Array<{ number: string; text: string }>;
}

function parseChecklist(body: string): Array<{ text: string; checked: boolean }> {
  return body
    .split("\n")
    .map((line) => {
      const unchecked = line.match(/^-\s*\[\s*\]\s*(.+)$/);
      if (unchecked) return { text: unchecked[1], checked: false };
      const checked = line.match(/^-\s*\[x\]\s*(.+)$/i);
      if (checked) return { text: checked[1], checked: true };
      return null;
    })
    .filter(Boolean) as Array<{ text: string; checked: boolean }>;
}

function parseSopContent(content: string) {
  const lines = content.replace(/\r\n/g, "\n").trim().split("\n");
  const sections: SopSection[] = [];
  let heading = "";
  let bodyLines: string[] = [];
  let contentTitle = "";

  const flushSection = () => {
    if (!heading) return;
    sections.push({ body: bodyLines.join("\n").trim(), heading });
    bodyLines = [];
  };

  for (const line of lines) {
    if (line.startsWith("# ")) {
      contentTitle = line.slice(2).trim();
      continue;
    }
    if (line.startsWith("## ")) {
      flushSection();
      heading = line.slice(3).trim();
      continue;
    }
    bodyLines.push(line);
  }

  flushSection();
  return { contentTitle, sections };
}

// ──── Section Renderers ────

function PurposeSection({ body }: { body: string }) {
  const { owner, rest } = parseOwner(body);
  return (
    <div className="border-l-4 border-amber-400 dark:border-amber-500 bg-amber-50/50 dark:bg-amber-950/10 rounded-r-2xl p-6">
      {owner ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-3">
          <span className="material-symbols-outlined text-[12px]">person</span>
          Owner: {owner}
        </span>
      ) : null}
      <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">{rest}</p>
    </div>
  );
}

function ScopeSection({ body }: { body: string }) {
  return (
    <div className="border-l-4 border-emerald-400 dark:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-r-2xl p-6">
      <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">{body}</p>
    </div>
  );
}

function PillListSection({ body }: { body: string }) {
  const items = parseBulletItems(body);
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[13px] font-medium border border-slate-200 dark:border-slate-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function StepsSection({ body }: { body: string }) {
  const steps = parseSteps(body);
  if (steps.length === 0) return <FallbackSection body={body} />;

  return (
    <div className="relative pl-10">
      <div className="absolute left-[17px] top-2 bottom-2 w-[2px] bg-primary/20 rounded-full" />
      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.number} className="relative flex gap-4">
            <div className="absolute -left-10 top-0.5 w-[34px] h-[34px] rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold z-10">
              {step.number}
            </div>
            <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QualityChecksSection({ body }: { body: string }) {
  const items = parseBulletItems(body);
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-3">
          <span className="material-symbols-outlined text-emerald-500 text-[18px] mt-0.5 shrink-0">check_circle</span>
          <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">{item}</p>
        </div>
      ))}
    </div>
  );
}

function ChecklistSection({ body }: { body: string }) {
  const initialItems = parseChecklist(body);
  const [items, setItems] = useState(initialItems);

  function toggleItem(index: number) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item,
      ),
    );
  }

  if (items.length === 0) return <FallbackSection body={body} />;

  return (
    <div className="space-y-2.5">
      {items.map((item, index) => (
        <label
          key={`${item.text}-${index}`}
          className="flex items-center gap-3 group cursor-pointer select-none"
        >
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() => toggleItem(index)}
            className="h-4.5 w-4.5 rounded border-2 border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/30 focus:ring-offset-0 transition-colors accent-[var(--color-primary)]"
          />
          <span
            className={`text-[15px] leading-relaxed transition-all duration-200 ${
              item.checked
                ? "line-through text-slate-400 dark:text-slate-600"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            {item.text}
          </span>
        </label>
      ))}
    </div>
  );
}

function NotesSection({ body }: { body: string }) {
  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-6">
      <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed italic">{body}</p>
    </div>
  );
}

function FallbackSection({ body }: { body: string }) {
  return (
    <div className="prose-custom">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mt-4 mb-6 space-y-2 marker:text-primary" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mt-4 mb-6 space-y-2 marker:text-primary font-medium" {...props} />,
          li: ({ node, ...props }) => <li className="pl-1.5 text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed" {...props} />,
          p: ({ node, ...props }) => <p className="mb-5 text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-8 mb-4 text-slate-900 dark:text-white font-display tracking-tight" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-base font-bold mt-6 mb-3 text-slate-900 dark:text-white font-display" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
          a: ({ node, ...props }) => <a className="text-primary hover:underline font-medium hover:text-primary/80 transition-colors cursor-pointer" {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/40 bg-primary/5 pl-5 pr-4 py-3 my-6 rounded-r-xl italic text-slate-700 dark:text-slate-300" {...props} />,
          code(props: any) {
            const { children, className, node, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !className;
            return isInline ? (
              <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md text-[13px] text-primary font-mono font-medium" {...rest}>
                {children}
              </code>
            ) : (
              <code className="block w-full bg-slate-100 dark:bg-slate-900 p-5 rounded-2xl text-[13px] font-mono my-6 overflow-x-auto text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800/80 shadow-inner" {...rest}>
                {children}
              </code>
            );
          }
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}

function sectionIcon(type: KnownHeading | null): string {
  switch (type) {
    case "Purpose": return "flag";
    case "Scope": return "target";
    case "Tools Needed": return "build";
    case "Inputs": return "input";
    case "Steps": return "route";
    case "Quality Checks": return "verified";
    case "Checklist": return "checklist";
    case "Notes": return "sticky_note_2";
    default: return "article";
  }
}

function renderSection(section: SopSection) {
  const type = parseHeadingType(section.heading);

  switch (type) {
    case "Purpose":
      return <PurposeSection body={section.body} />;
    case "Scope":
      return <ScopeSection body={section.body} />;
    case "Tools Needed":
    case "Inputs":
      return <PillListSection body={section.body} />;
    case "Steps":
      return <StepsSection body={section.body} />;
    case "Quality Checks":
      return <QualityChecksSection body={section.body} />;
    case "Checklist":
      return <ChecklistSection body={section.body} />;
    case "Notes":
      return <NotesSection body={section.body} />;
    default:
      return <FallbackSection body={section.body} />;
  }
}

export function SopContent({ content, title }: SopContentProps) {
  const parsed = parseSopContent(content);

  return (
    <article className="space-y-16 bg-[var(--surface-strong)] mx-auto p-12 sm:p-16 lg:p-24 shadow-xl border border-[var(--border)] max-w-[210mm] min-h-[297mm] rounded-2xl">
      {parsed.contentTitle && parsed.contentTitle !== title ? (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-6 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-primary/30" /> Generated Title
          </h2>
          <p className="text-xl leading-relaxed text-slate-700 dark:text-slate-300 font-medium font-display">
            {parsed.contentTitle}
          </p>
        </section>
      ) : null}

      {parsed.sections.map((section) => {
        const type = parseHeadingType(section.heading);
        return (
          <section key={section.heading}>
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px] opacity-60">
                {sectionIcon(type)}
              </span>
              {section.heading}
            </h2>
            {renderSection(section)}
          </section>
        );
      })}
    </article>
  );
}
