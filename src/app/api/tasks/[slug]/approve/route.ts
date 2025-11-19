import { connectDB } from "@config/db";
import { verifyDeskToken, verifyOwnerToken } from "@shared/middlewares/authMiddleware";
import TaskModel from "@tasks/models/Task";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import { parse } from "cookie";
import { ObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// @desc Approve Task
// @route PATCH /api/tasks/:id/approve
// @access Private

export async function PATCH(req:NextRequest) {
  try {
    await connectDB();
    const taskId = req.url.split("/")[5].split("?")[0];
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

//! Find task
    const task = await TaskModel.findById(taskId);
    if(!task) return NextResponse.json({ message:"Task not found" }, { status:404 });

//! Validate assigned or role
    const isAssigned = task.assignedTo.some((userId:ObjectId) => userId.toString() === userToken._id.toString());
    if(userToken.role !== "owner" && userToken.role !== "admin" && !isAssigned) return NextResponse.json({ message:"Not authorized to update checklist" }, { status:403 });

//! Validate progress
    if(task.progress !== 100) return NextResponse.json({ message:"La tarea aun no esta completa" }, { status:400 });

//! Update status
    task.status = "Aprobada";

    await task.save();

    return NextResponse.json({ message:"Tarea aprobada" }, { status:200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};