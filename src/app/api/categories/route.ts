import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { verifyAdminToken, verifyDeskToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import CategoryModel from "@categories/models/Category";
import { TypeDesk, TypeUser } from "@shared/utils/types";

// @desc Get all categories or by type
// @route GET /api/categories
// @access Owner, Admin, User, Client

export async function GET(req:NextRequest) {
  try {
    await connectDB();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

    const queries = req.url.split("?")[1]?.split("&");
    const queryType = queries.find(item => item.includes("type="))?.split("=")[1];
    const filter = {
      type:queryType ? decodeURIComponent(queryType).replace("+", " ") : undefined,
    };

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyUserToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

//! Get categories
    let categories = await CategoryModel.find({ desk:desk._id });
    if(filter.type !== "all") categories = categories.filter(category => category.type === filter.type);

    return NextResponse.json(categories, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Create category
// @route POST /api/categories
// @access Owner, Admin

export async function POST(req:NextRequest) {
  try {
    await connectDB();
    const { type, icon, label } = await req.json();
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

//! Validations
    if(!type) return NextResponse.json({ message:"Missing type." }, { status:400 });
    if(icon < 1) return NextResponse.json({ message:"Icono requerido." }, { status:400 });
    if(!label.trim()) return NextResponse.json({ message:"La categoría debe tener al menos 1 carácter." }, { status:400 });
    if(label.trim().length > 100) return NextResponse.json({ message:"La categoría puede tener un máximo de 100 caracteres." }, { status:400 });

    const category = await CategoryModel.create({ desk:desk._id, type, icon, label });
    if(!category) return NextResponse.json({ message:"Error creating category" }, { status:500 });

    return NextResponse.json({ message:"Categoría creada", category }, { status:201});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};