import { NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { verifyAdminToken, verifyDeskToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import InventoryModel from "@inventories/models/Inventory";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import ItemModel from "@items/models/Item";
import CategoryModel from "@categories/models/Category";

// @desc Get all inventories
// @route GET /api/inventories
// @access Owner:all, Admin|User|client:assigned

export async function GET(req:Request) {
  try {
    await connectDB();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

    const queries = req.url.split("?")[1]?.split("&") || [];
    const queryFolder = queries.find(item => item.includes("folder="))?.split("=")[1];
    const filter = {
      folder:queryFolder ? decodeURIComponent(queryFolder).replace("+", " ") : undefined,
    };

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyUserToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

//! All inventories
    let inventories = [];
    if(userToken.role === "owner") inventories = await InventoryModel.find({ desk:desk._id }).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");
    if(userToken.role === "admin" || userToken.role === "user" || userToken.role === "client") inventories = await InventoryModel.find({ desk:desk._id, assignedTo:userToken._id }).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");

//! Filter inventory
    if(filter.folder) inventories = inventories.filter(inventory => inventory.folder._id.toString() === filter.folder);

//! Add items and quantity
    await CategoryModel.find();
    inventories = await Promise.all(inventories.map(async (inventory) => {
      const items = await ItemModel.find({ inventory:inventory._id }).populate("category");
      let quantity = 0;
      items.forEach((item) => {
        quantity += item.stock;
      });
      return { ...inventory._doc, items:items, quantity };
    }));
    return NextResponse.json(inventories, { status:200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Create a new inventory
// @route POST /api/inventories
// @access Owner, Admin

export async function POST(req:Request) {
  try {
    await connectDB();
    const { folder, title, location, assignedTo } = await req.json();
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
    if(!title.trim()) return NextResponse.json({ message:"El título debe tener al menos 1 carácter." }, { status:400 });
    if(title.trim().length > 200) return NextResponse.json({ message:"El título puede tener un máximo de 200 caracteres." }, { status:400 });
    if(!Array.isArray(assignedTo)) return NextResponse.json({ message:"AssignedTo must be an array of users IDs" }, { status:400 });

    const newInventory = await InventoryModel.create({
      desk:desk._id,
      folder,
      title,
      location,
      assignedTo,
    });
    if(!newInventory) return NextResponse.json({ message:"Create inventory error"}, { status:500 });

    const inventory = await InventoryModel.findById(newInventory._id).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");
    if(!inventory) return NextResponse.json({ message:"Inventory not found"}, { status:404 });

    return NextResponse.json({ message:"Inventario creado" }, { status:201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};