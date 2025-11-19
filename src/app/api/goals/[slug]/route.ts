import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { verifyAdminToken, verifyDeskToken, verifyOwnerToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import GoalModel from "@goals/models/Goal";
import { TypeDesk, TypeObjective, TypeUser } from "@shared/utils/types";

// @desc Get goal by ID
// @route GET /api/goals/:id
// @access Owner, Assigned

export async function GET(req:NextRequest) {
  try {
    await connectDB();
    const goalId = req.url.split("/")[5].split("?")[0];
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

//! Find goal
    const goal = await GoalModel.findById(goalId).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");
    if(!goal) return NextResponse.json({ message:"Goal not found" }, { status:404 });
    if(userToken.role !== "owner" && !goal.assignedTo.find((user:TypeUser) => user._id.toString() === userToken._id.toString())) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

    return NextResponse.json(goal, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Update goal details
// @route PUT /api/goals/:id
// @access Owner, Admin

export async function PUT(req:NextRequest) {
  try {
    await connectDB();
    const goalId = req.url.split("/")[5].split("?")[0];
    const { folder, title, description, priority, deadline, assignedTo, objectives } = await req.json();
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

//! Update Goal
    const goal = await GoalModel.findById(goalId);
    if(!goal) return NextResponse.json({ message:"Goal not found" }, { status:404 });

    goal.folder = folder || goal.folder;
    goal.title = title || goal.title;
    goal.description = description || goal.description;
    goal.priority = priority || goal.priority;
    goal.deadline = deadline || goal.deadline;
    goal.objectives = objectives || goal.objectives;
    if(assignedTo) {
      if(!Array.isArray(assignedTo)) return NextResponse.json({ message:"AssignedTo must be an array of user IDs" }, { status:400 });
      goal.assignedTo = assignedTo;
    };

//! Update progress
    const totalCount = goal.objectives.length;
    const completedCount = goal.objectives.filter((item:TypeObjective) => item.completed).length;
    goal.progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

//! Update status
    if(goal.progress <= 0) goal.status = "Pendiente";
    if(goal.progress > 0) goal.status = "En curso";
    if(goal.progress === 100) goal.status = "Finalizada";

    await goal.save();

    return NextResponse.json({ message:"Meta actualizada" }, { status:201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Delete goal
// @route DELETE /api/goals/:id
// @access Owner

export async function DELETE(req:NextRequest) {
  try {
    await connectDB();
    const goalId = req.url.split("/")[5].split("?")[0];
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

//! Delete Goal
    const goal = await GoalModel.findByIdAndDelete(goalId).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");
    if(!goal) return NextResponse.json({ message:"Goal not found" }, { status:404 });

    return NextResponse.json({ message:"Meta eliminada" }, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};