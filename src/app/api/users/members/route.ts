import { NextResponse } from "next/server";
import { parse } from 'cookie';
import { connectDB } from "@config/db";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import { verifyAdminToken, verifyDeskToken } from "@shared/middlewares/authMiddleware";
import TaskModel from "@tasks/models/Task";
import UserModel from "@users/models/User";

const rolManagement: Record<string, number> = {
  "owner":1,
  "admin":2,
  "user":3,
  "client":4
};

// @desc Get all desk members
// @route GET /api/users/members
// @access Owner, Admin

export async function GET(req:Request) {
  try {
    await connectDB();
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

    let users = await UserModel.find().select("-password");

//! Filter users by desk
    users = users.filter(user => desk.members.some(member => member._id.toString() === user._id.toString()));

//! Sort users by rol
    users = users.sort((a, b) => rolManagement[a.rol] - rolManagement[b.rol]);

    const usersWithTaskCounts = await Promise.all(users.map( async (user) => {
      const pendingTasks = await TaskModel.countDocuments({ assignedTo:user._id, status:"Pendiente" });
      const inProgressTasks = await TaskModel.countDocuments({ assignedTo:user._id, status:"En curso" });
      const completedTasks = await TaskModel.countDocuments({ assignedTo:user._id, status:"Finalizada" });

      return { ...user._doc, pendingTasks, inProgressTasks, completedTasks };
    }));

    return NextResponse.json(usersWithTaskCounts, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  }
};