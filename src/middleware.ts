import { NextRequest, NextResponse } from "next/server";
import { createClient } from "./lib/supabase/middleware";

const protectedRoutes = ["/upload"];

function hasErrorInUrl(url: URL): boolean {
  return !!url.searchParams.get("error") && !url.pathname.startsWith("/error");
}

function buildErrorRedirectUrl(request: NextRequest, url: URL): URL {
  const errorUrl = new URL("/error", request.url);
  const error = url.searchParams.get("error");
  const error_code = url.searchParams.get("error_code");
  const error_description = url.searchParams.get("error_description");

  if (error) errorUrl.searchParams.set("error", error);
  if (error_code) errorUrl.searchParams.set("error_code", error_code);
  if (error_description) errorUrl.searchParams.set("error_description", error_description);

  return errorUrl;
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.includes(pathname);
}

async function isUserAuthenticated(supabase: ReturnType<typeof createClient>["supabase"]): Promise<boolean> {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();
  return !!user && !authError;
}

function buildLoginRedirectUrl(request: NextRequest): URL {
  return new URL("/auth/login", request.url);
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const url = new URL(request.url);

  if (hasErrorInUrl(url)) {
    const errorUrl = buildErrorRedirectUrl(request, url);
    return NextResponse.redirect(errorUrl);
  }

  if (isProtectedRoute(request.nextUrl.pathname)) {
    const authenticated = await isUserAuthenticated(supabase);
    if (!authenticated) {
      const redirectUrl = buildLoginRedirectUrl(request);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"]
};
