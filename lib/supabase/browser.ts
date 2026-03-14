"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";
import { getPublicSupabaseEnv } from "@/lib/env";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createBrowserSupabaseClient() {
  if (client) {
    return client;
  }

  const { anonKey, url } = getPublicSupabaseEnv();
  client = createBrowserClient<Database>(url, anonKey);

  return client;
}
