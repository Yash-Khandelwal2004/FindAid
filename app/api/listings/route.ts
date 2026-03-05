import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import Listing from "@/models/Listing";
import { apiSuccess, apiError, getPagination } from "@/lib/utils";

// ─── GET /api/listings ────────────────────────────────────────────────────────
// Public. Supports: search, category, bloodGroup, city, state, status, isUrgent
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const sp = req.nextUrl.searchParams;
    const { page, limit, skip } = getPagination(sp);

    // ── Build filter object dynamically ──────────────────────────────────────
    const filter: Record<string, any> = {};

    const category = sp.get("category");
    const bloodGroup = sp.get("bloodGroup");
    const city = sp.get("city");
    const state = sp.get("state");
    const status = sp.get("status") ?? "available"; // default to available
    const isUrgent = sp.get("isUrgent");
    const search = sp.get("search");

    if (category) filter.category = category;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter["location.city"] = new RegExp(city, "i");
    if (state) filter["location.state"] = new RegExp(state, "i");
    if (status) filter.status = status;
    if (isUrgent === "true") filter.isUrgent = true;

    // Full-text search across title, description, tags
    if (search) {
      filter.$text = { $search: search };
    }

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate("owner", "name location.city location.state avatarUrl")
        .sort({ isUrgent: -1, createdAt: -1 }) // urgent first, then newest
        .skip(skip)
        .limit(limit)
        .lean(),
      Listing.countDocuments(filter),
    ]);

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
    );
  } catch (err) {
    console.error("[GET /api/listings]", err);
    return NextResponse.json(apiError("Failed to fetch listings"), {
      status: 500,
    });
  }
}

// ─── POST /api/listings ───────────────────────────────────────────────────────
// Protected. Middleware injects x-user-id header.
export async function POST(req: NextRequest) {
  try {
    // Read user ID injected by middleware proxy — no JWT decode needed here
    const ownerId = req.headers.get("x-user-id");
    if (!ownerId) {
      return NextResponse.json(apiError("Unauthorized"), { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      category,
      bloodGroup,
      quantity,
      unit,
      condition,
      isUrgent,
      images,
      location,
      availableFrom,
      availableTill,
      tags,
    } = body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!title || !description || !category || !quantity || !condition || !location) {
      return NextResponse.json(apiError("Missing required fields"), {
        status: 400,
      });
    }

    if (category === "blood" && !bloodGroup) {
      return NextResponse.json(
        apiError("Blood group is required for blood donations"),
        { status: 400 }
      );
    }

    await connectDB();

    const listing = await Listing.create({
      owner: ownerId,
      title: title.trim(),
      description: description.trim(),
      category,
      bloodGroup: bloodGroup ?? undefined,
      quantity,
      unit: unit ?? "units",
      condition,
      isUrgent: isUrgent ?? false,
      images: images ?? [],
      location,
      availableFrom: availableFrom ? new Date(availableFrom) : new Date(),
      availableTill: availableTill ? new Date(availableTill) : undefined,
      tags: tags ?? [],
    });

    return NextResponse.json(
      apiSuccess(listing, "Listing created successfully"),
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/listings]", err);
    return NextResponse.json(apiError("Failed to create listing"), {
      status: 500,
    });
  }
}