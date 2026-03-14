import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { getErrorLogDetails } from "@/lib/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { shouldLogAuthError } from "./shared";

export async function getAuthContext() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error && shouldLogAuthError(error)) {
    console.error("[auth:getAuthContext]", getErrorLogDetails(error));
  }

  return {
    supabase,
    user,
    error,
  };
}

export async function getOptionalUser(): Promise<User | null> {
  const { error, user } = await getAuthContext();

  if (error) {
    return null;
  }

  return user;
}

export async function requireUser() {
  const { supabase, user } = await getAuthContext();

  if (!user) {
    redirect("/login?error=Please sign in to continue.");
  }

  return {
    supabase,
    user,
  };
}
