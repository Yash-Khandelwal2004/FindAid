import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const PROTECTED_PAGES     = ["/dashboard", "/listings/new"]
const PROTECTED_API_WRITE = ["/api/listings"]
const PROTECTED_API_ALL   = ["/api/requests"]
const AUTH_PAGES          = ["/login", "/register"]

export async function proxy(req: NextRequest) {

  // ── 1. Try NextAuth cookie ─────────────────────────────────────────
  let token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // ── 2. Try Bearer header ───────────────────────────────────────────
  if (!token) {
    const authHeader = req.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const rawToken    = authHeader.split(" ")[1]
        const secret      = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
        const { payload } = await jwtVerify(rawToken, secret)
        token             = payload as any
      } catch {
        // Invalid token — treat as not logged in
      }
    }
  }

  // ── 3. Try plain cookie (set by our custom login) ──────────────────
  if (!token) {
    const cookieToken = req.cookies.get("auth-token")?.value
    if (cookieToken) {
      try {
        const secret      = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
        const { payload } = await jwtVerify(cookieToken, secret)
        token             = payload as any
      } catch {
        // Invalid cookie token
      }
    }
  }

  const { pathname } = req.nextUrl
  const isLoggedIn   = !!token

  // ── 4. Protect pages ───────────────────────────────────────────────
  const isProtectedPage = PROTECTED_PAGES.some((path) =>
    pathname.startsWith(path)
  )

  if (isProtectedPage && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── 5. Redirect logged-in users away from auth pages ──────────────
  if (isLoggedIn && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // ── 6. Protect write API routes ────────────────────────────────────
  const isProtectedWriteApi = PROTECTED_API_WRITE.some((path) =>
    pathname.startsWith(path)
  )

  if (isProtectedWriteApi && !isLoggedIn && req.method !== "GET") {
    return NextResponse.json(
      { success: false, error: "Unauthorized — please log in" },
      { status: 401 }
    )
  }

  // ── 7. Protect all-method API routes ───────────────────────────────
  const isProtectedAllApi = PROTECTED_API_ALL.some((path) =>
    pathname.startsWith(path)
  )

  if (isProtectedAllApi && !isLoggedIn) {
    return NextResponse.json(
      { success: false, error: "Unauthorized — please log in" },
      { status: 401 }
    )
  }

  // ── 8. Inject user ID header ───────────────────────────────────────
  const userId = (token?.id ?? token?.sub) as string | undefined

  if (isLoggedIn && userId) {
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-user-id",    userId)
    requestHeaders.set("x-user-email", (token?.email ?? "") as string)

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