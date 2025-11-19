import { NextRequest, NextResponse } from "next/server";
import { parse } from 'cookie';
import { connectDB } from "@config/db";
import { verifyOwnerToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import DeskModel from "@desks/models/Desk";
import { TypeUser } from "@shared/utils/types";

// @desc Get all desks
// @route GET /api/desks
// @access Owner:all, Admin|User|Client:only assigned desks

export async function GET(req:Request) {
  try {
    await connectDB();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyUserToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! All desks
    let userDesks = [];
    if(userToken.role === "owner") userDesks = await DeskModel.find().populate("members", "name email profileImageUrl role");
    if(userToken.role === "admin" || userToken.role === "user" || userToken.role === "client") userDesks = await DeskModel.find({ members:userToken._id }).populate("members", "name email profileImageUrl role");

    return NextResponse.json(userDesks, { status:200 });

  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Create desk
// @route POST /api/desks
// @access Owner

export async function POST(req:NextRequest) {
  try {
    await connectDB();
    const { title, members } = await req.json();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyOwnerToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validations
    if(!title.trim()) return NextResponse.json({ message:"El título debe tener al menos 1 carácter." }, { status:400 });
    if(title.trim().length > 200) return NextResponse.json({ message:"El título puede tener un máximo de 200 caracteres." }, { status:400 });

    if(!members.includes(userToken._id.toString())) members.push(userToken._id);
    const newDesk = await DeskModel.create({ title, members });
    if(!newDesk) return NextResponse.json({ message:"Error creating desk" }, { status:500 });

    const findDesk = await DeskModel.findById(newDesk._id).populate("members", "name email profileImageUrl role");

    return NextResponse.json({ message:"Escritorio creado", desk:findDesk }, { status:201 });

  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};