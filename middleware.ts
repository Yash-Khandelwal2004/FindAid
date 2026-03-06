import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const PROTECTED_PAGES    = ["/dashboard", "/listings/new"]
const PROTECTED_API_WRITE = ["/api/listings"]
const PROTECTED_API_ALL  = ["/api/requests"]
const AUTH_PAGES         = ["/login", "/register"]

export async function middleware(req: NextRequest) {

  // ── Read token from NextAuth cookie or Bearer header ───────────────
  let token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token) {
    const authHeader = req.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const rawToken     = authHeader.split(" ")[1]
        const secret       = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
        const { payload }  = await jwtVerify(rawToken, secret)
        token              = payload as any
      } catch {
        // Invalid token — treat as not logged in
      }
    }
  }

  const { pathname } = req.nextUrl
  const isLoggedIn   = !!token

  // ── 1. Protect pages ───────────────────────────────────────────────
  const isProtectedPage = PROTECTED_PAGES.some((path) =>
    pathname.startsWith(path)
  )

  if (isProtectedPage && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── 2. Redirect logged in users away from auth pages ───────────────
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

  // ── 5. Inject user ID header ───────────────────────────────────────
  // token.id  → from our custom signin route
  // token.sub → from NextAuth getToken()
  // check both so either signin method works
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
