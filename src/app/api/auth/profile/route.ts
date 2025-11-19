import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { parse } from 'cookie';
import { connectDB } from "@config/db";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import { verifyDeskToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import UserModel from "@users/models/User";

// @desc Get user profile
// @route GET /api/auth/profile
// @access Private (Requires JWT)

export async function GET(req:Request) {
  try {
    await connectDB();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyUserToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);

//! Find user
    const user = await UserModel.findById(userToken._id);
    if(!user) return NextResponse.json({ message:"User not found" }, { status:404 });

//! Return active user and desk data
    return NextResponse.json({ message:"Sesión activa", user, desk }, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  }
};

// @desc Update user profile
// @route PUT /api/auth/profile
// @access Private (Requires JWT)

export async function PUT(req:NextRequest) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyUserToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

    const user = await UserModel.findById(userToken._id);
    if(!user) return NextResponse.json({ message:"User not found" }, { status:404 });

    user.name = name || user.name;
    user.email = email || user.email;

    if(password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      user.password = hash;
    };

    const updatedUser = await user.save();

    return NextResponse.json({ 
      _id:updatedUser._id,
      name:updatedUser.name,
      email:updatedUser.email,
      profileImageUrl:updatedUser.profileImageUrl,
      role:updatedUser.role,
    }, { status:201 });

  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  }
};