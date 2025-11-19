import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { verifyAdminToken, verifyDeskToken, verifyOwnerToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import ItemModel from "@items/models/Item";

// @desc Get item by ID
// @route GET /api/inventories/items/:id
// @access Owner, Admin, User, Client

export async function GET(req:NextRequest) {
  try {
    await connectDB();
    const itemId = req.url.split("/")[6].split("?")[0];
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyUserToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

//! Find Product
    const item = await ItemModel.findById(itemId).populate("category");
    if(!item) return NextResponse.json({ message:"Item not found" }, { status:404 });

    return NextResponse.json(item, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Update item details
// @route PUT /api/inventories/items/:id
// @access Owner, Admin

export async function PUT(req:NextRequest) {
  try {
    await connectDB();
    const itemId = req.url.split("/")[6].split("?")[0];
    const { title, description, category, price, stock } = await req.json();
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
    if(!itemId) return NextResponse.json({ message:"Missing ID." }, { status:400 });
    if(!title.trim()) return NextResponse.json({ message:"El título debe tener al menos 1 carácter." }, { status:400 });
    if(title.trim().length > 200) return NextResponse.json({ message:"El título puede tener un máximo de 200 caracteres." }, { status:400 });
    if(!category) return NextResponse.json({ message:"Categoría obligatoria" }, { status:400 });
    if(Number(price) < 0) return NextResponse.json({ message:"Precio obligatorio" }, { status:400 });

//! Update Product
    const item = await ItemModel.findById(itemId);
    if(!item) return NextResponse.json({ message:"Item not found" }, { status:404 });

    item.title = title || item.title;
    item.description = description || item.description;
    item.category = category || item.category;
    item.price = price || item.price;
    item.stock = stock || item.stock; 

    await item.save();

    return NextResponse.json({ message:"Artículo actualizado" }, { status:201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Delete item
// @route DELETE /api/inventories/items/:id
// @access Private Owner

export async function DELETE(req:NextRequest) {
  try {
    await connectDB();
    const itemId = req.url.split("/")[6].split("?")[0];
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

//! Delete Product
    const Item = await ItemModel.findByIdAndDelete(itemId);
    if(!Item) return NextResponse.json({ message:"Item not found" }, { status:404 });

    return NextResponse.json({ message:"Artículo eliminado" }, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};