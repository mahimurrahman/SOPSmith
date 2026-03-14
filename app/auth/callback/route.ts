import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { createLoginRedirect, getOAuthErrorMessage } from "@/lib/auth";
import { getErrorLogDetails } from "@/lib/errors";
import type { Database } from "@/lib/database.types";
import { getPublicSupabaseEnv } from "@/lib/env";
import { sanitizeNextPath } from "@/lib/urls";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
  const oauthError = request.nextUrl.searchParams.get("error");
  const oauthErrorDescription = request.nextUrl.searchParams.get("error_description");

  if (oauthError || oauthErrorDescription) {
    console.error("[auth:callback]", {
      description: oauthErrorDescription,
      error: oauthError,
    });

    return createLoginRedirect(
      request,
      getOAuthErrorMessage(oauthError, oauthErrorDescription),
      nextPath,
    );
  }

  if (!code) {
    return createLoginRedirect(request, "Missing sign-in code. Request a new link and try again.", nextPath);
  }

  const destination = new URL(nextPath, request.url);
  let response = NextResponse.redirect(destination);
  const { anonKey, url } = getPublicSupabaseEnv();
  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.redirect(destination);

        cookiesToSet.forEach(({ name, options, value }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth:callback]", getErrorLogDetails(error));

    return createLoginRedirect(
      request,
      "Your sign-in link is invalid or expired. Request a new one.",
      nextPath,
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    if (userError) {
      console.error("[auth:callback]", getErrorLogDetails(userError));
    }

    return createLoginRedirect(
      request,
      "Your session could not be established. Sign in again and retry.",
      nextPath,
    );
  }

  return response;
}
