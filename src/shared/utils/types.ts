export interface TypeUser {
  _id:string;
  name:string;
  email:string;
  password?:string;
  profileImageUrl:string;
  role:"owner"|"admin"|"user"|"client";
  pendingTasks?:number,
  inProgressTasks?:number,
  completedTasks?:number
  createdAt?:Date;
  updatedAt?:Date;
  token?:string;
};

export interface TypeSession {
  _id:string,
  checkIn:Date,
  checkOut:Date|null,
  hours:number,
};

export interface TypeAssigned {
  _id:string,
  email?:string;
  name?:string;
  profileImageUrl?:string;
};

export interface TypeDesk {
  _id:string;
  title:string;
  members:TypeAssigned[];
};

export interface TypeFolder {
  _id:string;
  desk:string;
  title:string;
};


export interface TypeCategory {
  _id:string;
  desk:string;
  type:"transaction"|"product"|"movement"|"item";
  icon:number;
  label:string;
};

//! Tasks

export interface TypeTodo {
  _id:string;
  text:string;
  completed?:boolean;
};

export interface TypeAttachment {
  _id:string;
  text:string;
  link:string;
};

export interface TypeTask {
  _id:string;
  desk:string;
  folder:TypeFolder;
  title:string;
  description:string;
  priority:"Baja" | "Media" | "Alta";
  status?:"Pendiente" | "En curso" | "Finalizada" | "Aprobada";
  dueDate?:Date;
  assignedTo:TypeAssigned[];
  createdBy?:string;
  attachments:TypeAttachment[];
  todoChecklist:TypeTodo[];
  progress:number;
  createdAt?:Date;
  updatedAt?:Date;
  completedTodoCount?:number;
};

export interface TypeTasksDashboardData {
  statistics:{
    totalTasks:number;
    pendingTasks:number;
    inProgressTasks:number;
    completedTasks:number;
    overdueTasks:number;
  },
  charts:{
    taskDistribution:Record<string, number>;
    taskPriorityLevels:Record<string, number>;
  };
  recentTasks:TypeTask[];
};

export interface TypeTaskStatusSummary {
  allTasks:number;
  pendingTasks:number;
  inProgressTasks:number;
  completedTasks:number;
  approveTasks:number;
}

//! Accounts

export interface TypeTransactionsStatusSummary {
  pending:number;
  completed:number;
  canceled:number;
};

export type TypeAccounts = "debit" | "credit" | "cash" | "cryptocurrency";

export interface TypeAccount {
  _id:string;
  desk:string;
  folder:TypeFolder;
  assignedTo:TypeAssigned[];
  title:string;
  balance:number;
  type:TypeAccounts,
  transactions?:TypeTransaction[];
  statusSummary?:TypeTransactionsStatusSummary
  createdAt?:Date;
  updatedAt?:Date;
};

export interface TypeTransaction {
  _id:string;
  account:string;
  type:"income"|"expense";
  category:TypeCategory|undefined;
  title:string;
  description:string,
  amount:number;
  date:Date;
  createdBy:TypeAssigned;
  status:"Pendiente"|"Finalizado"|"Cancelado";
};

export type TypeAccountsDashboardData = {
  generalInfo: {
    totalBalance:number;
    totalIncome:number;
    totalExpense:number;
    totalPending:number;
  };
  transactionsAnalysis: {
    recentTransactions:TypeTransaction[];
    categoryDistribution:{ label:string, count:number }[];
  };
  timeAnalysis: {
    monthlyTrends: Array<{ month: string; income: number; expense: number; transactions:number }>;
  };
  insights: {
    transactionsStatuses:{ total:number, pending:number, completed:number, canceled:number };
    topAccounts:{ income:Array<{ _id:string; total:number }>, expense:Array<{ _id:string; total:number }>, balance:Array<{ _id:string; total:number }> };
  };
};

//! Inventory

export interface TypeItem {
  _id:string;
  inventory:string;
  title:string;
  description?:string;
  category:TypeCategory|undefined;
  stock:number;
  price:number;
};

export interface TypeInventory {
  _id:string;
  desk:string;
  folder:TypeFolder;
  title:string;
  location?:string;
  assignedTo:TypeAssigned[];
  items?:TypeItem[],
  quantity?:number;
};

//! Products

export interface TypeProduct {
  _id:string;
  desk:string;
  title:string;
  description?:string;
  category:TypeCategory|undefined;
  price:number;
  stock:number;
  imageUrl:string;
  movements?:TypeMovement[];
};

export interface TypeMovement {
  _id:string;
  product:string;
  category:TypeCategory|undefined;
  type:"outflow"|"inflow";
  title:string;
  description:string;
  quantity:number;
  date:Date;
  createdBy:TypeAssigned;
  status:"Pendiente"|"Finalizado"|"Cancelado";
};

//! Punto de venta

//! Calendar

export type TypeRecurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type TypeAssignedStatus = "pending" | "accepted" | "declined";

export interface TypeEvent {
  _id:string;
  desk:string;
  folder:TypeFolder;
  title: string;
  description?: string;
  assignedTo: { assigned:TypeAssigned, status:TypeAssignedStatus }[];
  allDay?: boolean;
  start: Date;
  end: Date;
  recurrence?: TypeRecurrence;
  recurrenceEnd?: Date;
  createdBy: TypeAssigned;
  isRecurringInstance?: boolean;
  originalEventId?:string;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface TypeEventsDashboardData {
  totalEvents: number;
  eventsByHour:{ label:string; count:number; }[];
  eventsByFolder:{ label:string; count:number; }[];
  recurrence:{
    eventsToday:TypeEvent[];
    eventsByMonth:{ label:string; count:number; }[];
    recurrenceStats:{ label:string; count:number; }[];
  }
};

//! Reports

export interface TypeReport {
  _id:string;
  desk:string;
  folder:TypeFolder;
  createdBy:TypeAssigned;
  title:string;
  description?:string;
  date:Date;
  createdAt?:Date;
  updatedAt?:Date;
};


//! Goals

export interface TypeObjective {
  _id:string
  text:string;
  dueDate?:Date;
  deadline?:Date;
  completed?:boolean;
};

export interface TypeGoal {
  _id:string;
  desk:string;
  folder:TypeFolder;
  title:string;
  description:string;
  priority:"Baja" | "Media" | "Alta";
  status?:"Pendiente" | "En curso" | "Finalizada";
  dueDate?:Date;
  assignedTo:TypeAssigned[];
  createdBy?:string;
  objectives:TypeObjective[];
  progress:number;
  createdAt?:Date;
  updatedAt?:Date;
};

export interface TypeGoalStatusSummary {
  all:number;
  pending:number;
  inProgress:number;
  completed:number;
}

export interface TypeOption { 
  label:string;
  value:string; 
}