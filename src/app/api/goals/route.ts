import { NextResponse } from "next/server";
import { compareAsc, compareDesc } from "date-fns";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { verifyAdminToken, verifyDeskToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import GoalModel from "@goals/models/Goal";
import { TypeDesk, TypeGoalStatusSummary, TypeObjective, TypeUser } from "@shared/utils/types";

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

// @desc Get all goals
// @route GET /api/goals
// @access Owner|Admin:all, User|Client:only assigned

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

//! All Goals
    let goals = [];
    if(userToken.role === "owner") goals = await GoalModel.find({ desk:desk._id }).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");
    if(userToken.role === "admin" || userToken.role === "user" || userToken.role === "client") goals = await GoalModel.find({ desk:desk._id, assignedTo:userToken._id }).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");

//! Filter tasks
    if(filter.status) goals = goals.filter(goal => goal.status === filter.status);
    if(filter.priority) goals = goals.filter(goal => goal.priority === filter.priority);
    if(filter.folder) goals = goals.filter(goal => goal.folder._id.toString() === filter.folder);

//! Sort tasks
    if(sort === "Fecha Final (asc)") goals = goals.sort((a, b) => compareAsc(a.dueDate, b.dueDate));
    if(sort === "Fecha Final (desc)") goals = goals.sort((a, b) => compareDesc(a.dueDate, b.dueDate));
    if(sort === "Fecha Inicial (asc)") goals = goals.sort((a, b) => compareAsc(a.createdAt, b.createdAt));
    if(sort === "Fecha Inicial (desc)") goals = goals.sort((a, b) => compareDesc(a.createdAt, b.createdAt));
    if(sort === "Estado (asc)") goals = goals.sort((a, b) => statusManagement[a.status] - statusManagement[b.status]);
    if(sort === "Estado (desc)") goals = goals.sort((a, b) => statusManagement[b.status] - statusManagement[a.status]);
    if(sort === "Prioridad (asc)") goals = goals.sort((a, b) => priorityManagement[a.priority] - priorityManagement[b.priority]);
    if(sort === "Prioridad (desc)") goals = goals.sort((a, b) => priorityManagement[b.priority] - priorityManagement[a.priority]);
    if(sort === "Pendientes (asc)") goals = goals.sort((a, b) => a.objectives.filter((obj:TypeObjective) => !obj.completed).length - b.objectives.filter((obj:TypeObjective) => !obj.completed).length);
    if(sort === "Pendientes (desc)") goals = goals.sort((a, b) => b.objectives.filter((obj:TypeObjective) => !obj.completed).length - a.objectives.filter((obj:TypeObjective) => !obj.completed).length);
    if(sort === "Título (asc)") goals = goals.sort((a, b) => a.title.localeCompare(b.title));
    if(sort === "Título (desc)") goals = goals.sort((a, b) => b.title.localeCompare(a.title));

//! Status summary counts
    const all = await GoalModel.countDocuments(userToken.role === "owner" ? { desk:desk._id } : { desk:desk._id, assignedTo:userToken._id });
    const pending = await GoalModel.countDocuments({ status:"Pendiente", desk:desk._id, ...(userToken.role !== "owner" && { assignedTo: userToken._id }) });
    const inProgress = await GoalModel.countDocuments({ status:"En curso", desk:desk._id, ...(userToken.role !== "owner" && { assignedTo: userToken._id }) });
    const completed = await GoalModel.countDocuments({ status:"Finalizada", desk:desk._id, ...(userToken.role !== "owner" && { assignedTo: userToken._id }) });
    const statusSummary:TypeGoalStatusSummary = { all, pending, inProgress, completed };

    return NextResponse.json({ goals, statusSummary }, { status:200 });

  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Create a new goal
// @route POST /api/goals
// @access Owner, Admin

export async function POST(req:Request) {
  try {
    await connectDB();
    const { folder, title, description, priority, dueDate, assignedTo, objectives } = await req.json();
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

    const newGoal = await GoalModel.create({
      desk:desk._id,
      folder,
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      createdBy:userToken._id,
      objectives
    });
    if(!newGoal) return NextResponse.json({ message:"Create goal error"}, { status:500 });

    return NextResponse.json({ message:"Meta creada" }, { status:201 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};