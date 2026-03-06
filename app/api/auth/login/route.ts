import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/connectDB"
import User from "@/models/User"
import { apiSuccess, apiError } from "@/lib/utils"
import { SignJWT } from "jose"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    // ── Validate ──────────────────────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json(
        apiError("Email and password are required"),
        { status: 400 }
      )
    }

    await connectDB()

    // ── Find user ─────────────────────────────────────────────────────
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).lean()

    if (!user) {
      return NextResponse.json(
        apiError("No account found with this email"),
        { status: 404 }
      )
    }

    // ── Check password ────────────────────────────────────────────────
    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        apiError("Incorrect password"),
        { status: 401 }
      )
    }

    // ── Create JWT ────────────────────────────────────────────────────
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

    const token = await new SignJWT({
      id:    user._id.toString(),
      name:  user.name,
      email: user.email,
      city:  user.location.city,
      state: user.location.state,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")   // token expires in 7 days
      .sign(secret)

    // ── Return token ──────────────────────────────────────────────────
    return NextResponse.json(
      apiSuccess(
        {
          token,
          user: {
            id:    user._id.toString(),
            name:  user.name,
            email: user.email,
            city:  user.location.city,
            state: user.location.state,
          }
        },
        "Logged in successfully"
      )
    )
  } catch (err) {
    console.error("[POST /api/auth/signin]", err)
    return NextResponse.json(
      apiError("Something went wrong"),
      { status: 500 }
    )
  }
}