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

function getGroqUserMessage(status: number, providerMessage?: string) {
  if (status === 401 || status === 403) {
    return "Groq rejected the request. Check your API key and model configuration.";
  }

  if (status === 429) {
    return "Groq is rate limiting requests right now. Wait a moment and try again.";
  }

  return providerMessage ?? "Groq could not generate the SOP right now.";
}

export async function requestGroqCompletion(messages: GroqMessage[]) {
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
        messages,
      }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("[groq:requestGroqCompletion]", getErrorLogDetails(error));
    throw new Error("Could not reach Groq. Check your API key, model, and network connection.");
  }

  let payload: GroqResponse | null = null;

  try {
    payload = (await response.json()) as GroqResponse;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    console.error("[groq:requestGroqCompletion]", {
      message: payload?.error?.message ?? "Groq request failed.",
      status: response.status,
    });
    throw new Error(getGroqUserMessage(response.status, payload?.error?.message));
  }

  const content = payload?.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Groq returned an empty SOP. Please try again.");
  }

  return content;
}
