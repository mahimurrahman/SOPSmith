import "server-only";

import type { CreateSopInput } from "@/lib/sops/types";

import { requestGroqCompletion } from "./client";
import { buildRepairPrompt, buildUserPrompt, SYSTEM_PROMPT } from "./prompts";
import { validateAndNormalizeContent } from "./validation";

export async function generateSopContent(input: CreateSopInput) {
  const firstDraft = await requestGroqCompletion([
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: buildUserPrompt(input),
    },
  ]);

  const firstValidation = validateAndNormalizeContent(input.title, firstDraft);

  if (firstValidation.ok) {
    return firstValidation.content;
  }

  console.error("[groq:generateSopContent]", {
    reason: firstValidation.reason,
    stage: "initial-validation",
  });

  const repairedDraft = await requestGroqCompletion([
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: buildRepairPrompt({
        ...input,
        draft: firstDraft,
        reason: firstValidation.reason,
      }),
    },
  ]);

  const repairedValidation = validateAndNormalizeContent(input.title, repairedDraft);

  if (repairedValidation.ok) {
    return repairedValidation.content;
  }

  console.error("[groq:generateSopContent]", {
    firstReason: firstValidation.reason,
    repairReason: repairedValidation.reason,
    stage: "repair-validation",
  });

  throw new Error(
    "Groq returned an SOP that still failed validation after one repair pass. Please try again.",
  );
}
