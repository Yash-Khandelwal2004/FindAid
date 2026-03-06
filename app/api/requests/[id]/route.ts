import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectDB } from "@/lib/connectDB"
import BorrowRequest from "@/models/BorrowRequest"
import Listing from "@/models/Listing"
import { apiSuccess, apiError } from "@/lib/utils"
import { RequestStatus } from "@/types"

type TransitionMap = {
  [K in RequestStatus]: { next: RequestStatus[] }
}

const TRANSITIONS: TransitionMap = {
  pending:   { next: ["approved", "rejected", "cancelled"] },
  approved:  { next: ["active",   "cancelled"]             },
  active:    { next: ["returned"]                          },
  returned:  { next: []                                    },
  rejected:  { next: []                                    },
  cancelled: { next: []                                    },
}
const OWNER_ACTIONS: RequestStatus[]     = ["approved", "rejected", "active"]
const REQUESTER_ACTIONS: RequestStatus[] = ["cancelled"]

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }  = await params
    const userId  = req.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json(
        apiError("Unauthorized"),
        { status: 401 }
      )
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        apiError("Invalid request ID"),
        { status: 400 }
      )
    }

    const body = await req.json()
    const { status: newStatus, note, returnByDate } = body as {
      status:        RequestStatus
      note?:         string
      returnByDate?: string
    }

    if (!newStatus) {
      return NextResponse.json(
        apiError("New status is required"),
        { status: 400 }
      )
    }

    await connectDB()

    const request = await BorrowRequest.findById(id)
    if (!request) {
      return NextResponse.json(
        apiError("Request not found"),
        { status: 404 }
      )
    }

    const isOwner     = request.owner.toString()     === userId
    const isRequester = request.requester.toString() === userId

    if (!isOwner && !isRequester) {
      return NextResponse.json(
        apiError("Forbidden"),
        { status: 403 }
      )
    }

    // ── Validate transition ───────────────────────────────────────────
    const allowedNext = TRANSITIONS[request.status].next
    if (!allowedNext.includes(newStatus)) {
      return NextResponse.json(
        apiError(`Cannot move from "${request.status}" to "${newStatus}"`),
        { status: 400 }
      )
    }

    // ── Validate actor permission ─────────────────────────────────────
    if (OWNER_ACTIONS.includes(newStatus) && !isOwner) {
      return NextResponse.json(
        apiError("Only the listing owner can perform this action"),
        { status: 403 }
      )
    }

    if (REQUESTER_ACTIONS.includes(newStatus) && !isRequester) {
      return NextResponse.json(
        apiError("Only the requester can perform this action"),
        { status: 403 }
      )
    }

    // ── Build updates + side effects ──────────────────────────────────
    const updates: Record<string, any> = { status: newStatus }

    switch (newStatus) {
      case "approved":
        if (returnByDate) updates.returnByDate = new Date(returnByDate)
        if (note)         updates.ownerNote    = note
        break

      case "active":
        updates.handedOverAt = new Date()
        await Listing.findByIdAndUpdate(
          request.listing,
          { status: "borrowed" }
        )
        break

      case "returned":
        updates.returnedAt = new Date()
        await Listing.findByIdAndUpdate(
          request.listing,
          { status: "available" }
        )
        break

      case "rejected":
        if (note) updates.ownerNote = note
        break
    }

    // ── Update + append to timeline ───────────────────────────────────
    const updated = await BorrowRequest.findByIdAndUpdate(
      id,
      {
        $set:  updates,
        $push: {
          timeline: {
            status:    newStatus,
            changedAt: new Date(),
            ...(note && { note }),
          },
        },
      },
      { returnDocument: "after" }
    )
      .populate("listing",   "title category location")
      .populate("requester", "name phone")
      .populate("owner",     "name phone")
      .lean()

    return NextResponse.json(
      apiSuccess(updated, `Request ${newStatus}`)
    )
  } catch (err) {
    console.error("[PATCH /api/requests/[id]]", err)
    return NextResponse.json(
      apiError("Failed to update request"),
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }  = await params
    const userId  = req.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json(
        apiError("Unauthorized"),
        { status: 401 }
      )
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        apiError("Invalid request ID"),
        { status: 400 }
      )
    }

    await connectDB()

    const request = await BorrowRequest.findById(id)
      .populate("listing",   "title category bloodGroup images location status owner")
      .populate("requester", "name phone avatarUrl location")
      .populate("owner",     "name phone avatarUrl location")
      .lean()

    if (!request) {
      return NextResponse.json(
        apiError("Request not found"),
        { status: 404 }
      )
    }

    const isOwner     = (request.owner as any)._id?.toString()     === userId
    const isRequester = (request.requester as any)._id?.toString() === userId

    if (!isOwner && !isRequester) {
      return NextResponse.json(
        apiError("Forbidden"),
        { status: 403 }
      )
    }

    return NextResponse.json(apiSuccess(request))
  } catch (err) {
    console.error("[GET /api/requests/[id]]", err)
    return NextResponse.json(
      apiError("Failed to fetch request"),
      { status: 500 }
    )
  }
}