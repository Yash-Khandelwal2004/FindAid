import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/connectDB";
import Listing from "@/models/Listing";
import BorrowRequest from "@/models/BorrowRequest";
import { apiSuccess, apiError } from "@/lib/utils";

// ─── GET /api/listings/[id] ───────────────────────────────────────────────────
// Public. Increments view count.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json(apiError("Invalid listing ID"), { status: 400 });
    }

    await connectDB();

    const listing = await Listing.findByIdAndUpdate(
      params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate("owner", "name phone location avatarUrl createdAt")
      .lean();

    if (!listing) {
      return NextResponse.json(apiError("Listing not found"), { status: 404 });
    }

    return NextResponse.json(apiSuccess(listing));
  } catch (err) {
    console.error("[GET /api/listings/[id]]", err);
    return NextResponse.json(apiError("Failed to fetch listing"), {
      status: 500,
    });
  }
}

// ─── PATCH /api/listings/[id] ─────────────────────────────────────────────────
// Protected. Only the owner can update their listing.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ownerId = req.headers.get("x-user-id");
    if (!ownerId) {
      return NextResponse.json(apiError("Unauthorized"), { status: 401 });
    }

    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json(apiError("Invalid listing ID"), { status: 400 });
    }

    await connectDB();

    const listing = await Listing.findById(params.id);
    if (!listing) {
      return NextResponse.json(apiError("Listing not found"), { status: 404 });
    }

    // Ownership check
    if (listing.owner.toString() !== ownerId) {
      return NextResponse.json(apiError("Forbidden — not your listing"), {
        status: 403,
      });
    }

    const body = await req.json();

    // Whitelist updatable fields — owner & _id can never be changed
    const ALLOWED = [
      "title", "description", "category", "bloodGroup",
      "quantity", "unit", "condition", "status",
      "isUrgent", "images", "location",
      "availableFrom", "availableTill", "tags",
    ];

    const updates: Record<string, any> = {};
    for (const key of ALLOWED) {
      if (key in body) updates[key] = body[key];
    }

    const updated = await Listing.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json(apiSuccess(updated, "Listing updated"));
  } catch (err) {
    console.error("[PATCH /api/listings/[id]]", err);
    return NextResponse.json(apiError("Failed to update listing"), {
      status: 500,
    });
  }
}

// ─── DELETE /api/listings/[id] ────────────────────────────────────────────────
// Protected. Only owner can delete. Blocks delete if active borrow requests exist.
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ownerId = req.headers.get("x-user-id");
    if (!ownerId) {
      return NextResponse.json(apiError("Unauthorized"), { status: 401 });
    }

    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json(apiError("Invalid listing ID"), { status: 400 });
    }

    await connectDB();

    const listing = await Listing.findById(params.id);
    if (!listing) {
      return NextResponse.json(apiError("Listing not found"), { status: 404 });
    }

    if (listing.owner.toString() !== ownerId) {
      return NextResponse.json(apiError("Forbidden — not your listing"), {
        status: 403,
      });
    }

    // Block deletion if there are active/approved borrow requests
    const activeRequest = await BorrowRequest.findOne({
      listing: params.id,
      status: { $in: ["pending", "approved", "active"] },
    });

    if (activeRequest) {
      return NextResponse.json(
        apiError("Cannot delete — there are active borrow requests on this listing"),
        { status: 409 }
      );
    }

    await Listing.findByIdAndDelete(params.id);

    return NextResponse.json(apiSuccess(null, "Listing deleted successfully"));
  } catch (err) {
    console.error("[DELETE /api/listings/[id]]", err);
    return NextResponse.json(apiError("Failed to delete listing"), {
      status: 500,
    });
  }
}