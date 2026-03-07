import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import Listing from "@/models/Listing";
import "@/lib/models";
import { apiSuccess, apiError, getPagination } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const sp = req.nextUrl.searchParams;
    const { page, limit, skip } = getPagination(sp);

    const filter: Record<string, any> = {};

    const category = sp.get("category");
    const bloodGroup = sp.get("bloodGroup");
    const city = sp.get("city");
    const state = sp.get("state");
    const status = sp.get("status") ?? "available";
    const isUrgent = sp.get("isUrgent");
    const search = sp.get("search");

    if (category) filter.category = category;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter["location.city"] = new RegExp(city, "i");
    if (state) filter["location.state"] = new RegExp(state, "i");
    if (status) filter.status = status;
    if (isUrgent === "true") filter.isUrgent = true;
    if (search) filter.$text = { $search: search };

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate("owner", "name location.city avatarUrl")
        .sort({ isUrgent: -1, createdAt: -1 })
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
      }),
    );
  } catch (err) {
    console.error("[GET /api/listings]", err);
    return NextResponse.json(apiError("Failed to fetch listings"), {
      status: 500,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    if (
      !title ||
      !description ||
      !category ||
      !quantity ||
      !condition ||
      !location
    ) {
      return NextResponse.json(
        apiError(
          "title, description, category, quantity, condition and location are required",
        ),
        { status: 400 },
      );
    }

    if (category === "blood" && !bloodGroup) {
      return NextResponse.json(
        apiError("Blood group is required for blood listings"),
        { status: 400 },
      );
    }

    if (
      !location.address ||
      !location.city ||
      !location.state ||
      !location.pincode
    ) {
      return NextResponse.json(
        apiError("Location must include address, city, state and pincode"),
        { status: 400 },
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
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/listings]", err);
    return NextResponse.json(apiError("Failed to create listing"), {
      status: 500,
    });
  }
}
