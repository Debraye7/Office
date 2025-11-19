
// @desc Delete week sessions
// @route DELETE /api/sessions/week/:week
// @access Owner

import { connectDB } from "@config/db";
import { verifyDeskToken, verifyOwnerToken } from "@shared/middlewares/authMiddleware";
import SessionModel from "@sessions/models/Session";
import { TypeDesk, TypeSession, TypeUser } from "@shared/utils/types";
import { parse } from "cookie";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req:NextRequest) {
  try {
    await connectDB();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

    const queries = req.url.split("?")[1]?.split("&");
    const queryMember = queries.find(item => item.includes("member="))?.split("=")[1];
    const queryWeek = queries.find(item => item.includes("week="))?.split("=")[1];
    const member = queryMember ? decodeURIComponent(queryMember).replace("+", " ") : undefined;
    const week = queryWeek ? decodeURIComponent(queryWeek).replaceAll("+", " ") : undefined;

//! Validations
    if(!member) return NextResponse.json({ message:"Member missing" }, { status:400 });
    if(!week) return NextResponse.json({ message:"Week missing" }, { status:400 });

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyOwnerToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

//! deleted session
    const sessions = await SessionModel.find({ user:member });
    if(!sessions) return NextResponse.json({ message:"Sessions not found" }, { status:404 });
    const grouped = (sessions ?? []).reduce((acc, session) => {
      const start = startOfWeek(new Date(session.checkIn), { weekStartsOn: 1 });
      const end = endOfWeek(new Date(session.checkIn), { weekStartsOn: 1 });
      const weekLabel = `${format(start, "dd 'de' MMMM 'del' yyyy", { locale:es })}-${format(end, "dd 'de' MMMM 'del' yyyy", { locale:es })}`;
      let weekEntry = acc.find((entry:{week:string; sessions:TypeSession[]; total:number}) => entry.week === weekLabel);
      if (!weekEntry) {
        weekEntry = { week: weekLabel, sessions: [], total: 0 };
        acc.push(weekEntry);
      }
      weekEntry.sessions.push(session);
      if (session.checkOut) weekEntry.total += session.hours;
      return acc;
    }, [] as { week:string; sessions:TypeSession[]; total:number }[]);
    grouped.find((item:{week:string; sessions:TypeSession[]; total:number}) => item.week === week)?.sessions.forEach(async (session:TypeSession) => {
      await SessionModel.findByIdAndDelete(session._id);
    });

    return NextResponse.json({ message:"Sesiones eliminadas" }, { status:200 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};