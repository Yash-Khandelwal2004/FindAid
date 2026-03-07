import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/connectDB"
import "@/lib/models"
import Listing from "@/models/Listing"
import { apiSuccess, apiError, getPagination } from "@/lib/utils"

export async function GET(req: NextRequest) {
  try {
    const ownerId = req.headers.get("x-user-id")
    if (!ownerId) {
      return NextResponse.json(
        apiError("Unauthorized"),
        { status: 401 }
      )
    }

    await connectDB()

    const sp                    = req.nextUrl.searchParams
    const { page, limit, skip } = getPagination(sp)

    const [listings, total] = await Promise.all([
      Listing.find({ owner: ownerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Listing.countDocuments({ owner: ownerId }),
    ])

    return NextResponse.json(
      apiSuccess({
        listings,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      })
    )
  } catch (err) {
    console.error("[GET /api/listings/mine]", err)
    return NextResponse.json(
      apiError("Failed to fetch your listings"),
      { status: 500 }
    )
  }
}