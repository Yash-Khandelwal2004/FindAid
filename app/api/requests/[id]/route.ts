import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/connectDB";
import BorrowRequest from "@/models/BorrowRequest";
import Listing from "@/models/Listing";
import { apiSuccess, apiError } from "@/lib/utils";
import { RequestStatus } from "@/types";

// ─── Valid status transitions ─────────────────────────────────────────────────
// Maps: current status → allowed next statuses and who can do it
const TRANSITIONS: Record<
  RequestStatus,
  { next: RequestStatus[]; actor: "owner" | "requester" | "both" }
> = {
  pending:   { next: ["approved", "rejected", "cancelled"], actor: "both" },
  approved:  { next: ["active", "cancelled"],               actor: "both" },
  active:    { next: ["returned"],                          actor: "owner" },
  returned:  { next: [],                                    actor: "both" },
  rejected:  { next: [],                                    actor: "both" },
  cancelled: { next: [],                                    actor: "both" },
};

// ─── Who can trigger which status ────────────────────────────────────────────
const OWNER_ACTIONS: RequestStatus[]     = ["approved", "rejected", "active"];
const REQUESTER_ACTIONS: RequestStatus[] = ["cancelled"];

// ─── PATCH /api/requests/[id] ─────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(apiError("Unauthorized"), { status: 401 });
    }

    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json(apiError("Invalid request ID"), { status: 400 });
    }

    const body = await req.json();
    const { status: newStatus, note, returnByDate } = body as {
      status: RequestStatus;
      note?: string;
      returnByDate?: string;
    };

    if (!newStatus) {
      return NextResponse.json(apiError("New status is required"), {
        status: 400,
      });
    }

    await connectDB();

    const request = await BorrowRequest.findById(params.id);
    if (!request) {
      return NextResponse.json(apiError("Request not found"), { status: 404 });
    }

    const isOwner     = request.owner.toString()     === userId;
    const isRequester = request.requester.toString() === userId;

    if (!isOwner && !isRequester) {
      return NextResponse.json(apiError("Forbidden"), { status: 403 });
    }

    // ── Validate the transition is allowed ────────────────────────────────────
    const transition = TRANSITIONS[request.status];
    if (!transition.next.includes(newStatus)) {
      return NextResponse.json(
        apiError(
          `Cannot move from "${request.status}" to "${newStatus}"`
        ),
        { status: 400 }
      );
    }

    // ── Validate actor permissions ────────────────────────────────────────────
    if (OWNER_ACTIONS.includes(newStatus) && !isOwner) {
      return NextResponse.json(
        apiError("Only the listing owner can perform this action"),
        { status: 403 }
      );
    }

    if (REQUESTER_ACTIONS.includes(newStatus) && !isRequester && !isOwner) {
      return NextResponse.json(
        apiError("Only the requester can perform this action"),
        { status: 403 }
      );
    }

    // ── Apply side effects based on new status ────────────────────────────────
    const updates: Record<string, any> = { status: newStatus };

    if (newStatus === "approved") {
      updates.returnByDate = returnByDate ? new Date(returnByDate) : undefined;
      if (note) updates.ownerNote = note;
    }

    if (newStatus === "active") {
      updates.handedOverAt = new Date();
      // Mark listing as borrowed so others can't request it
      await Listing.findByIdAndUpdate(request.listing, { status: "borrowed" });
    }

    if (newStatus === "returned") {
      updates.returnedAt = new Date();
      // Mark listing as available again
      await Listing.findByIdAndUpdate(request.listing, { status: "available" });
    }

    if (newStatus === "rejected" && note) {
      updates.ownerNote = note;
    }

    // ── Append to timeline (audit trail) ─────────────────────────────────────
    const timelineEntry = {
      status: newStatus,
      changedAt: new Date(),
      ...(note && { note }),
    };

    const updated = await BorrowRequest.findByIdAndUpdate(
      params.id,
      {
        $set: updates,
        $push: { timeline: timelineEntry },
      },
      { new: true }
    )
      .populate("listing", "title category location")
      .populate("requester", "name phone")
      .populate("owner", "name phone")
      .lean();

    return NextResponse.json(apiSuccess(updated, `Request ${newStatus}`));
  } catch (err) {
    console.error("[PATCH /api/requests/[id]]", err);
    return NextResponse.json(apiError("Failed to update request"), {
      status: 500,
    });
  }
}

// ─── GET /api/requests/[id] ───────────────────────────────────────────────────
// Protected. Only owner or requester can view.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(apiError("Unauthorized"), { status: 401 });
    }

    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json(apiError("Invalid request ID"), { status: 400 });
    }

    await connectDB();

    const request = await BorrowRequest.findById(params.id)
      .populate("listing", "title category bloodGroup images location status owner")
      .populate("requester", "name phone avatarUrl location")
      .populate("owner", "name phone avatarUrl location")
      .lean();

    if (!request) {
      return NextResponse.json(apiError("Request not found"), { status: 404 });
    }

    const isOwner     = request.owner._id?.toString() === userId;
    const isRequester = request.requester._id?.toString() === userId;

    if (!isOwner && !isRequester) {
      return NextResponse.json(apiError("Forbidden"), { status: 403 });
    }

    return NextResponse.json(apiSuccess(request));
  } catch (err) {
    console.error("[GET /api/requests/[id]]", err);
    return NextResponse.json(apiError("Failed to fetch request"), {
      status: 500,
    });
  }
}