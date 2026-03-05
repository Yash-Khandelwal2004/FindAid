import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/connectDB";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  // Store sessions as JWTs (no DB session table needed)
  session: { strategy: "jwt" },

  // Custom pages
  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectDB();

        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        }).lean();

        if (!user) throw new Error("No account found with this email");

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) throw new Error("Incorrect password");

        // Return shape must match the JWT/session callbacks below
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          city: user.location.city,
          state: user.location.state,
        };
      },
    }),
  ],

  callbacks: {
    // Called when JWT is created or updated
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.city = (user as any).city;
        token.state = (user as any).state;
      }
      return token;
    },

    // Called whenever session is accessed on the client
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.city = token.city as string;
        session.user.state = token.state as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

