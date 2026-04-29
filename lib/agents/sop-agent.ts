import { requestGroqCompletion } from "@/lib/groq/client";
import type { StructuredSop } from "@/lib/sops";
import { normalizeStructuredSop } from "@/lib/sops";

export interface SopAgentInput {
  title: string;
  rawNotes: string;
}

export interface SopAgentContext {
  attachmentText?: string;
  existingSop?: StructuredSop;
}

export type SopAgentOutput = StructuredSop;

export type SopStatus =
  | "Intaking..."
  | "Planning..."
  | "Generating..."
  | "Validating..."
  | "Fixing..."
  | "Regenerating Section..."
  | "Applying Edits...";

export type StatusCallback = (status: SopStatus) => void;

type SopPlan = {
  ownerExpectation: string;
  sections: Array<keyof StructuredSop>;
  title: string;
};

type SopValidationResult = {
  issues: string[];
  normalized: StructuredSop;
  ok: boolean;
};

function stripCodeFences(value: string) {
  return value.replace(/```json|```/gi, "").trim();
}

function intakeAgent(input: SopAgentInput, context?: SopAgentContext) {
  const rawNotes = input.rawNotes.trim();
  const attachmentText = context?.attachmentText?.trim();

  return {
    title: input.title.trim(),
    notes: attachmentText
      ? `${rawNotes}\n\nContext from attachments:\n${attachmentText}`
      : rawNotes,
  };
}

function plannerAgent(input: ReturnType<typeof intakeAgent>): SopPlan {
  const ownerMatch = input.notes.match(/owner\s*[:=-]?\s*(.+)/i);

  return {
    ownerExpectation: ownerMatch?.[1]?.split("\n")[0]?.trim() || "Operations",
    sections: [
      "title",
      "purpose",
      "scope",
      "tools",
      "inputs",
      "steps",
      "quality_checks",
      "checklist",
      "notes",
    ],
    title: input.title,
  };
}

function buildWriterPrompt(plan: SopPlan, notes: string) {
  return `You are an operations systems expert writing SOPs for real teams.

Return a valid JSON object only.

Schema:
{
  "title": "string",
  "purpose": "string",
  "scope": ["string"],
  "tools": ["string"],
  "inputs": ["string"],
  "steps": ["string"],
  "quality_checks": ["string"],
  "checklist": ["string"],
  "notes": ["string"]
}

Requirements:
- Use the exact title "${plan.title}".
- The purpose must include an "Owner: <role>" line.
- Steps must be actionable, ordered, and realistic for business teams.
- Checklist items must align with the steps and quality checks.
- Do not leave required sections empty.
- Prefer concrete tools, inputs, escalations, and role clarity over generic advice.
- Put only assumptions, exceptions, or escalation guidance in notes.

Sections to fill: ${plan.sections.join(", ")}
Expected owner if implied: ${plan.ownerExpectation}

Source material:
${notes}`;
}

async function writingAgent(plan: SopPlan, notes: string): Promise<StructuredSop> {
  const response = await requestGroqCompletion([
    {
      role: "system",
      content: "You return only valid JSON matching the requested SOP schema.",
    },
    {
      role: "user",
      content: buildWriterPrompt(plan, notes),
    },
  ]);

  return normalizeStructuredSop(JSON.parse(stripCodeFences(response)) as StructuredSop);
}

function validateSop(output: StructuredSop): SopValidationResult {
  const normalized = normalizeStructuredSop(output);
  const issues: string[] = [];

  if (!normalized.title) issues.push("title is required");
  if (!normalized.purpose || !/Owner:\s*\S+/i.test(normalized.purpose)) {
    issues.push('purpose must include an "Owner: <role>" line');
  }
  if (normalized.scope.length === 0) issues.push("scope must not be empty");
  if (normalized.tools.length === 0) issues.push("tools must not be empty");
  if (normalized.inputs.length === 0) issues.push("inputs must not be empty");
  if (normalized.steps.length < 3) issues.push("steps must contain at least 3 actionable items");
  if (normalized.quality_checks.length === 0) issues.push("quality checks must not be empty");
  if (normalized.checklist.length === 0) issues.push("checklist must not be empty");
  if (normalized.notes.length === 0) issues.push("notes must not be empty");

  const invalidSteps = normalized.steps.filter((step) => !/^[A-Za-z]/.test(step));
  if (invalidSteps.length > 0) {
    issues.push("each step must start with an action-oriented sentence");
  }

  if (normalized.checklist.length < Math.max(2, Math.ceil(normalized.steps.length / 2))) {
    issues.push("checklist should be substantial enough to verify completion");
  }

  return {
    issues,
    normalized,
    ok: issues.length === 0,
  };
}

async function repairAgent(
  output: StructuredSop,
  issues: string[],
  plan: SopPlan,
  notes: string,
): Promise<StructuredSop> {
  const response = await requestGroqCompletion([
    {
      role: "system",
      content: "You are fixing only the weak or missing parts of an SOP. Return valid JSON only.",
    },
    {
      role: "user",
      content: `Repair this SOP JSON so it satisfies the issues below while preserving good sections.

Issues:
${issues.map((issue) => `- ${issue}`).join("\n")}

Expected owner: ${plan.ownerExpectation}
Exact title: ${plan.title}

Original source material:
${notes}

Current SOP JSON:
${JSON.stringify(output, null, 2)}`,
    },
  ]);

  return normalizeStructuredSop(JSON.parse(stripCodeFences(response)) as StructuredSop);
}

export async function runSopAgent(
  input: SopAgentInput,
  context?: SopAgentContext,
  onStatus?: StatusCallback,
): Promise<SopAgentOutput> {
  onStatus?.("Intaking...");
  const intake = intakeAgent(input, context);

  onStatus?.("Planning...");
  const plan = plannerAgent(intake);

  onStatus?.("Generating...");
  let output = await writingAgent(plan, intake.notes);

  onStatus?.("Validating...");
  let validation = validateSop(output);

  if (!validation.ok) {
    onStatus?.("Fixing...");
    output = await repairAgent(validation.normalized, validation.issues, plan, intake.notes);
    validation = validateSop(output);
  }

  if (!validation.ok) {
    throw new Error(`SOP validation failed: ${validation.issues.join(", ")}`);
  }

  return validation.normalized;
}

export async function regenerateSopSection(
  sop: SopAgentOutput,
  section: keyof SopAgentOutput,
  instruction?: string,
  onStatus?: StatusCallback,
): Promise<SopAgentOutput> {
  onStatus?.("Regenerating Section...");

  const response = await requestGroqCompletion([
    {
      role: "system",
      content: "You are an SOP editor. Return only valid JSON for the requested section value.",
    },
    {
      role: "user",
      content: `Regenerate only the "${section}" section of this SOP.

Return the section value only:
- string for "title" or "purpose"
- string[] for all array fields

Current SOP:
${JSON.stringify(sop, null, 2)}

${instruction ? `Instruction: ${instruction}` : ""}`,
    },
  ]);

  const nextValue = JSON.parse(stripCodeFences(response)) as StructuredSop[keyof StructuredSop];
  const updated = normalizeStructuredSop({
    ...sop,
    [section]: nextValue,
  });

  const validation = validateSop(updated);
  if (!validation.ok) {
    throw new Error(`Section update failed validation: ${validation.issues.join(", ")}`);
  }

  return validation.normalized;
}

export async function editSopWithAgent(
  sop: SopAgentOutput,
  instruction: string,
  context?: SopAgentContext,
  onStatus?: StatusCallback,
): Promise<SopAgentOutput> {
  onStatus?.("Applying Edits...");

  const response = await requestGroqCompletion([
    {
      role: "system",
      content: "You are an SOP editor. Return a full valid JSON SOP only.",
    },
    {
      role: "user",
      content: `Apply the user's instruction to the SOP while preserving all sections that do not need changes.

Instruction:
${instruction}

Additional context:
${context?.attachmentText?.trim() || "None"}

Current SOP:
${JSON.stringify(sop, null, 2)}`,
    },
  ]);

  const updated = normalizeStructuredSop(JSON.parse(stripCodeFences(response)) as StructuredSop);
  const validation = validateSop(updated);

  if (!validation.ok) {
    throw new Error(`Edited SOP failed validation: ${validation.issues.join(", ")}`);
  }

  return validation.normalized;
}
