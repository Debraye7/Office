import { NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { verifyAdminToken, verifyDeskToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import ItemModel from "@items/models/Item";

// @desc Get all items
// @route GET /api/inventories/items
// @access Owner, Admin, User, Client

export async function GET(req:Request) {
  try {
    await connectDB();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

    const queries = req.url.split("?")[1]?.split("&") || [];
    const queryTitle = queries.find(item => item.includes("title="))?.split("=")[1];
    const queryCategory = queries.find(item => item.includes("category="))?.split("=")[1];
    const queryInventory = queries.find(item => item.includes("inventory="))?.split("=")[1];
    const filter = {
      title:queryTitle ? decodeURIComponent(queryTitle).replace("+", " ") : undefined,
      category:queryCategory ? decodeURIComponent(queryCategory).replace("+", " ") : undefined,
      inventory:queryInventory ? decodeURIComponent(queryInventory).replace("+", " ") : undefined,
    };

    if(!filter.inventory) return NextResponse.json({ message:"Missing Inventory" }, { status:400 });

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyUserToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

//! All items
    let items = await ItemModel.find({ inventory:filter.inventory }).populate("category");

//! Filter products
    if(filter.title) items = items.filter(item => item.title.toLowercase().includes(filter.title));
    if(filter.category) items = items.filter(item => item.category._id.toString() === filter.category);

    return NextResponse.json(items, { status:200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Create a new item
// @route POST /api/inventories/items
// @access Owner, Admin

export async function POST(req:Request) {
  try {
    await connectDB();
    const { inventory, title, description, category, price } = await req.json();
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
    if(!inventory) return NextResponse.json({ message:"Missing inventory." }, { status:400 });
    if(!title.trim()) return NextResponse.json({ message:"El título debe tener al menos 1 carácter." }, { status:400 });
    if(title.trim().length > 200) return NextResponse.json({ message:"El título puede tener un máximo de 200 caracteres." }, { status:400 });
    if(!category) return NextResponse.json({ message:"Categoría obligatoria" }, { status:400 });
    if(Number(price) < 0) return NextResponse.json({ message:"Precio obligatorio" }, { status:400 });

    const newItem = await ItemModel.create({
      inventory,
      title,
      description,
      category,
      price:Number(price),
    });
    if(!newItem) return NextResponse.json({ message:"Create item error"}, { status:500 });

    const item = await ItemModel.findById(newItem._id).populate("category");
    if(!item) return NextResponse.json({ message:"Item not found"}, { status:404 });

    return NextResponse.json({ message:"Artículo creado" }, { status:201 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};