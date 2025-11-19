import { serialize } from 'cookie';
import { NextResponse } from 'next/server';

const { NODE_ENV } =  process.env;

export async function GET() {
  try {
    const serializedDeskCookie = serialize("deskToken", "", {
      httpOnly:true,
      secure:NODE_ENV === "production",
      path:"/",
      sameSite:"strict",
    });

    const response = NextResponse.json({ message:"Escritorio inactivo" }, { status:200 });
    response.headers.set("Set-Cookie", serializedDeskCookie);

    return response;
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};