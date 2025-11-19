import { NextResponse } from "next/server";
import { parse } from "cookie";
import { compareAsc, compareDesc } from "date-fns";
import { connectDB } from "@config/db";
import { verifyAdminToken, verifyDeskToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import ReportModel from "@reports/models/Report";
import { TypeDesk, TypeUser } from "@shared/utils/types";

// @desc Get all reports
// @route GET /api/reports
// @access Owner|Admin:all, User|Client:only created reports

export async function GET(req:Request) {
  try {
    await connectDB();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

    const queries = req.url.split("?")[1]?.split("&");
    const queryFolder = queries ? queries.find(item => item.includes("folder="))?.split("=")[1] : undefined;
    const queryUser = queries ? queries.find(item => item.includes("user="))?.split("=")[1] : undefined;
    const filter = {
      folder:queryFolder ? decodeURIComponent(queryFolder).replace("+", " ") : undefined,
      user:queryUser ? decodeURIComponent(queryUser).replace("+", " ") : undefined,
    };

    const querySort = queries ? queries.find(item => item.includes("sort="))?.split("=")[1] : undefined;
    const sort =  querySort ? decodeURIComponent(querySort).replace(/\+/g, " ") : "Fecha Final (asc)";

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyUserToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

//! All reports
    let reports = [];
    if(userToken.role === "owner" || userToken.role === "admin") reports = await ReportModel.find({ desk:desk._id }).populate("createdBy", "name email profileImageUrl").populate("folder", "title");
    if(userToken.role === "user" || userToken.role === "client") reports = await ReportModel.find({ desk:desk._id, createdBy:userToken._id }).populate("createdBy", "name email profileImageUrl").populate("folder", "title");

//! Filter reports
    if(filter.user) reports = reports.filter(report => report.createdBy._id.toString() === filter.user);
    if(filter.folder) reports = reports.filter(report => report.folder._id.toString() === filter.folder);

//! Sort reports
    if(sort === "Fecha (asc)") reports = reports.sort((a, b) => compareAsc(a.date, b.date));
    if(sort === "Fecha (desc)") reports = reports.sort((a, b) => compareDesc(a.date, b.date));
    if(sort === "Título (asc)") reports = reports.sort((a, b) => a.title.localeCompare(b.title));
    if(sort === "Título (desc)") reports = reports.sort((a, b) => b.title.localeCompare(a.title));

    return NextResponse.json(reports, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Create a new report
// @route POST /api/reports
// @access Owner, Admin, User, Client

export async function POST(req:Request) {
  try {
    await connectDB();
    const { folder, title, description, date } = await req.json();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyAdminToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

    const newReport = await ReportModel.create({
      desk:desk._id,
      folder,
      createdBy:userToken._id,
      title,
      description,
      date,
    });
    if(!newReport) return NextResponse.json({ message:"Create report error"}, { status:500 });

    const report = await ReportModel.findById(newReport._id).populate("createdBy", "name email profileImageUrl").populate("folder", "title");
    if(!report) return NextResponse.json({ message:"Task not found"}, { status:404 });

    return NextResponse.json({ message:"Reporte creado", report }, { status:201 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};