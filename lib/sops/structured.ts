import type { Json } from "@/lib/database.types";

export type StructuredSop = {
  title: string;
  purpose: string;
  scope: string[];
  tools: string[];
  inputs: string[];
  steps: string[];
  quality_checks: string[];
  checklist: string[];
  notes: string[];
};

type StructuredSopKey = keyof StructuredSop;

const DEFAULT_SOP: StructuredSop = {
  title: "",
  purpose: "",
  scope: [],
  tools: [],
  inputs: [],
  steps: [],
  quality_checks: [],
  checklist: [],
  notes: [],
};

const SECTION_MAP: Array<{ heading: string; key: Exclude<StructuredSopKey, "title"> }> = [
  { heading: "Purpose", key: "purpose" },
  { heading: "Scope", key: "scope" },
  { heading: "Tools Needed", key: "tools" },
  { heading: "Inputs", key: "inputs" },
  { heading: "Steps", key: "steps" },
  { heading: "Quality Checks", key: "quality_checks" },
  { heading: "Checklist", key: "checklist" },
  { heading: "Notes", key: "notes" },
];

function cleanLine(value: string) {
  return value.replace(/\r/g, "").trim();
}

function parseList(body: string) {
  return body
    .split("\n")
    .map((line) => cleanLine(line.replace(/^[-*]\s+/, "")))
    .filter(Boolean);
}

function parseSteps(body: string) {
  return body
    .split("\n")
    .map((line) => cleanLine(line.replace(/^\d+\.\s+/, "")))
    .filter(Boolean);
}

function parseChecklist(body: string) {
  return body
    .split("\n")
    .map((line) => cleanLine(line.replace(/^-\s+\[[ xX]\]\s+/, "")))
    .filter(Boolean);
}

function parsePurpose(body: string) {
  return body
    .split("\n")
    .map((line) => cleanLine(line))
    .filter(Boolean)
    .join("\n");
}

function getSectionContent(content: string, heading: string) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);

  if (start === -1) {
    return "";
  }

  const body: string[] = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.startsWith("## ")) {
      break;
    }
    body.push(line);
  }

  return body.join("\n").trim();
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

export function isStructuredSop(value: unknown): value is StructuredSop {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<StructuredSop>;
  return (
    typeof candidate.title === "string" &&
    typeof candidate.purpose === "string" &&
    Array.isArray(candidate.scope) &&
    Array.isArray(candidate.tools) &&
    Array.isArray(candidate.inputs) &&
    Array.isArray(candidate.steps) &&
    Array.isArray(candidate.quality_checks) &&
    Array.isArray(candidate.checklist) &&
    Array.isArray(candidate.notes)
  );
}

export function normalizeStructuredSop(value: Partial<StructuredSop> & { title?: string }): StructuredSop {
  return {
    title: value.title?.trim() ?? "",
    purpose: value.purpose?.trim() ?? "",
    scope: normalizeStringArray(value.scope),
    tools: normalizeStringArray(value.tools),
    inputs: normalizeStringArray(value.inputs),
    steps: normalizeStringArray(value.steps),
    quality_checks: normalizeStringArray(value.quality_checks),
    checklist: normalizeStringArray(value.checklist),
    notes: normalizeStringArray(value.notes),
  };
}

export function parseMarkdownToSopJSON(content: string): StructuredSop {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  const titleMatch = normalized.match(/^#\s+(.+)$/m);
  const title = titleMatch?.[1]?.trim() ?? "";

  const parsed: StructuredSop = {
    ...DEFAULT_SOP,
    title,
  };

  for (const section of SECTION_MAP) {
    const body = getSectionContent(normalized, section.heading);

    switch (section.key) {
      case "purpose":
        parsed.purpose = parsePurpose(body);
        break;
      case "scope":
      case "tools":
      case "inputs":
      case "quality_checks":
      case "notes":
        parsed[section.key] = parseList(body);
        break;
      case "steps":
        parsed.steps = parseSteps(body);
        break;
      case "checklist":
        parsed.checklist = parseChecklist(body);
        break;
    }
  }

  return normalizeStructuredSop(parsed);
}

export function formatSopToMarkdown(sop: StructuredSop): string {
  const normalized = normalizeStructuredSop(sop);
  return `# ${normalized.title}

## Purpose
${normalized.purpose}

## Scope
${normalized.scope.map((item) => `- ${item}`).join("\n")}

## Tools Needed
${normalized.tools.map((item) => `- ${item}`).join("\n")}

## Inputs
${normalized.inputs.map((item) => `- ${item}`).join("\n")}

## Steps
${normalized.steps.map((item, index) => `${index + 1}. ${item}`).join("\n")}

## Quality Checks
${normalized.quality_checks.map((item) => `- ${item}`).join("\n")}

## Checklist
${normalized.checklist.map((item) => `- [ ] ${item}`).join("\n")}

## Notes
${normalized.notes.map((item) => `- ${item}`).join("\n")}`.trim();
}

export function coerceStructuredSop(value: Json | null | undefined, fallbackMarkdown?: string) {
  if (isStructuredSop(value)) {
    return normalizeStructuredSop(value);
  }

  if (fallbackMarkdown?.trim()) {
    return parseMarkdownToSopJSON(fallbackMarkdown);
  }

  return { ...DEFAULT_SOP };
}
