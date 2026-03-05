import mongoose, { Document, Schema } from "mongoose"
import { RequestStatus, UrgencyLevel, PreferredContact } from "@/types"

export interface IBorrowRequest extends Document {
  _id: mongoose.Types.ObjectId
  listing: mongoose.Types.ObjectId    // ref: Listing
  requester: mongoose.Types.ObjectId  // ref: User (person who wants to borrow)
  owner: mongoose.Types.ObjectId      // ref: User (person who posted listing)
  quantityRequested: number
  status: RequestStatus
  message: string                     // requester explains their need
  ownerNote?: string                  // owner's response note
  urgencyLevel: UrgencyLevel
  needByDate?: Date                   // when requester needs it
  returnByDate?: Date                 // agreed return date
  handedOverAt?: Date                 // when owner gave it
  returnedAt?: Date                   // when requester returned it
  requesterContact: {
    phone: string
    preferredContact: PreferredContact
  }
  timeline: {
    status: RequestStatus
    changedAt: Date
    note?: string
  }[]
  createdAt: Date
  updatedAt: Date
}

const BorrowRequestSchema = new Schema<IBorrowRequest>(
  {
    listing:   { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    requester: { type: Schema.Types.ObjectId, ref: "User",    required: true },
    owner:     { type: Schema.Types.ObjectId, ref: "User",    required: true },
    quantityRequested: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["pending", "approved", "active", "returned", "rejected", "cancelled"],
      default: "pending",
    },
    message:   { type: String, required: true, maxlength: 500 },
    ownerNote: { type: String, maxlength: 500 },
    urgencyLevel: {
      type: String,
      enum: ["low", "medium", "critical"],
      default: "medium",
    },
    needByDate:   { type: Date },
    returnByDate: { type: Date },
    handedOverAt: { type: Date },
    returnedAt:   { type: Date },
    requesterContact: {
      phone: { type: String, required: true },
      preferredContact: {
        type: String,
        enum: ["phone", "email", "whatsapp"],
        default: "phone",
      },
    },
    timeline: [
      {
        status:    { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        note:      { type: String },
      },
    ],
  },
  { timestamps: true }
)

// Indexes — optimized for the 3 most common dashboard queries
BorrowRequestSchema.index({ listing: 1, status: 1 })    // "all requests on this listing"
BorrowRequestSchema.index({ requester: 1, status: 1 })  // "all requests I made"
BorrowRequestSchema.index({ owner: 1, status: 1 })      // "all requests on my listings"

export default mongoose.models.BorrowRequest ||
  mongoose.model<IBorrowRequest>("BorrowRequest", BorrowRequestSchema)