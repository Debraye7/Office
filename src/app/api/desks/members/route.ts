import { NextResponse } from "next/server";
import { parse } from 'cookie';
import { connectDB } from "@config/db";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import { verifyAdminToken, verifyDeskToken } from "@shared/middlewares/authMiddleware";
import TaskModel from "@tasks/models/Task";
import DeskModel from "@desks/models/Desk";

const roleManagement:Record<string, number> = {
  "owner":1,
  "admin":2,
  "user":3,
  "client":4
};

// @desc Get all desk members
// @route GET /api/desks/members
// @access Owner, Admin

export async function GET(req:Request) {
  try {
    await connectDB();
    const queries = req.url.split("?")[1]?.split("&");
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

    const queryRole = queries.find(item => item.includes("role="))?.split("=")[1];
    const filter = {
      role:queryRole ? decodeURIComponent(queryRole).replace("+", " ") : undefined,
    };

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyAdminToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

//! Sort users by rol
    const { members } = await DeskModel.findById(desk._id).populate("members", "name email profileImageUrl role");
    let users = members.sort((a:{ name:string, email:string, profileImageUrl:string, role:string }, b:{ name:string, email:string, profileImageUrl:string, role:string }) => roleManagement[a.role] - roleManagement[b.role]);

//! Filter tasks
    if(filter.role) users = users.filter((user:{ name:string, email:string, profileImageUrl:string, role:string }) => user.role === filter.role);

    const usersWithTaskCounts = await Promise.all(users.map( async (user:{ _id:string, _doc:{ name:string, email:string, profileImageUrl:string, role:string } }) => {
      const pendingTasks = await TaskModel.countDocuments({ assignedTo:user._id, status:"Pendiente" });
      const inProgressTasks = await TaskModel.countDocuments({ assignedTo:user._id, status:"En curso" });
      const completedTasks = await TaskModel.countDocuments({ assignedTo:user._id, status:"Finalizada" });
      return { ...user._doc, pendingTasks, inProgressTasks, completedTasks };
    }));

    return NextResponse.json({ members:usersWithTaskCounts }, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};