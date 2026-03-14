import "server-only";

import type { CreateSopInput } from "@/lib/types";
import { getGroqEnv } from "@/lib/env";

const REQUIRED_SECTIONS = [
  "## Purpose",
  "## Scope",
  "## Tools Needed",
  "## Inputs",
  "## Steps",
  "## Quality Checks",
  "## Checklist",
  "## Notes",
] as const;

const SYSTEM_PROMPT = `You write standard operating procedures for real operations teams.

Return plain text only.

You must produce exactly one SOP with these headings in this exact order:
# Title
## Purpose
## Scope
## Tools Needed
## Inputs
## Steps
## Quality Checks
## Checklist
## Notes

Rules:
- Use the provided title exactly as the H1.
- Do not add, remove, rename, or reorder headings.
- Do not include markdown code fences.
- Do not mention being an AI, a model, or following instructions.
- Keep the SOP practical, concise, and operational.
- Keep the SOP under 500 words unless the notes clearly require more detail.
- Avoid fluff, long intros, generic best-practice filler, and marketing language.
- Do not invent company-specific systems, names, approvals, metrics, or thresholds that are not implied by the notes.
- When details are missing, make only minimal, generic assumptions that keep the SOP usable.
- In ## Purpose, write a brief purpose statement and include a separate line formatted exactly as "Owner: <role>".
- If the notes imply an owner, use that role. If not, use "Owner: Operations".
- In ## Tools Needed and ## Inputs, use short bullet lists. Use "None" only if truly appropriate.
- In ## Steps, use a numbered list starting at 1. Start each step with an action verb.
- Add rough time estimates in steps when reasonable, such as "(5-10 minutes)", but do not invent overly specific numbers.
- Include edge cases when relevant using direct instructions such as "If X happens, do Y."
- In ## Quality Checks, list the checks that confirm the SOP was completed correctly.
- In ## Checklist, use "- [ ]" items for the most important completion checks.
- In ## Notes, include only important exceptions, reminders, follow-ups, or escalation guidance.`;

const USER_PROMPT_TEMPLATE = `Create one SOP from the rough notes below.

Title: {title}

Rough notes:
{rawNotes}

Return only the SOP in the required format.`;

type GroqResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

function buildUserPrompt({ rawNotes, title }: CreateSopInput) {
  return USER_PROMPT_TEMPLATE.replace("{title}", title).replace("{rawNotes}", rawNotes);
}

function getHeadingLines(content: string) {
  return content.match(/^#{1,6} .+$/gm) ?? [];
}

function getSectionBody(content: string, heading: (typeof REQUIRED_SECTIONS)[number]) {
  const startIndex = content.indexOf(heading);

  if (startIndex === -1) {
    return "";
  }

  const nextHeadingIndex = REQUIRED_SECTIONS.slice(
    REQUIRED_SECTIONS.indexOf(heading) + 1,
  ).reduce((closestIndex, nextHeading) => {
    const index = content.indexOf(nextHeading, startIndex + heading.length);

    if (index === -1) {
      return closestIndex;
    }

    if (closestIndex === -1) {
      return index;
    }

    return Math.min(closestIndex, index);
  }, -1);

  const endIndex = nextHeadingIndex === -1 ? content.length : nextHeadingIndex;
  return content.slice(startIndex + heading.length, endIndex).trim();
}

function normalizeContent(title: string, content: string) {
  const cleaned = content.replace(/\r\n/g, "\n").trim();

  if (cleaned.includes("```")) {
    throw new Error("Generated SOP included code fences. Please try again.");
  }

  const normalized = cleaned.replace(/^# .*/m, `# ${title}`);
  const lines = normalized.split("\n");
  const titleHeading = `# ${title}`;
  const headingLines = getHeadingLines(normalized);
  const allowedHeadings = [titleHeading, ...REQUIRED_SECTIONS];

  if (!lines[0]?.startsWith("# ")) {
    throw new Error("Generated SOP was missing a title heading. Please try again.");
  }

  lines[0] = titleHeading;

  const rebuilt = lines.join("\n").trim();

  if (headingLines.length !== allowedHeadings.length) {
    throw new Error("Generated SOP did not use the required headings. Please try again.");
  }

  for (const [index, heading] of allowedHeadings.entries()) {
    if (headingLines[index] !== heading) {
      throw new Error("Generated SOP headings were out of order. Please try again.");
    }
  }

  if (!/^Owner:\s+\S.+$/m.test(rebuilt)) {
    throw new Error("Generated SOP was missing an owner line. Please try again.");
  }

  if (!/^1\.\s+[A-Za-z]/m.test(getSectionBody(rebuilt, "## Steps"))) {
    throw new Error("Generated SOP did not include numbered action steps. Please try again.");
  }

  if (!/^- \[ \]\s+\S.+$/m.test(getSectionBody(rebuilt, "## Checklist"))) {
    throw new Error("Generated SOP did not include a usable checklist. Please try again.");
  }

  return rebuilt;
}

export async function generateSopContent({ rawNotes, title }: CreateSopInput) {
  const { apiKey, model } = getGroqEnv();
  let response: Response;

  try {
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_completion_tokens: 700,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: buildUserPrompt({ rawNotes, title }),
          },
        ],
      }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("[groq:generateSopContent]", {
      message: error instanceof Error ? error.message : "Unknown fetch failure",
    });
    throw new Error("Could not reach Groq. Check your API key, model, and network connection.");
  }

  let payload: GroqResponse | null = null;

  try {
    payload = (await response.json()) as GroqResponse;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    console.error("[groq:generateSopContent]", {
      message: payload?.error?.message ?? "Groq request failed.",
      status: response.status,
    });
    throw new Error(payload?.error?.message ?? "Groq could not generate the SOP right now.");
  }

  const content = payload?.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Groq returned an empty SOP. Please try again.");
  }

  return normalizeContent(title, content);
}
