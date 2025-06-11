import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Updates the Supabase session cookies based on the incoming Next.js request.
 *
 * This function creates a Supabase server client using the request's cookies.
 * If Supabase needs to set new cookies (e.g., after refreshing a session),
 * it updates the cookies in the NextResponse object to ensure session
 * consistency between the server and the client.
 *
 * @param {NextRequest} request - The incoming request object from Next.js middleware.
 * @returns {Promise<NextResponse>} - A NextResponse object with updated cookies if necessary.
 */
export async function updateSession(
  request: NextRequest
): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}
