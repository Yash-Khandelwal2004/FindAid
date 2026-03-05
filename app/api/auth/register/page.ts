import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/connectDB";
import User from "@/models/User";
import { apiSuccess, apiError } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, city, state } = body;

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!name || !email || !password || !city || !state) {
      return NextResponse.json(apiError("All fields are required"), {
        status: 400,
      });
    }

    if (password.length < 8) {
      return NextResponse.json(
        apiError("Password must be at least 8 characters"),
        { status: 400 }
      );
    }

    await connectDB();

    // ── Check duplicate email ─────────────────────────────────────────────────
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(apiError("Email already registered"), {
        status: 409,
      });
    }

    // ── Hash password & create user ───────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      phone: phone?.trim(),
      location: { city: city.trim(), state: state.trim() },
    });

    return NextResponse.json(
      apiSuccess(
        {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
        "Account created successfully"
      ),
      { status: 201 }
    );
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(apiError("Something went wrong"), { status: 500 });
  }
}