import mongoose from "mongoose"

// Step 1 — read the URI from environment
const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local")
}

// Step 2 — set up the cache on the global object
declare global {
  var _mongooseCache: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

const cached = global._mongooseCache ?? { conn: null, promise: null }
global._mongooseCache = cached

// Step 3 — the actual function
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}