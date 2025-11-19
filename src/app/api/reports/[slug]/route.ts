import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import { verifyDeskToken, verifyOwnerToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import ReportModel from "@reports/models/Report";

// @desc Update report details
// @route PUT /api/reports/:id
// @access Owner, Admin, user, client

export async function PUT(req:NextRequest) {
  try {
    await connectDB();
    const reportId = req.url.split("/")[5].split("?")[0];
    const { folder, title, description, date } = await req.json();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

//! Validations
    if(!title.trim()) return NextResponse.json({ message:"El título debe tener al menos 1 carácter." }, { status:400 });
    if(title.trim().length > 200) return NextResponse.json({ message:"El título puede tener un máximo de 200 caracteres." }, { status:400 });
    if(description.trim().length > 600) return NextResponse.json({ message:"La descripción puede tener un máximo de 600 caracteres." }, { status:400 });

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyUserToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

//! Update Report
    const report = await ReportModel.findById(reportId);
    if(!report) return NextResponse.json({ message:"Report not found" }, { status:404 });
    if((userToken.role !== "owner" && userToken.role !== "admin") || report.createdBy.toString() !== userToken._id.toString()) return NextResponse.json({ message:"Not authorized" }, { status:400 });

    report.folder = folder || report.folder;
    report.title = title || report.title;
    report.description = description || report.description;
    report.date = date || report.date;

    await report.save();

    return NextResponse.json({ message:"Reporte actualizado" }, { status:201 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Delete report
// @route DELETE /api/reports/:id
// @access Owner

export async function DELETE(req:NextRequest) {
  try {
    await connectDB();
    const reportId = req.url.split("/")[5].split("?")[0];
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyOwnerToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

//! Delete Report
    const report = await ReportModel.findByIdAndDelete(reportId);
    if(!report) return NextResponse.json({ message:"Report not found" }, { status:404 });

    return NextResponse.json({ message:"Reporte eliminado" }, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};