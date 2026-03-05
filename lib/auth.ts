import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/connectDB"
import User from "@/models/User"

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET in .env.local")
}

export const authOptions: NextAuthOptions = {

  // Use JWT — no session table needed in MongoDB
  session: { strategy: "jwt" },

  // Where to send users when auth is needed
  pages: {
    signIn: "/login",
    error:  "/login",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {

        // Basic check — both fields must exist
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        await connectDB()

        // Find user by email
        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        }).lean()

        // .lean() returns a plain JS object instead of a Mongoose document
        // faster and lighter when you don't need Mongoose methods

        if (!user) {
          throw new Error("No account found with this email")
        }

        // Compare submitted password against stored hash
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isValid) {
          throw new Error("Incorrect password")
        }

        // Return this shape — available in jwt() callback as `user`
        return {
          id:    user._id.toString(),
          name:  user.name,
          email: user.email,
          city:  user.location.city,
          state: user.location.state,
        }
      },
    }),
  ],

  callbacks: {

    async jwt({ token, user }) {
      // `user` only exists on first sign in — not on subsequent requests
      if (user) {
        token.id    = user.id
        token.city  = (user as any).city
        token.state = (user as any).state
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id    = token.id    as string
        session.user.city  = token.city  as string
        session.user.state = token.state as string
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}