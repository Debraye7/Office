import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { TypeDesk, TypeTodo, TypeUser } from "@shared/utils/types";
import { verifyAdminToken, verifyDeskToken, verifyOwnerToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import TaskModel from "@tasks/models/Task";

// @desc Get task by ID
// @route GET /api/tasks/:id
// @access Owner, Assigned

export async function GET(req:NextRequest) {
  try {
    await connectDB();
    const taskId = req.url.split("/")[5].split("?")[0];
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

//! Find task
    const task = await TaskModel.findById(taskId).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");
    if(!task) return NextResponse.json({ message:"Task not found" }, { status:404 });
    if(userToken.role !== "owner" && userToken.role !== "admin" && !task.assignedTo.find((user:TypeUser) => user._id.toString() === userToken._id.toString())) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

    return NextResponse.json(task, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Update task details
// @route PUT /api/tasks/:id
// @access Owner, Admin

export async function PUT(req:NextRequest) {
  try {
    await connectDB();
    const taskId = req.url.split("/")[5].split("?")[0];
    const { folder, title, description, priority, dueDate, assignedTo, attachments, todoChecklist } = await req.json();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

//! Validations
    if(!title.trim()) return NextResponse.json({ message:"El título debe tener al menos 1 carácter." }, { status:400 });
    if(title.trim().length > 200) return NextResponse.json({ message:"El título puede tener un máximo de 200 caracteres." }, { status:400 });
    if(description.trim().length > 600) return NextResponse.json({ message:"La descripción puede tener un máximo de 600 caracteres." }, { status:400 });

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyAdminToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

//! Update Task
    const task = await TaskModel.findById(taskId);
    if(!task) return NextResponse.json({ message:"Task not found" }, { status:404 });

//! Update progress
    const totalCount = todoChecklist.length;
    const completedCount = todoChecklist.filter((item:TypeTodo) => item.completed).length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

//! Update status
    let status = task.status;
    if(progress <= 0) status = "Pendiente";
    if(progress > 0) status = "En curso";
    if(progress === 100 && status !== "Aprobada") status = "Finalizada";

    task.progress = progress || task.progress;
    task.status = status || task.status;
    task.folder = folder || task.folder;
    task.title = title || task.title;
    task.description = description || task.description;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.todoChecklist = todoChecklist || task.todoChecklist;
    task.attachments = attachments || task.attachments;
    if(assignedTo) {
      if(!Array.isArray(assignedTo)) return NextResponse.json({ message:"AssignedTo must be an array of user IDs" }, { status:400 });
      task.assignedTo = assignedTo;
    };

    await task.save();

//! Populate task
    const findTask = await TaskModel.findById(taskId).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");
    if(!findTask) return NextResponse.json({ message:"Task not found" }, { status:404 });

    return NextResponse.json({ message:"Tarea actualizada", task:findTask }, { status:201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Delete task
// @route DELETE /api/tasks/:id
// @access Owner

export async function DELETE(req:NextRequest) {
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

//! Delete Task
    const task = await TaskModel.findByIdAndDelete(taskId).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");
    if(!task) return NextResponse.json({ message:"Task not found" }, { status:404 });

    return NextResponse.json({ message:"Task deleted successfully" }, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};