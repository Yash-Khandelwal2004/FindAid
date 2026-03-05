import mongoose ,{Document,Schema} from "mongoose";

export interface IUser extends Document{
  _id:mongoose.Types.ObjectId
  name:string
  email:string
  passwordHash:string
  phone?:string
  location:{
    city:string
    state:string
    coordinates?:{
      lat:number
      lng:number
    }
  }
  avatarUrl?:string
  isVerified:boolean
  createdAt:Date
  updatedAt:Date

}

const UserSchema=new Schema<IUser>(
  {
    name:{
      type:String,
      required:true,
      trim:true,
    },
    email:{
      type:String,
      required:true,
      unique:true,
      lowercase:true,
      trim:true,
    },
    passwordHash:{
      type:String,
      required:true,
    },
    phone:{
      type:String,
      trim:true,
    },
    location:{
       city:  { type: String, required: true },
      state: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    avatarUrl:{type:String},
    isVerified:{type:Boolean,default:false}
  },
  {
    timestamps:true
  }
)

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema)