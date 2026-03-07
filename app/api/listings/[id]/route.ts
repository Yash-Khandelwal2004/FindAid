import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectDB } from "@/lib/connectDB"
import "@/lib/models"  
import Listing from "@/models/Listing"
import BorrowRequest from "@/models/BorrowRequest"
import User from "@/models/User"       
import { apiSuccess, apiError } from "@/lib/utils"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        apiError("Invalid listing ID"),
        { status: 400 }
      )
    }

    await connectDB()

    const listing = await Listing.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { returnDocument: "after" }
    )
      .populate("owner", "name phone location avatarUrl createdAt")
      .lean()

    if (!listing) {
      return NextResponse.json(
        apiError("Listing not found"),
        { status: 404 }
      )
    }

    return NextResponse.json(apiSuccess(listing))
  } catch (err) {
    console.error("[GET /api/listings/[id]]", err)
    return NextResponse.json(
      apiError("Failed to fetch listing"),
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }    = await params
    const ownerId   = req.headers.get("x-user-id")

    if (!ownerId) {
      return NextResponse.json(
        apiError("Unauthorized"),
        { status: 401 }
      )
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        apiError("Invalid listing ID"),
        { status: 400 }
      )
    }

    await connectDB()

    const listing = await Listing.findById(id)
    if (!listing) {
      return NextResponse.json(
        apiError("Listing not found"),
        { status: 404 }
      )
    }

    if (listing.owner.toString() !== ownerId) {
      return NextResponse.json(
        apiError("Forbidden — you do not own this listing"),
        { status: 403 }
      )
    }

    const body = await req.json()

    const ALLOWED_FIELDS = [
      "title",
      "description",
      "category",
      "bloodGroup",
      "quantity",
      "unit",
      "condition",
      "status",
      "isUrgent",
      "images",
      "location",
      "availableFrom",
      "availableTill",
      "tags",
    ]

    const updates: Record<string, any> = {}
    for (const key of ALLOWED_FIELDS) {
      if (key in body) updates[key] = body[key]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        apiError("No valid fields provided to update"),
        { status: 400 }
      )
    }

    const updated = await Listing.findByIdAndUpdate(
      id,
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    ).lean()

    return NextResponse.json(
      apiSuccess(updated, "Listing updated successfully")
    )
  } catch (err) {
    console.error("[PATCH /api/listings/[id]]", err)
    return NextResponse.json(
      apiError("Failed to update listing"),
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }  = await params
    const ownerId = req.headers.get("x-user-id")

    if (!ownerId) {
      return NextResponse.json(
        apiError("Unauthorized"),
        { status: 401 }
      )
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        apiError("Invalid listing ID"),
        { status: 400 }
      )
    }

    await connectDB()

    const listing = await Listing.findById(id)
    if (!listing) {
      return NextResponse.json(
        apiError("Listing not found"),
        { status: 404 }
      )
    }

    if (listing.owner.toString() !== ownerId) {
      return NextResponse.json(
        apiError("Forbidden — you do not own this listing"),
        { status: 403 }
      )
    }

    const activeRequest = await BorrowRequest.findOne({
      listing: id,
      status:  { $in: ["pending", "approved", "active"] },
    })

    if (activeRequest) {
      return NextResponse.json(
        apiError("Cannot delete — this listing has active borrow requests. Resolve them first."),
        { status: 409 }
      )
    }

    await Listing.findByIdAndDelete(id)

    return NextResponse.json(
      apiSuccess(null, "Listing deleted successfully")
    )
  } catch (err) {
    console.error("[DELETE /api/listings/[id]]", err)
    return NextResponse.json(
      apiError("Failed to delete listing"),
      { status: 500 }
    )
  }
}