import "server-only";

import type { CreateSopInput } from "@/lib/sops/types";

import { requestGroqCompletion } from "./client";
import { buildRepairPrompt, buildUserPrompt, SYSTEM_PROMPT } from "./prompts";
import { validateAndNormalizeContent } from "./validation";

/**
 * Simple in-process LRU-style cache to avoid re-calling Groq for identical inputs
 * within a server process lifetime. Max 50 entries to prevent unbounded growth.
 */
const MAX_CACHE_SIZE = 50;
const generationCache = new Map<string, string>();

function getCacheKey(input: CreateSopInput) {
  return `${input.title.trim().toLowerCase()}|||${input.rawNotes.trim().toLowerCase()}`;
}

function cacheGet(key: string) {
  const value = generationCache.get(key);
  if (value) {
    generationCache.delete(key);
    generationCache.set(key, value);
  }
  return value ?? null;
}

function cacheSet(key: string, value: string) {
  if (generationCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = generationCache.keys().next().value;
    if (oldestKey !== undefined) {
      generationCache.delete(oldestKey);
    }
  }
  generationCache.set(key, value);
}

export async function generateSopContent(input: CreateSopInput) {
  const cacheKey = getCacheKey(input);
  const cached = cacheGet(cacheKey);
  if (cached) {
    return cached;
  }

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
    cacheSet(cacheKey, firstValidation.content);
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
    cacheSet(cacheKey, repairedValidation.content);
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
