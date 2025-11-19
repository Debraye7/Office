import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { TypeUser } from "@shared/utils/types";
import { verifyOwnerToken } from "@shared/middlewares/authMiddleware";
import UserModel from "@users/models/User";

// @desc Update user role
// @route PUT /api/users/:id/role
// @access Owner

export async function PUT(req:NextRequest) {
  try {
    await connectDB();
    const userId = req.url.split("/")[5].split("?")[0];
    const { role } = await req.json();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyOwnerToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

    const updatedUser = await UserModel.findByIdAndUpdate(userId, { role }, { new:true });
    if(!updatedUser) return NextResponse.json({ message:"User not found" }, { status:404 });

    return NextResponse.json({ message:"Rol actualizado", user:updatedUser }, { status:201 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};