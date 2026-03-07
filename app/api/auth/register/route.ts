import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/connectDB";
import User from "@/models/User";
import { apiSuccess, apiError } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, city, state } = body;

    if (!name || !email || !password || !city || !state) {
      return NextResponse.json(
        apiError("Name, email, password, city and state are required"),
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        apiError("Password must be at least 8 characters"),
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(apiError("Invalid email address"), {
        status: 400,
      });
    }
    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        apiError("An account with this email already exists"),
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      phone: phone?.trim(),
      location: {
        city: city.trim(),
        state: state.trim(),
      },
    });

    return NextResponse.json(
      apiSuccess(
        {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
        "Account created successfully",
      ),
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json(
      apiError("Something went wrong, please try again"),
      { status: 500 },
    );
  }
}
