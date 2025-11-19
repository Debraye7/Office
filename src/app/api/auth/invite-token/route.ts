import { NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { TypeUser } from "@shared/utils/types";
import { generateInviteToken, verifyOwnerToken } from "@shared/middlewares/authMiddleware";

// @desc Create Invite Token
// @route GET /api/auth/invite-token
// @access Owner

export async function GET(req:Request) {
  try {
    await connectDB();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;

    const queries = req.url.split("?")[1]?.split("&");
    const queryRole = queries.find(item => item.includes("role="))?.split("=")[1];
    if(queryRole !== "owner" && queryRole !== "admin" && queryRole !== "user" && queryRole !== "client") return NextResponse.json({ message:"Missing Role" }, { status:400 });

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyOwnerToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Generate invite token
    const inviteToken = generateInviteToken(queryRole);
    if(!inviteToken) return NextResponse.json({ message:"Creating token error" }, { status:500 });

    return NextResponse.json(inviteToken, { status:200 });

  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  }
};