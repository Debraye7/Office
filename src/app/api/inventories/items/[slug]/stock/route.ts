import { connectDB } from "@config/db";
import { verifyAdminToken, verifyDeskToken } from "@shared/middlewares/authMiddleware";
import ItemModel from "@items/models/Item";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

// @desc Update item stock
// @route PUT /api/inventories/items/:id/stock
// @access Owner, Admin

export async function PUT(req:NextRequest) {
  try {
    await connectDB();
    const itemId = req.url.split("/")[6].split("?")[0];
    const { stock } = await req.json();
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
    if(stock < 0) return NextResponse.json({ message:"Stock igual a 0." }, { status:400 });

//! Update Product
    const item = await ItemModel.findById(itemId);
    if(!item) return NextResponse.json({ message:"Item not found" }, { status:404 });

    item.stock = stock >= 0 ? stock : item.stock; 

    await item.save();

    return NextResponse.json({ message:"Artículo actualizado" }, { status:201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};