"use client";

import type { SopDetail } from "@/lib/sops/types";

type DownloadButtonsProps = {
  sop: Pick<SopDetail, "title" | "content">;
};

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function downloadAsTxt(sop: Pick<SopDetail, "title" | "content">) {
  const blob = new Blob([sop.content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(sop.title)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generatePrintHtml(sop: Pick<SopDetail, "title" | "content">) {
  const escapedTitle = sop.title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const bodyHtml = sop.content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^- \[ \] (.+)$/gm, '<label class="checklist"><input type="checkbox" disabled /> $1</label>')
    .replace(/^- \[x\] (.+)$/gim, '<label class="checklist checked"><input type="checkbox" checked disabled /> $1</label>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ordered"><span class="num">$1.</span> $2</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapedTitle}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    max-width: 700px;
    margin: 0 auto;
    padding: 48px 24px;
    color: #1e293b;
    line-height: 1.7;
    font-size: 14px;
  }
  h1 {
    font-family: 'Inter', sans-serif;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 32px;
    padding-bottom: 16px;
    border-bottom: 2px solid #f59e0b;
    color: #0f172a;
  }
  h2 {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-top: 32px;
    margin-bottom: 12px;
    color: #b45309;
  }
  h3 {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    margin-top: 20px;
    margin-bottom: 8px;
  }
  p { margin-bottom: 12px; }
  li {
    margin-left: 24px;
    margin-bottom: 6px;
    list-style: disc;
  }
  li.ordered {
    list-style: none;
    margin-left: 0;
  }
  li.ordered .num {
    font-weight: 700;
    color: #b45309;
    margin-right: 4px;
  }
  .checklist {
    display: block;
    margin-bottom: 6px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
  }
  .checklist input {
    margin-right: 8px;
    transform: scale(1.1);
  }
  .checklist.checked { text-decoration: line-through; color: #94a3b8; }
  strong { font-weight: 700; color: #0f172a; }
  @media print {
    body { padding: 0; }
  }
</style>
</head>
<body>
<h1>${escapedTitle}</h1>
<p>${bodyHtml}</p>
<script>window.onload = function() { window.print(); };<\/script>
</body>
</html>`;
}

function openPrintPage(sop: Pick<SopDetail, "title" | "content">) {
  const html = generatePrintHtml(sop);
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  window.open(url, "_blank");
}

export function DownloadButtons({ sop }: DownloadButtonsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 px-1">
        Export
      </h3>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => downloadAsTxt(sop)}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wide rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/60 hover:border-primary/40 hover:text-primary transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[16px]">description</span>
          TXT
        </button>
        <button
          type="button"
          onClick={() => openPrintPage(sop)}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wide rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/60 hover:border-primary/40 hover:text-primary transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
          PDF
        </button>
      </div>
    </div>
  );
}
