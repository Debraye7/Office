import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { TypeDesk, TypeTransaction, TypeUser } from "@shared/utils/types";
import { verifyAdminToken, verifyDeskToken, verifyOwnerToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import AccountModel from "@accounts/models/Account";
import TransactionModel from "@transactions/models/Transaction";
import { compareAsc, compareDesc } from "date-fns";
import { Money } from "@/src/shared/hooks/decimals";

const statusManagement: Record<string, number> = {
  "Pendiente": 1,
  "Finalizado": 2,
  "Cancelado": 3,
};

// @desc Get account by ID
// @route GET /api/accounts/:id
// @access Owner, Assigned

export async function GET(req:NextRequest) {
  try {
    await connectDB();
    const accountId = req.url.split("/")[5].split("?")[0];
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

    const queries = req.url.split("?")[1]?.split("&");
    const queryStatus = queries.find(item => item.includes("status="))?.split("=")[1];
    const queryType = queries.find(item => item.includes("type="))?.split("=")[1];
    const queryCategory = queries.find(item => item.includes("category="))?.split("=")[1];
    const filter = {
      status:queryStatus ? decodeURIComponent(queryStatus).replace("+", " ") : undefined,
      type:queryType ? decodeURIComponent(queryType).replace("+", " ") : undefined,
      category:queryCategory ? decodeURIComponent(queryCategory).replace("+", " ") : undefined,
    };
    const querySort = queries.find(item => item.includes("sort="))?.split("=")[1];
    const sort =  querySort ? decodeURIComponent(querySort).replace(/\+/g, " ") : "Fecha (desc)";

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyUserToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

    const account = await AccountModel.findById(accountId).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");
    if(!account) return NextResponse.json({ message:"Task not found" }, { status:404 });
    if(userToken.role !== "owner" && !account.assignedTo.find((user:TypeUser) => user._id.toString() === userToken._id.toString())) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

    let transactions = await TransactionModel.find({ account:accountId }).populate("createdBy", "name email profileImageUrl").populate("category");
    if(!transactions) return NextResponse.json({ message:"Task not found" }, { status:404 });

//! Filter transactions
    if(filter.status) transactions = transactions.filter(transaction => transaction.status === filter.status);
    if(filter.type) transactions = transactions.filter(transaction => transaction.type === filter.type);
    if(filter.category) transactions = transactions.filter(transaction => filter.category !== "null" ? transaction.category?._id.toString() === filter.category : transaction.category === undefined);

//! Sort transactions
    if(sort === "Fecha (desc)") transactions = transactions.sort((a, b) => compareDesc(a.date, b.date));
    if(sort === "Fecha (asc)") transactions = transactions.sort((a, b) => compareAsc(a.date, b.date));
    if(sort === "Estado (asc)") transactions = transactions.sort((a, b) => statusManagement[b.status] - statusManagement[a.status]);
    if(sort === "Estado (desc)") transactions = transactions.sort((a, b) => statusManagement[a.status] - statusManagement[b.status]);
    if(sort === "Título (asc)") transactions = transactions.sort((a, b) => a.title.localeCompare(b.title));
    if(sort === "Título (desc)") transactions = transactions.sort((a, b) => b.title.localeCompare(a.title));

//! Formatting amounts and balance from cents to decimal
    transactions = await Promise.all(transactions.map(async (transaction) => {
      transaction.amount = Money.fromCents(transaction.amount).toDecimal();
      return { ...transaction._doc };
    }));
    account.balance = Money.fromCents(account.balance).toDecimal();

    
//! Status summary count
    const statusSummary = {
      canceled:0,
      pending:0,
      completed:0,
    };
    await Promise.all(transactions.map(async (transaction:TypeTransaction) => {
      if(transaction.status === "Cancelado") statusSummary.canceled = statusSummary.canceled + (transaction.type === "income" ? transaction.amount : -transaction.amount);
      if(transaction.status === "Pendiente") statusSummary.pending = statusSummary.pending + (transaction.type === "income" ? transaction.amount : -transaction.amount);
      if(transaction.status === "Finalizado") statusSummary.completed = statusSummary.completed + (transaction.type === "income" ? transaction.amount : -transaction.amount);
    }));

    return NextResponse.json({ ...account._doc, statusSummary, transactions }, { status:200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Update account details
// @route PUT /api/accounts/:id
// @access Owner, Admin

export async function PUT(req:NextRequest) {
  try {
    await connectDB();
    const accountId = req.url.split("/")[5].split("?")[0];
    const { folder, title, type, assignedTo } = await req.json();
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
    if(!title.trim()) return NextResponse.json({ message:"El título debe tener al menos 1 carácter." }, { status:400 });
    if(title.trim().length > 200) return NextResponse.json({ message:"El título puede tener un máximo de 200 caracteres." }, { status:400 });
    if(!type) return NextResponse.json({ message:"Selecciona un tipo de cuenta" }, { status:400 });
    if(!folder) return NextResponse.json({ message:"Selecciona una carpeta" }, { status:400 });
    if(!Array.isArray(assignedTo)) return NextResponse.json({ message:"AssignedTo must be an array of users IDs" }, { status:400 });

//! Update Account
    const newAccount = await AccountModel.findById(accountId);
    if(!newAccount) return NextResponse.json({ message:"Account not found" }, { status:404 });

    newAccount.folder = folder || newAccount.folder;
    newAccount.title = title || newAccount.title;
    newAccount.type = type || newAccount.type;
    newAccount.assignedTo = assignedTo;

    await newAccount.save();

//! Populate task
    const account = await AccountModel.findById(accountId).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");
    if(!account) return NextResponse.json({ message:"Account not found" }, { status:404 });

    return NextResponse.json({ message:"Cuenta actualizada" }, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Delete account
// @route DELETE /api/accounts/:id
// @access Private Owner

export async function DELETE(req:NextRequest) {
  try {
    await connectDB();
    const accountId = req.url.split("/")[5].split("?")[0];
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

//! Delete Account
    const account = await AccountModel.findByIdAndDelete(accountId);
    if(!account) return NextResponse.json({ message:"Account not found" }, { status:404 });

  //? Delete Transactions
    const deletedTransactions = await TransactionModel.deleteMany({ account:account._id });
    if(!deletedTransactions.acknowledged) return NextResponse.json({ message:"Error deleting transactions" }, { status:500 });

    return NextResponse.json({ message:"Cuenta eliminada" }, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};