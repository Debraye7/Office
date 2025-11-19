import { TypeDesk, TypeObjective, TypeUser } from "@shared/utils/types";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongoose";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { verifyDeskToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import GoalModel from "@goals/models/Goal";

// @desc Update objectives
// @route PUT /api/goals/:id/objectives
// @access Private

export async function PUT(req:NextRequest) {
  try {
    await connectDB();
    const goalId = req.url.split("/")[5].split("?")[0];
    const { objectives } = await req.json();
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

//! Update Objectives
    const goal = await GoalModel.findById(goalId);
    if(!goal) return NextResponse.json({ message:"Goal not found" }, { status:404 });

    const isAssigned = goal.assignedTo.some((userId:ObjectId) => userId.toString() === userToken._id.toString());
    if(!isAssigned) return NextResponse.json({ message:"No estas asignado" }, { status:403 });

    goal.objectives = objectives || goal.objectives;

//! Update progress
    const totalCount = goal.objectives.length;
    const completedCount = goal.objectives.filter((item:TypeObjective) => item.completed).length;
    goal.progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

//! Update status
    if(goal.progress <= 0) goal.status = "Pendiente";
    if(goal.progress > 0) goal.status = "En curso";
    if(goal.progress === 100) goal.status = "Finalizada";

    await goal.save();

    return NextResponse.json({ message:"Objetivo actualizado" }, { status:201 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};