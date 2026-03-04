import User from "@/models/User-model";
import connectDB from "@/lib/dbConnect";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

interface UserInput {
  name: string;
  email: string;
  password:string;
}

export const getUsers = async () => {
  await connectDB();
  return User.find();
};

export const createUser = async (data: UserInput) => {
  await connectDB();
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return User.create({
    ...data,
    password: hashedPassword
  });
};

export const loginUser = async (email: string, password: string) => {
  await connectDB();

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return {
    token,
    user
  };
};