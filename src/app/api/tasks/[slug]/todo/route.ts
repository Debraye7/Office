import { connectDB } from "@config/db";
import { verifyDeskToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import TaskModel from "@tasks/models/Task";
import { TypeDesk, TypeTodo, TypeUser } from "@shared/utils/types";
import { parse } from "cookie";
import { ObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// @desc Update task checklist
// @route PUT /api/tasks/:id/todo
// @access Private

export async function PUT(req:NextRequest) {
  try {
    await connectDB();
    const taskId = req.url.split("/")[5].split("?")[0];
    const { todoChecklist } = await req.json();
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

//! Update Todos
    const task = await TaskModel.findById(taskId);
    if(!task) return NextResponse.json({ message:"Task not found" }, { status:404 });

    const isAssigned = task.assignedTo.some((userId:ObjectId) => userId.toString() === userToken._id.toString());
    if(userToken.role !== "owner" && userToken.role !== "admin" && !isAssigned) return NextResponse.json({ message:"Not authorized to update checklist" }, { status:403 });

    task.todoChecklist = todoChecklist || task.todoChecklist;

//! Update progress
    const totalCount = task.todoChecklist.length;
    const completedCount = task.todoChecklist.filter((item:TypeTodo) => item.completed).length;
    task.progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

//! Update status
    if(task.progress <= 0) task.status = "Pendiente";
    if(task.progress > 0) task.status = "En curso";
    if(task.progress === 100) task.status = "Finalizada";

    await task.save();
    const updatedTask = await TaskModel.findById(taskId);
    if(!updatedTask) return NextResponse.json({ message:"Task not found" }, { status:404 });

    return NextResponse.json({ message:"Subtarea actualizada" }, { status:201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};