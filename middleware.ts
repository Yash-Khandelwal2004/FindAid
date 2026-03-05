import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// ─── Route protection config ──────────────────────────────────────────────────

// Full page routes that require login
const PROTECTED_PAGES = ["/dashboard", "/listings/new"];

// API routes where non-GET methods require login
const PROTECTED_API_WRITE = ["/api/listings"];

// API routes where ALL methods require login
const PROTECTED_API_ALL = ["/api/requests"];

// Routes to redirect AWAY from if already logged in
const AUTH_ROUTES = ["/login", "/register"];

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname, method } = req.nextUrl;
  const isLoggedIn = !!token;

  // ── 1. Protect page routes ──────────────────────────────────────────────────
  const isProtectedPage = PROTECTED_PAGES.some((p) =>
    pathname.startsWith(p)
  );

  if (isProtectedPage && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 2. Redirect logged-in users away from auth pages ───────────────────────
  if (isLoggedIn && AUTH_ROUTES.some((p) => pathname === p)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ── 3. Protect write API routes (POST, PATCH, DELETE require auth) ──────────
  const isProtectedWriteApi = PROTECTED_API_WRITE.some((p) =>
    pathname.startsWith(p)
  );

  if (
    isProtectedWriteApi &&
    !isLoggedIn &&
    req.method !== "GET"
  ) {
    return NextResponse.json(
      { success: false, error: "Unauthorized — please log in" },
      { status: 401 }
    );
  }

  // ── 4. Protect all-method API routes ───────────────────────────────────────
  const isProtectedAllApi = PROTECTED_API_ALL.some((p) =>
    pathname.startsWith(p)
  );

  if (isProtectedAllApi && !isLoggedIn) {
    return NextResponse.json(
      { success: false, error: "Unauthorized — please log in" },
      { status: 401 }
    );
  }

  // ── 5. Inject user ID header so API routes don't re-decode JWT ─────────────
  // This is the proxy benefit — API routes just read the header, no JWT work
  if (isLoggedIn && token.id) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", token.id as string);
    requestHeaders.set("x-user-email", token.email as string);

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

// ─── Which paths this middleware runs on ─────────────────────────────────────
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/listings/new",
    "/login",
    "/register",
    "/api/listings/:path*",
    "/api/requests/:path*",
  ],
};