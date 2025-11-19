import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import { verifyAdminToken, verifyDeskToken } from "@shared/middlewares/authMiddleware";
import SessionModel from "@sessions/models/Session";

// @desc Get user sessions
// @route GET /api/sessions
// @access Owner, Admin

export async function GET(req:NextRequest) {
  try {
    await connectDB();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

    const queries = req.url.split("?")[1]?.split("&");
    const queryUser = queries.find(item => item.includes("user="))?.split("=")[1];
    const filter = {
      userId:queryUser ? decodeURIComponent(queryUser).replace("+", " ") : undefined,
    };

//! Validations
    if(!filter.userId) return NextResponse.json({ message:"User missing" }, { status:400 });

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyAdminToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

//! User sessions whit duration in hours
    const allSessions = await SessionModel.find({ user:filter.userId }).lean();
    const sortedSessions = allSessions.sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime()).map(session => ({ ...session, hours:session.checkOut ? Number(((session.checkOut.getTime() - session.checkIn.getTime()) / (1000 * 60 * 60)).toFixed(1)) : null }));

    return NextResponse.json(sortedSessions, { status:200 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};