import { NextResponse } from "next/server";
import { parse, serialize } from 'cookie';
import { connectDB } from "@config/db";
import { TypeUser } from "@shared/utils/types";
import { generateAuthToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import DeskModel from "@desks/models/Desk";

const { NODE_ENV } =  process.env;

// @desc Set desk token
// @route POST /api/desks/token
// @access Private

export async function POST(req:Request) {
  try {
    await connectDB();
    const { deskId } = await req.json();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyUserToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validations
    if(!deskId) return NextResponse.json({ message:"Missing desk id" }, { status:500 });

//! Find desk
    const desk = await DeskModel.findById(deskId);
    if(!desk) return NextResponse.json({ message:"Desk not found" }, { status:404 });

//! Verify if the user is a member
    const isMember = desk.members.find((memberId:string) => memberId === userToken._id);
    if(!isMember) return NextResponse.json({ message:"Access denied, you are not a member" }, { status:401 });

//! Generate desk token
    const deskToken = generateAuthToken(desk._id);
    if(!deskToken) return NextResponse.json({ message:"Error generating token" }, { status:500 });

//! Save desktop token
    const serializedDeskCookie = serialize('deskToken', deskToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
    });

//! Return user data with JWT
    const res = NextResponse.json({ message:"Bienvenido" }, { status: 200 });
    res.headers.set('Set-Cookie', serializedDeskCookie);

    return res;
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};