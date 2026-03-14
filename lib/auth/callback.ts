import { NextResponse, type NextRequest } from "next/server";

export function createLoginRedirect(request: NextRequest, message: string, nextPath?: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("error", message);

  if (nextPath && nextPath !== "/dashboard") {
    loginUrl.searchParams.set("next", nextPath);
  }

  return NextResponse.redirect(loginUrl);
}
