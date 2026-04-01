import { REQUIRED_SECTIONS } from "./prompts";

const MIN_OUTPUT_LENGTH = 220;

export type ValidationResult =
  | {
      ok: true;
      content: string;
    }
  | {
      ok: false;
      reason: string;
    };

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

export function validateAndNormalizeContent(title: string, content: string): ValidationResult {
  const cleaned = content.replace(/\r\n/g, "\n").trim();
  // Strip newlines and extra whitespace from the title so it cannot break the markdown heading.
  const safeTitle = title.replace(/[\r\n]+/g, " ").trim();

  if (cleaned.includes("```")) {
    return {
      ok: false,
      reason: "The SOP included markdown code fences.",
    };
  }

  if (cleaned.length < MIN_OUTPUT_LENGTH) {
    return {
      ok: false,
      reason: "The SOP was suspiciously short and likely incomplete.",
    };
  }

  if (!cleaned.startsWith("# ")) {
    return {
      ok: false,
      reason: "The SOP was missing the title heading.",
    };
  }

  const normalized = cleaned.replace(/^# .*/m, `# ${safeTitle}`);
  const lines = normalized.split("\n");
  const titleHeading = `# ${safeTitle}`;
  const allowedHeadings = [titleHeading, ...REQUIRED_SECTIONS];

  lines[0] = titleHeading;

  const rebuilt = lines.join("\n").trim();
  const headingLines = getHeadingLines(rebuilt);

  if (headingLines.length !== allowedHeadings.length) {
    return {
      ok: false,
      reason: "The SOP did not use the required headings.",
    };
  }

  for (const [index, heading] of allowedHeadings.entries()) {
    if (headingLines[index] !== heading) {
      return {
        ok: false,
        reason: "The SOP headings were missing, renamed, or out of order.",
      };
    }
  }

  for (const section of REQUIRED_SECTIONS) {
    if (!getSectionBody(rebuilt, section)) {
      return {
        ok: false,
        reason: `The section "${section}" was blank.`,
      };
    }
  }

  if (!/^Owner:\s+\S.+$/m.test(rebuilt)) {
    return {
      ok: false,
      reason: 'The SOP was missing a valid "Owner: <role>" line.',
    };
  }

  if (!/^1\.\s+[A-Za-z]/m.test(getSectionBody(rebuilt, "## Steps"))) {
    return {
      ok: false,
      reason: "The Steps section did not include numbered action steps.",
    };
  }

  if (!/^- \[ \]\s+\S.+$/m.test(getSectionBody(rebuilt, "## Checklist"))) {
    return {
      ok: false,
      reason: "The Checklist section did not include usable checkbox items.",
    };
  }

  return {
    ok: true,
    content: rebuilt,
  };
}
