import mongoose,{Document,Schema} from "mongoose"

import { AidCategory,ListingStatus,BloodGroup } from "@/types"

export interface IListing extends Document{
  _id: mongoose.Types.ObjectId
  owner :mongoose.Types.ObjectId
  title:string
  description:string
  category:AidCategory
  bloodGroup?:BloodGroup
  quantity:number
  unit:string
  condition:"new"|"good"|"fair"
  status:ListingStatus
  isUrgent:boolean
  images:string[]
  location:{
    address:string
    city:string
    state:string
    pincode:string
    coordinates?:{lat:number;lng:number}
  }
  availableFrom: Date
  availableTill?: Date
  tags: string[]
  viewCount: number
  createdAt: Date
  updatedAt: Date
}


const ListingSchema=new Schema<IListing>(
  {
    owner:{
      type:Schema.Types.ObjectId,
      ref:"User",
      required:true,

    },
    title:{type:String,required:true,trim:true,maxLength:100},
  description: { type: String, required: true, maxlength: 1000 },
    category: {
      type: String,
      enum: ["blood", "oxygen", "wheelchair", "medicine", "equipment", "other"],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    quantity:  { type: Number, required: true, min: 1 },
    unit:      { type: String, required: true, default: "units" },
    condition: { type: String, enum: ["new", "good", "fair"], required: true },
    status: {
      type: String,
      enum: ["available", "borrowed", "unavailable"],
      default: "available",
    },
    isUrgent: { type: Boolean, default: false },
    images:   [{ type: String }],
    location: {
      address: { type: String, required: true },
      city:    { type: String, required: true },
      state:   { type: String, required: true },
      pincode: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    availableFrom: { type: Date, default: Date.now },
    availableTill: { type: Date },
    tags:          [{ type: String }],
    viewCount:     { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Compound index — fast filtering by category + status together
ListingSchema.index({ category: 1, status: 1 })

// Fast city/state filtering
ListingSchema.index({ "location.city": 1, "location.state": 1 })

// Fast blood group search
ListingSchema.index({ bloodGroup: 1, category: 1 })

// Full-text search across these three fields
ListingSchema.index({ title: "text", description: "text", tags: "text" })

// Urgent listings always bubble up first
ListingSchema.index({ isUrgent: -1, createdAt: -1 })

export default mongoose.models.Listing ||
  mongoose.model<IListing>("Listing", ListingSchema)