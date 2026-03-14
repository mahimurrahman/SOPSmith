type AuthErrorLike = {
  message?: string;
  name?: string;
};

export function shouldLogAuthError(error: AuthErrorLike | null | undefined) {
  if (!error) {
    return false;
  }

  return error.name !== "AuthSessionMissingError" && error.message !== "Auth session missing!";
}

export function getMagicLinkErrorMessage(message?: string) {
  const normalized = message?.toLowerCase() ?? "";

  if (normalized.includes("rate limit")) {
    return "Too many sign-in attempts were made. Wait a minute, then try again.";
  }

  if (normalized.includes("email") && normalized.includes("not enabled")) {
    return "Email sign-in is not available right now. Check your Supabase auth settings.";
  }

  return "We could not send your magic link right now. Double-check the email address and try again.";
}

export function getOAuthErrorMessage(error?: string | null, description?: string | null) {
  const combined = `${error ?? ""} ${description ?? ""}`.toLowerCase();

  if (combined.includes("cancel") || combined.includes("access_denied")) {
    return "Sign-in was cancelled before it finished. Try again.";
  }

  return "We could not complete sign-in. Please try again.";
}
