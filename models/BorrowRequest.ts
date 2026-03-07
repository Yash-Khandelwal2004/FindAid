import mongoose, { Document, Schema } from "mongoose"
import { RequestStatus, UrgencyLevel, PreferredContact } from "@/types"

export interface IBorrowRequest extends Document {
  _id: mongoose.Types.ObjectId
  listing: mongoose.Types.ObjectId    
  requester: mongoose.Types.ObjectId  
  owner: mongoose.Types.ObjectId     
  quantityRequested: number
  status: RequestStatus
  message: string                     
  ownerNote?: string                 
  urgencyLevel: UrgencyLevel
  needByDate?: Date                  
  returnByDate?: Date                
  handedOverAt?: Date                 
  returnedAt?: Date                   
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

BorrowRequestSchema.index({ listing: 1, status: 1 })   
BorrowRequestSchema.index({ requester: 1, status: 1 })  
BorrowRequestSchema.index({ owner: 1, status: 1 })     

export default mongoose.models.BorrowRequest ||
  mongoose.model<IBorrowRequest>("BorrowRequest", BorrowRequestSchema)