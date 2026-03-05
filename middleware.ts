import { getToken } from "next-auth/jwt";
import { NextRequest,NextResponse } from "next/server";

// Pages that require login — redirect to /login if not authenticated
const PROTECTED_PAGES = ["/dashboard", "/listings/new"]

// API routes where only POST, PATCH, DELETE need login (GET is public)
const PROTECTED_API_WRITE = ["/api/listings"]

// API routes where ALL methods need login
const PROTECTED_API_ALL = ["/api/requests"]

// Pages to redirect AWAY from if already logged in
const AUTH_PAGES = ["/login", "/register"]


export async function middleware(req:NextRequest){

  const token=await getToken({
    req,
    secret:process.env.NEXTAUTH_SECRET,
  })

  const {pathname} =req.nextUrl
  const isLoggedIn= !!token

  // ── 1. Protect pages ───────────────────────────────────────────────
  const isProtectedPage = PROTECTED_PAGES.some((path) =>
    pathname.startsWith(path)
  )

  if (isProtectedPage && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isLoggedIn && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // ── 3. Protect write API routes ────────────────────────────────────
  const isProtectedWriteApi = PROTECTED_API_WRITE.some((path) =>
    pathname.startsWith(path)
  )

  if (isProtectedWriteApi && !isLoggedIn && req.method !== "GET") {
    return NextResponse.json(
      { success: false, error: "Unauthorized — please log in" },
      { status: 401 }
    )
  }

  // ── 4. Protect all-method API routes ───────────────────────────────
  const isProtectedAllApi = PROTECTED_API_ALL.some((path) =>
    pathname.startsWith(path)
  )

  if (isProtectedAllApi && !isLoggedIn) {
    return NextResponse.json(
      { success: false, error: "Unauthorized — please log in" },
      { status: 401 }
    )
  }

  // ── 5. Inject user ID header (the proxy part) ──────────────────────
  if (isLoggedIn && token.id) {
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-user-id",    token.id as string)
    requestHeaders.set("x-user-email", token.email as string)

    return NextResponse.next({
      request: { headers: requestHeaders }
    })
  }

  return NextResponse.next()

}


export const config = {
  matcher: [
    "/dashboard/:path*",
    "/listings/new",
    "/login",
    "/register",
    "/api/listings/:path*",
    "/api/requests/:path*",
  ],
}
