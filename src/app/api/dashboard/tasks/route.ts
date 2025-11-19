import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongoose";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { verifyDeskToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import TaskModel from "@tasks/models/Task";
import { ROLES_DATA } from "@shared/utils/data";
import { TypeDesk, TypeUser } from "@shared/utils/types";

interface TypeDeskObjectId extends Omit<TypeDesk, "_id"> {
  _id:ObjectId;
};

interface TaskAggregationResult {
  _id: string; // Represents the status or priority of the task
  count: number; // Number of tasks with this status or priority
};

const getDashboardData = async (user:TypeUser, deskId:ObjectId) => {
  // const deskId = new Mongoose.Types.ObjectId(deskIdString);

  let totalTasks = 0;
  let pendingTasks = 0;
  let inProgressTasks = 0;
  let completedTasks = 0;
  let overdueTasks = 0;

  const taskStatuses = ["Pendiente", "En curso", "Finalizada"];
  let taskDistributionRaw:TaskAggregationResult[];
  const taskPriorities = ["Baja", "Media", "Alta"];
  let taskPriorityLevelsRaw:TaskAggregationResult[];

  let recentTasks;

  if(user.role === "owner") {
//! Fetch Admin statistics
    totalTasks = await TaskModel.countDocuments({ desk:deskId });
    pendingTasks = await TaskModel.countDocuments({ desk:deskId, status:"Pendiente" });
    inProgressTasks = await TaskModel.countDocuments({ desk:deskId, status:"En curso" });
    completedTasks = await TaskModel.countDocuments({ desk:deskId, status:"Finalizada" });
    overdueTasks = await TaskModel.countDocuments({
      desk:deskId,
      status:{ $ne:"Finalizada" },
      dueDate:{ $lt: new Date() },
    });
//! Ensure all possible statuses are included
    taskDistributionRaw = await TaskModel.aggregate([
      {
        $match:{  desk:deskId },
      },
      {
        $group:{
          _id:"$status",
          count:{ $sum:1 },
        }
      }
    ]);

//! Ensure all priority levels are included
    taskPriorityLevelsRaw = await TaskModel.aggregate([
      {
        $match:{  desk:deskId },
      },
      {
        $group:{
          _id:"$priority",
          count:{ $sum:1 },
        },
      },
    ]);

//! Fetch recent 10 tasks
    recentTasks = await TaskModel.find({ desk:deskId }).sort({ createdAt:-1 }).limit(10).select("title status priority dueDate createdAt");

  } else if(ROLES_DATA.find((role) => role.value === user.role)) {
//! Fetch statistics for user-specific tasks
    totalTasks = await TaskModel.countDocuments({ desk:deskId, assignedTo:user._id });
    pendingTasks = await TaskModel.countDocuments({ desk:deskId, assignedTo:user._id, status:"Pendiente" });
    inProgressTasks = await TaskModel.countDocuments({ desk:deskId, assignedTo:user._id, status:"En curso" });
    completedTasks = await TaskModel.countDocuments({ desk:deskId, assignedTo:user._id, status:"Finalizada" });
    overdueTasks = await TaskModel.countDocuments({
      desk:deskId,
      assignedTo:user._id,
      status:{ $ne:"Finalizada" },
      dueDate:{ $lt: new Date() },
    });

//! Ensure all possible statuses are included
    taskDistributionRaw = await TaskModel.aggregate([
      {
        $match:{  desk:deskId, assignedTo:user._id },
      },
      {
        $group:{
          _id:"$status",
          count:{ $sum:1 },
        }
      }
    ]);

//! Ensure all priority levels are included
    taskPriorityLevelsRaw = await TaskModel.aggregate([
      {
        $match:{ desk:deskId, assignedTo:user._id },
      },
      {
        $group:{
          _id:"$priority",
          count:{ $sum:1 },
        },
      },
    ]);
//! Fetch recent 10 tasks
    recentTasks = await TaskModel.find({ desk:deskId, assignedTo:user._id }).sort({ createdAt:-1 }).limit(10).select("title status priority dueDate createdAt");
  };

//? Ensure all possible statuses are included
  const taskDistribution = taskStatuses.reduce<Record<string, number>>((acc, status) => {
    const formattedKey = status.replace(/\s+/g, ""); // Remove spaces for response keys
    acc[formattedKey] = taskDistributionRaw.find((item) => item._id === status)?.count || 0;
    return acc;
  }, {} as Record<string, number>);
  taskDistribution["All"] = totalTasks; // Add total count to taskDistribution

//? Ensure all priority levels are included
  const taskPriorityLevels = taskPriorities.reduce<Record<string, number>>((acc, priority) => {
    acc[priority] = taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
    return acc;
  }, {} as Record<string, number>);

  return { 
    statistics:{
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
    },
    charts:{
      taskDistribution,
      taskPriorityLevels,
    },
    recentTasks,
  };
};

// @desc Dashboard Data
// @route GET /api/dashboard/tasks
// @access Private (token)

export async function GET(req:NextRequest) {
  try {
    await connectDB();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyUserToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDeskObjectId|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

    const res = await getDashboardData(userToken, desk._id);

    return NextResponse.json(res, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};