import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import Mongoose from "mongoose";
import { connectDB } from "@config/db";
import { verifyAdminToken, verifyDeskToken, verifyOwnerToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import TaskModel from "@tasks/models/Task";
import FolderModel from "@folders/models/Folder";
import AccountModel from "@accounts/models/Account";
import TransactionModel from "@transactions/models/Transaction";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import EventModel from "@events/models/Event";
import GoalModel from "@goals/models/Goal";
import InventoryModel from "@inventories/models/Inventory";
import ItemModel from "@items/models/Item";
import ReportModel from "@reports/models/Report";

// @desc Get folder
// @route GET /api/folders/:id
// @access Owner, Admin, User, Client

export async function GET(req:NextRequest) {
  try {
    await connectDB();
    const folderId = req.url.split("/")[5].split("?")[0];
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

//! Search folder
    const findFolder = await FolderModel.findById(folderId);
    if(!findFolder) return NextResponse.json({ message:"Error fetching folder" }, { status:404 });

    return NextResponse.json(findFolder, { status:200 });

  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Update folder
// @route PUT /api/folders/:id
// @access Owner, Admin

export async function PUT(req:NextRequest) {
  try {
    await connectDB();
    const folderId = req.url.split("/")[5].split("?")[0];
    const { title } = await req.json();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

//! Validations
    if(!title.trim()) return NextResponse.json({ message:"El título debe tener al menos 1 carácter." }, { status:400 });
    if(title.trim().length > 200) return NextResponse.json({ message:"El título puede tener un máximo de 200 caracteres." }, { status:400 });

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyAdminToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

//! Update folder
    const updatedFolder = await FolderModel.findByIdAndUpdate(folderId, { title }, { new:true });
    if(!updatedFolder) return NextResponse.json({ message:"Error updating folder" }, { status:500 });

    return NextResponse.json({ message:"Carpeta actualizada", folder:updatedFolder }, { status:201 });

  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Delete folder
// @route DELETE /api/folders/:id
// @access Owner

export async function DELETE(req:NextRequest) {
  try {
    await connectDB();
    const folderId = req.url.split("/")[5].split("?")[0];
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

//! Delete desk
    const deletedFolder = await FolderModel.findByIdAndDelete(folderId);
    if(!deletedFolder) return NextResponse.json({ message:"Error deleting desk" }, { status:500 });

//! Delete folder data
    const objectId = new Mongoose.Types.ObjectId(folderId);
  //? Tasks
    const deletedTasks = await TaskModel.deleteMany({ folder:objectId });
    if(!deletedTasks.acknowledged) return NextResponse.json({ message:"Error deleting tasks" }, { status:500 });
  //? Accounts
    const accounts = await AccountModel.find({ folder:objectId });
    if (accounts.length) {
      const accountIds = accounts.map((account) => account._id);
      const deletedTransactions = await TransactionModel.deleteMany({ account:{ $in:accountIds } });
      if(!deletedTransactions.acknowledged) return NextResponse.json({ message:"Error deleting transactions" }, { status:500 });
      const deletedAccounts = await AccountModel.deleteMany({ folder:objectId });
      if(!deletedAccounts.acknowledged) return NextResponse.json({ message:"Error deleting accounts" }, { status:500 });
    }
  //? Events
    const deletedEvents = await EventModel.deleteMany({ folder:objectId });
    if(!deletedEvents.acknowledged) return NextResponse.json({ message:"Error deleting events" }, { status:500 });
  //? Goals
    const deletedGoals = await GoalModel.deleteMany({ folder:objectId });
    if(!deletedGoals.acknowledged) return NextResponse.json({ message:"Error deleting goals" }, { status:500 });
  //? Inventories
    const inventories = await InventoryModel.find({ folder:objectId });
    if (inventories.length) {
      const inventoryIds = accounts.map((account) => account._id);
      const deletedItems = await ItemModel.deleteMany({ account:{ $in:inventoryIds } });
      if(!deletedItems.acknowledged) return NextResponse.json({ message:"Error deleting items" }, { status:500 });
      const deletedInventories = await InventoryModel.deleteMany({ folder:objectId });
      if(!deletedInventories.acknowledged) return NextResponse.json({ message:"Error deleting inventory" }, { status:500 });
    };
  //? Reports
    const deletedReports = await  ReportModel.deleteMany({ folder:objectId });
    if(!deletedReports.acknowledged) return NextResponse.json({ message:"Error deleting reports" }, { status:500 });

    return NextResponse.json({ message:"Carpeta eliminada", folder:deletedFolder }, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};