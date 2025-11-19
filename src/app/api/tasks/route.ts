import { NextResponse } from "next/server";
import { parse } from "cookie";
import { compareAsc, compareDesc } from "date-fns";
import { connectDB } from "@config/db";
import { verifyAdminToken, verifyDeskToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import TaskModel from "@tasks/models/Task";
import { TypeDesk, TypeTaskStatusSummary, TypeTodo, TypeUser } from "@shared/utils/types";

const statusManagement: Record<string, number> = {
  "Pendiente":1,
  "En curso":2,
  "Finalizada":3
};

const priorityManagement: Record<string, number> = {
  "Baja":1,
  "Media":2,
  "Alta":3
};

// @desc Get all tasks
// @route GET /api/tasks/
// @access Owner|Admin:all, User|Client:only assigned tasks

export async function GET(req:Request) {
  try {
    await connectDB();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

    const queries = req.url.split("?")[1]?.split("&");
    const queryStatus = queries.find(item => item.includes("status="))?.split("=")[1];
    const queryPriority = queries.find(item => item.includes("priority="))?.split("=")[1];
    const queryFolder = queries.find(item => item.includes("folder="))?.split("=")[1];
    const filter = {
      status:queryStatus ? decodeURIComponent(queryStatus).replace("+", " ") : undefined,
      priority:queryPriority ? decodeURIComponent(queryPriority).replace("+", " ") : undefined,
      folder:queryFolder ? decodeURIComponent(queryFolder).replace("+", " ") : undefined,
    };

    const querySort = queries.find(item => item.includes("sort="))?.split("=")[1];
    const sort =  querySort ? decodeURIComponent(querySort).replace(/\+/g, " ") : "Fecha Final (asc)";

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyUserToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

//! All tasks
    let tasks = [];
    if(userToken.role === "owner" || userToken.role === "admin") tasks = await TaskModel.find({ desk:desk._id }).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");
    if(userToken.role === "user" || userToken.role === "client") tasks = await TaskModel.find({ desk:desk._id, assignedTo:userToken._id }).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");

//! Filter tasks
    if(filter.status) tasks = tasks.filter(task => task.status === filter.status);
    if(filter.priority) tasks = tasks.filter(task => task.priority === filter.priority);
    if(filter.folder) tasks = tasks.filter(task => task.folder._id.toString() === filter.folder);

//! Sort tasks
    if(sort === "Fecha Final (asc)") tasks = tasks.sort((a, b) => compareAsc(a.dueDate, b.dueDate));
    if(sort === "Fecha Final (desc)") tasks = tasks.sort((a, b) => compareDesc(a.dueDate, b.dueDate));
    if(sort === "Fecha Inicial (asc)") tasks = tasks.sort((a, b) => compareAsc(a.createdAt, b.createdAt));
    if(sort === "Fecha Inicial (desc)") tasks = tasks.sort((a, b) => compareDesc(a.createdAt, b.createdAt));
    if(sort === "Estado (asc)") tasks = tasks.sort((a, b) => statusManagement[a.status] - statusManagement[b.status]);
    if(sort === "Estado (desc)") tasks = tasks.sort((a, b) => statusManagement[b.status] - statusManagement[a.status]);
    if(sort === "Prioridad (asc)") tasks = tasks.sort((a, b) => priorityManagement[a.priority] - priorityManagement[b.priority]);
    if(sort === "Prioridad (desc)") tasks = tasks.sort((a, b) => priorityManagement[b.priority] - priorityManagement[a.priority]);
    if(sort === "Pendientes (asc)") tasks = tasks.sort((a, b) => a.todoChecklist.filter((todo:TypeTodo) => !todo.completed).length - b.todoChecklist.filter((todo:TypeTodo) => !todo.completed).length);
    if(sort === "Pendientes (desc)") tasks = tasks.sort((a, b) => b.todoChecklist.filter((todo:TypeTodo) => !todo.completed).length - a.todoChecklist.filter((todo:TypeTodo) => !todo.completed).length);
    if(sort === "Título (asc)") tasks = tasks.sort((a, b) => a.title.localeCompare(b.title));
    if(sort === "Título (desc)") tasks = tasks.sort((a, b) => b.title.localeCompare(a.title));

//! Add completed todo checklist count to each task
    tasks = await Promise.all(tasks.map(async (task) => {
      const completedTodoCount = task.todoChecklist.filter((item:TypeTodo) => item.completed).length;
      return { ...task._doc, completedTodoCount };
    }));

//! Status summary counts
    const  allTasks = await TaskModel.countDocuments(userToken.role === "owner" || userToken.role === "admin" ? { desk:desk._id } : { desk:desk._id, assignedTo:userToken._id });
    const pendingTasks = await TaskModel.countDocuments({ status:"Pendiente", desk:desk._id, ...(userToken.role !== "owner" && userToken.role !== "admin" && { assignedTo: userToken._id }) });
    const inProgressTasks = await TaskModel.countDocuments({ status:"En curso", desk:desk._id, ...(userToken.role !== "owner" && userToken.role !== "admin" && { assignedTo: userToken._id }) });
    const completedTasks = await TaskModel.countDocuments({ status:"Finalizada", desk:desk._id, ...(userToken.role !== "owner" && userToken.role !== "admin" && { assignedTo: userToken._id }) });
    const approveTasks = await TaskModel.countDocuments({ status:"Aprobada", desk:desk._id, ...(userToken.role !== "owner" && userToken.role !== "admin" && { assignedTo: userToken._id }) });
    const statusSummary:TypeTaskStatusSummary = { allTasks, pendingTasks, inProgressTasks, completedTasks, approveTasks };

    return NextResponse.json({ tasks, statusSummary }, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Create a new task
// @route POST /api/tasks/
// @access Owner, Admin

export async function POST(req:Request) {
  try {
    await connectDB();
    const { folder, title, description, priority, dueDate, assignedTo, attachments, todoChecklist } = await req.json();
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
    if(!Array.isArray(assignedTo)) return NextResponse.json({ message:"AssignedTo must be an array of users IDs" }, { status:400 });

    const newTask = await TaskModel.create({
      desk:desk._id,
      folder,
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      createdBy:userToken._id,
      attachments,
      todoChecklist
    });
    if(!newTask) return NextResponse.json({ message:"Create task error"}, { status:500 });

    const task = await TaskModel.findById(newTask._id).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");
    if(!task) return NextResponse.json({ message:"Task not found"}, { status:404 });

    const completedTodoCount = task.todoChecklist.filter((item:TypeTodo) => item.completed).length;

    return NextResponse.json({ message:"Tarea creada", task:{ ...task._doc, completedTodoCount } }, { status:201 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};