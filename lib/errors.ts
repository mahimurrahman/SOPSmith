type ErrorWithContext = {
  code?: string;
  details?: string | null;
  hint?: string | null;
  message?: string;
  name?: string;
  status?: number;
};

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function getDisplayErrorMessage(error: unknown, fallback: string) {
  const message = getErrorMessage(error, fallback).replace(/\s+/g, " ").trim();

  if (process.env.NODE_ENV === "development") {
    return message;
  }

  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.startsWith("unable ") ||
    lowerMessage.startsWith("your ") ||
    lowerMessage.startsWith("please ") ||
    lowerMessage.startsWith("we could not ") ||
    lowerMessage.startsWith("google sign-in ") ||
    lowerMessage.startsWith("magic link ") ||
    lowerMessage.startsWith("sign-in ") ||
    lowerMessage.startsWith("sopsmith ") ||
    lowerMessage.includes("repair sql") ||
    lowerMessage.includes("expired") ||
    lowerMessage.includes("misconfigured") ||
    lowerMessage.includes("not available right now") ||
    lowerMessage.includes("sign in") ||
    lowerMessage.includes("groq ")
  ) {
    return message.length > 240 ? `${message.slice(0, 237).trimEnd()}...` : message;
  }

  return fallback;
}

export function getErrorLogDetails(error: unknown): ErrorWithContext {
  if (!error || typeof error !== "object") {
    return {};
  }

  const maybeError = error as ErrorWithContext;

  return {
    code: maybeError.code,
    details: maybeError.details,
    hint: maybeError.hint,
    message: maybeError.message,
    name: maybeError.name,
    status: maybeError.status,
  };
}
