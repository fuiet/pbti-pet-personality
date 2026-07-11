import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const protectedPaths = ["/create", "/upload", "/quiz", "/result", "/dashboard", "/report", "/memory"];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isProtectedPath && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/create/:path*", "/upload/:path*", "/quiz/:path*", "/result/:path*", "/dashboard/:path*", "/report/:path*", "/memory/:path*"],
};