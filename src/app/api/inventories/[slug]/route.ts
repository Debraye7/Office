import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { verifyAdminToken, verifyDeskToken, verifyOwnerToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import InventoryModel from "@inventories/models/Inventory";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import ItemModel from "@items/models/Item";

// @desc Get inventory by ID
// @route GET /api/inventories/:id
// @access Owner, Assigned

export async function GET(req:NextRequest) {
  try {
    await connectDB();
    const inventoryId = req.url.split("/")[5].split("?")[0];
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

    const queries = req.url.split("?")[1]?.split("&");
    const queryCategory = queries.find(item => item.includes("category="))?.split("=")[1];
    const filter = {
      category:queryCategory ? decodeURIComponent(queryCategory).replace("+", " ") : undefined,
    };

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyUserToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

//! Find Inventory
    const inventory = await InventoryModel.findById(inventoryId).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");
    if(!inventory) return NextResponse.json({ message:"Inventory not found" }, { status:404 });
    if(userToken.role !== "owner" && !inventory.assignedTo.find((user:TypeUser) => user._id.toString() === userToken._id.toString())) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

//! Add Items
    let items = await ItemModel.find({ inventory:inventory._id }).populate("category");
  //? Filter stocks
    if(filter.category) items = items.filter((item) => item.category._id === filter.category);

    return NextResponse.json({ inventory, items }, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Update inventory details
// @route PUT /api/inventories/:id
// @access Owner, Admin

export async function PUT(req:NextRequest) {
  try {
    await connectDB();
    const inventoryId = req.url.split("/")[5].split("?")[0];
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

//! Update Inventory
    const updatedInventory = await InventoryModel.findById(inventoryId);
    if(!updatedInventory) return NextResponse.json({ message:"Inventory not found" }, { status:404 });

    updatedInventory.folder = folder || updatedInventory.folder;
    updatedInventory.title = title || updatedInventory.title;
    updatedInventory.location = location || updatedInventory.location;
    updatedInventory.assignedTo = assignedTo || updatedInventory.assignedTo;
    await updatedInventory.save();

    return NextResponse.json({ message:"Inventario actualizado" }, { status:201 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Delete inventory
// @route DELETE /api/inventories/:id
// @access Private Owner

export async function DELETE(req:NextRequest) {
  try {
    await connectDB();
    const inventoryId = req.url.split("/")[5].split("?")[0];
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

//! Delete Inventory
    const inventory = await InventoryModel.findByIdAndDelete(inventoryId);
    if(!inventory) return NextResponse.json({ message:"Inventory not found" }, { status:404 });
  //? Delete Items
    const deletedItems = await ItemModel.deleteMany({ inventory:inventory._id });
    if(!deletedItems.acknowledged) return NextResponse.json({ message:"Error deleting items" }, { status:500 });

    return NextResponse.json({ message:"Inventario eliminado" }, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};