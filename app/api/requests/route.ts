import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import BorrowRequest from "@/models/BorrowRequest";
import Listing from "@/models/Listing";
import { apiSuccess, apiError } from "@/lib/utils";

// ─── POST /api/requests ───────────────────────────────────────────────────────
// Protected. Requester submits a borrow request on a listing.
export async function POST(req: NextRequest) {
  try {
    const requesterId = req.headers.get("x-user-id");
    if (!requesterId) {
      return NextResponse.json(apiError("Unauthorized"), { status: 401 });
    }

    const body = await req.json();
    const {
      listingId,
      quantityRequested,
      message,
      urgencyLevel,
      needByDate,
      requesterContact,
    } = body;

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!listingId || !quantityRequested || !message || !requesterContact?.phone) {
      return NextResponse.json(apiError("Missing required fields"), {
        status: 400,
      });
    }

    await connectDB();

    // ── Check listing exists and is available ─────────────────────────────────
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return NextResponse.json(apiError("Listing not found"), { status: 404 });
    }

    if (listing.status !== "available") {
      return NextResponse.json(
        apiError("This item is no longer available"),
        { status: 409 }
      );
    }

    // ── Prevent owner from requesting their own listing ───────────────────────
    if (listing.owner.toString() === requesterId) {
      return NextResponse.json(
        apiError("You cannot request your own listing"),
        { status: 400 }
      );
    }

    // ── Prevent duplicate pending/approved requests ───────────────────────────
    const duplicate = await BorrowRequest.findOne({
      listing: listingId,
      requester: requesterId,
      status: { $in: ["pending", "approved", "active"] },
    });

    if (duplicate) {
      return NextResponse.json(
        apiError("You already have an active request for this listing"),
        { status: 409 }
      );
    }

    // ── Validate quantity ─────────────────────────────────────────────────────
    if (quantityRequested > listing.quantity) {
      return NextResponse.json(
        apiError(`Only ${listing.quantity} ${listing.unit} available`),
        { status: 400 }
      );
    }

    // ── Create request with initial timeline entry ────────────────────────────
    const request = await BorrowRequest.create({
      listing: listingId,
      requester: requesterId,
      owner: listing.owner,
      quantityRequested,
      message: message.trim(),
      urgencyLevel: urgencyLevel ?? "medium",
      needByDate: needByDate ? new Date(needByDate) : undefined,
      requesterContact,
      timeline: [{ status: "pending", changedAt: new Date() }],
    });

    return NextResponse.json(
      apiSuccess(request, "Borrow request submitted successfully"),
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/requests]", err);
    return NextResponse.json(apiError("Failed to submit request"), {
      status: 500,
    });
  }
}

// ─── GET /api/requests ────────────────────────────────────────────────────────
// Protected. Returns requests relevant to the logged-in user.
// ?role=requester → requests I made
// ?role=owner     → requests on my listings
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(apiError("Unauthorized"), { status: 401 });
    }

    await connectDB();

    const role = req.nextUrl.searchParams.get("role") ?? "requester";
    const status = req.nextUrl.searchParams.get("status");

    const filter: Record<string, any> =
      role === "owner" ? { owner: userId } : { requester: userId };

    if (status) filter.status = status;

    const requests = await BorrowRequest.find(filter)
      .populate("listing", "title category bloodGroup location images status")
      .populate("requester", "name phone avatarUrl")
      .populate("owner", "name phone avatarUrl")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(apiSuccess(requests));
  } catch (err) {
    console.error("[GET /api/requests]", err);
    return NextResponse.json(apiError("Failed to fetch requests"), {
      status: 500,
    });
  }
}