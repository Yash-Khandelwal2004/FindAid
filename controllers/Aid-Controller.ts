import Aid from "@/models/Aid-model"
import connectDB from "@/lib/dbConnect";
import { Schema } from "mongoose";

interface AidInput{
    name:string,
    quantity:number,
    address:string,
    owner:Schema.Types.ObjectId
}

export const getAllAids= async()=>{
    await connectDB();
    return Aid.find();
}

export const createAid=async(data:AidInput)=>{
    await connectDB();
    return Aid.create({
        ...data,

    })
};