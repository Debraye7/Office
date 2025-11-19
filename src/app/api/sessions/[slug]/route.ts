import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import { verifyAdminToken, verifyDeskToken, verifyOwnerToken } from "@shared/middlewares/authMiddleware";
import SessionModel from "@sessions/models/Session";

// @desc Update session
// @route PUT /api/sessions/:id
// @access Owner, Admin

export async function PUT(req:NextRequest) {
  try {
    await connectDB();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

    const sessionId = req.url.split("/")[5].split("?")[0];
    const { checkIn, checkOut } = await req.json();

//! Validations
    if(!sessionId) return NextResponse.json({ message:"Session missing" }, { status:400 });
    if(!checkIn) return NextResponse.json({ message:"Check-in missing" }, { status:400 });
    if(!checkOut) return NextResponse.json({ message:"Check-out missing" }, { status:400 });

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyAdminToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

//! Update session
    const updatedSession = await SessionModel.findByIdAndUpdate(sessionId, { checkIn, checkOut }).lean();
    if(!updatedSession) return NextResponse.json({ message:"Error updating session" }, { status:500 });

    return NextResponse.json({ message:"Sesión actualizada" }, { status:201 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Delete session
// @route DELETE /api/sessions/:id
// @access Owner

export async function DELETE(req:NextRequest) {
  try {
    await connectDB();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

    const sessionId = req.url.split("/")[5].split("?")[0];

//! Validations
    if(!sessionId) return NextResponse.json({ message:"Session missing" }, { status:400 });

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyOwnerToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

//! Update session
    const updatedSession = await SessionModel.findByIdAndDelete(sessionId).lean();
    if(!updatedSession) return NextResponse.json({ message:"Error deleting session" }, { status:500 });

    return NextResponse.json({ message:"Sesión eliminada" }, { status:200 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};