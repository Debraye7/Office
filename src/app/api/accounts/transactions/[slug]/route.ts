import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { verifyAdminToken, verifyDeskToken, verifyOwnerToken } from "@shared/middlewares/authMiddleware";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import AccountModel from "@accounts/models/Account";
import TransactionModel from "@transactions/models/Transaction";
import { Money } from "@/src/shared/hooks/decimals";

const STATUSES = [
  "Pendiente",
  "Finalizado",
  "Cancelado"
];

// @desc Update transaction details
// @route PUT /api/accounts/transactions/:id
// @access Owner, Admin

export async function PUT(req:NextRequest) {
  try {
    await connectDB();
    const transactionId = req.url.split("/")[6].split("?")[0];
    const { category, title, description, amount, date, status } = await req.json();
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
    if(!transactionId) return NextResponse.json({ message:"Missing account" }, { status:400 });
    if(!category) return NextResponse.json({ message:"Missing category" }, { status:400 });
    if(!title.trim()) return NextResponse.json({ message:"El título debe tener al menos 1 carácter." }, { status:400 });
    if(title.trim().length > 200) return NextResponse.json({ message:"El título puede tener un máximo de 200 caracteres." }, { status:400 });
    if(description.trim().length > 600) return NextResponse.json({ message:"La descripción puede tener un máximo de 600 caracteres." }, { status:400 });
    if(!amount) return NextResponse.json({ message:"Missing amount" }, { status:400 });
    if(!status || !STATUSES.includes(status)) return NextResponse.json({ message:"Missing status" }, { status:400 });

//! Get current Transaction
    const currentTransaction = await TransactionModel.findById(transactionId).populate("createdBy", "name email profileImageUrl");
    if(!currentTransaction) return NextResponse.json({ message:"Transaction not found" }, { status:404 });

//! Update Account balance
  //? Convertir a Money
    const money = Money.fromDecimal(amount);
    const amountInCents = money.toCents();

    if(currentTransaction.status !== "Finalizado" && status === "Finalizado") {
      const updatedAccount = await AccountModel.findByIdAndUpdate(currentTransaction.account, { $inc:{ balance:currentTransaction.type === "income" ? amountInCents : -amountInCents }, }, { new:true }).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");
      if(!updatedAccount) return NextResponse.json({ message:"Account not found"}, { status:404 });
    } else if(currentTransaction.status === "Finalizado" && status !== "Finalizado") {
      const updatedAccount = await AccountModel.findByIdAndUpdate(currentTransaction.account, { $inc:{ balance:currentTransaction.type === "income" ? -currentTransaction.amount : currentTransaction.amount }, }, { new:true });
      if(!updatedAccount) return NextResponse.json({ message:"Account not found"}, { status:404 });
    } else if(currentTransaction.status === "Finalizado" && status === "Finalizado") {
      let updatedAccount = await AccountModel.findByIdAndUpdate(currentTransaction.account, { $inc:{ balance:currentTransaction.type === "income" ? -currentTransaction.amount : currentTransaction.amount }, }, { new:true });
      if(!updatedAccount) return NextResponse.json({ message:"Account not found"}, { status:404 });
      updatedAccount = await AccountModel.findByIdAndUpdate(currentTransaction.account, { $inc:{ balance:currentTransaction.type === "income" ? amountInCents : -amountInCents }, }, { new:true });
      if(!updatedAccount) return NextResponse.json({ message:"Account not found"}, { status:404 });
    };

//! Update Transaction
    const transaction = currentTransaction;
    transaction.title = title || currentTransaction.title;
    transaction.description = description || currentTransaction.description;
    transaction.category = category || currentTransaction.category;
    transaction.amount = amountInCents || currentTransaction.amount;
    transaction.date = date || currentTransaction.date;
    transaction.status = status || currentTransaction.status;
    await transaction.save();

    return NextResponse.json({ message:"Transacción actualizada" }, { status:201 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Delete transaction
// @route DELETE /api/accounts/transactions/:id
// @access Owner

export async function DELETE(req:NextRequest) {
  try {
    await connectDB();
    const transactionId = req.url.split("/")[6].split("?")[0];
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

//! Validations
    if(!transactionId) return NextResponse.json({ message:"Missing account" }, { status:400 });

//! Delete transaction
    const transaction = await TransactionModel.findByIdAndDelete(transactionId);
    if(!transaction) return NextResponse.json({ message:"Transaction not found" }, { status:404 });

//! Update account
    if(transaction.status === "Finalizado") {
      const updatedAccount = await AccountModel.findByIdAndUpdate(transaction.account, { $inc:{ balance:transaction.type === "income" ? -transaction.amount : transaction.amount }, });
      if(!updatedAccount) return NextResponse.json({ message:"Account not found"}, { status:404 });
    };

    return NextResponse.json({ message:"Transacción eliminada", transaction }, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};