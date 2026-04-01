import { getErrorLogDetails } from "@/lib/errors";
import { getGroqEnv } from "@/lib/env";

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

export type GroqMessage = {
  role: "system" | "user";
  content: string;
};

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES = 3;

function getGroqUserMessage(status: number, providerMessage?: string) {
  if (status === 401 || status === 403) {
    return "Groq rejected the request. Check your API key and model configuration.";
  }

  if (status === 429) {
    return "Groq is rate limiting requests right now. Wait a moment and try again.";
  }

  return providerMessage ?? "Groq could not generate the SOP right now.";
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function requestGroqCompletion(messages: GroqMessage[]) {
  const { apiKey, model } = getGroqEnv();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const backoffMs = Math.min(200 * Math.pow(2, attempt - 1), 4000);
      const jitter = Math.random() * 200;
      await sleep(backoffMs + jitter);
    }

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
          max_completion_tokens: 2000,
          messages,
        }),
        cache: "no-store",
      });
    } catch (error) {
      console.error("[groq:requestGroqCompletion] network error", {
        attempt,
        ...getErrorLogDetails(error),
      });
      lastError = new Error("Could not reach Groq. Check your API key, model, and network connection.");
      continue;
    }

    let payload: GroqResponse | null = null;

    try {
      payload = (await response.json()) as GroqResponse;
    } catch (parseError) {
      console.error("[groq:requestGroqCompletion] parse error", {
        attempt,
        message: "Failed to parse Groq response as JSON",
        parseError: parseError instanceof Error ? parseError.message : String(parseError),
        status: response.status,
      });
      payload = null;
    }

    if (!response.ok) {
      const errMsg = payload?.error?.message;
      console.error("[groq:requestGroqCompletion] non-ok response", {
        attempt,
        message: errMsg ?? "Groq request failed.",
        status: response.status,
      });

      if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < MAX_RETRIES) {
        lastError = new Error(getGroqUserMessage(response.status, errMsg));
        continue;
      }

      throw new Error(getGroqUserMessage(response.status, errMsg));
    }

    const content = payload?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      if (attempt < MAX_RETRIES) {
        lastError = new Error("Groq returned an empty SOP. Please try again.");
        continue;
      }
      throw new Error("Groq returned an empty SOP. Please try again.");
    }

    return content;
  }

  throw lastError ?? new Error("Groq could not generate the SOP after multiple attempts.");
}
