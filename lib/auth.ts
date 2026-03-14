import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

function shouldLogAuthError(error: { name?: string; message?: string }) {
  return error.name !== "AuthSessionMissingError" && error.message !== "Auth session missing!";
}

export async function getOptionalUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error && shouldLogAuthError(error)) {
    console.error("[auth:getOptionalUser]", {
      message: error.message,
      name: error.name,
      status: error.status,
    });
  }

  if (error) {
    return null;
  }

  return user;
}

export async function requireUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error && shouldLogAuthError(error)) {
    console.error("[auth:requireUser]", {
      message: error.message,
      name: error.name,
      status: error.status,
    });
  }

  if (!user) {
    redirect("/login?error=Please sign in to continue.");
  }

  return {
    supabase,
    user,
  };
}
