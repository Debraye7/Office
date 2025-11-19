import { NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { verifyAdminToken, verifyDeskToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import AccountModel from "@accounts/models/Account";
import TransactionModel from "@transactions/models/Transaction";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import { Money } from "@/src/shared/hooks/decimals";

// @desc Get all accounts
// @route GET /api/accounts
// @access Owner:all, Admin|User|client:only assigned accounts

export async function GET(req:Request) {
  try {
    await connectDB();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

    const queries = req.url.split("?")[1]?.split("&");
    const queryFolder = queries && queries.find(item => item.includes("folder="))?.split("=")[1];
    const filter = {
      folder:queryFolder ? decodeURIComponent(queryFolder).replace("+", " ") : undefined,
    };

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyUserToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

//! All accounts
    let accounts = [];
    if(userToken.role === "owner") accounts = await AccountModel.find({ desk:desk._id }).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");
    if(userToken.role === "admin" || userToken.role === "user" || userToken.role === "client") accounts = await AccountModel.find({ desk:desk._id, assignedTo:userToken._id }).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");

//! Filter accounts
    if(filter.folder) accounts = accounts.filter(account => account.folder._id.toString() === filter.folder);

//! Status summary counts
    accounts = await Promise.all(accounts.map(async (account) => {
      const statusSummary = {
        pending:await TransactionModel.countDocuments({ status:"Pendiente", account:account._id }),
        completed:await TransactionModel.countDocuments({ status:"Finalizado", account:account._id }),
        canceled:await TransactionModel.countDocuments({ status:"Cancelado", account:account._id }),
      }
      account.balance = Money.fromCents(account.balance).toDecimal();
      return { ...account._doc, statusSummary };
    }));

    return NextResponse.json(accounts, { status:200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Create a new account
// @route POST /api/accounts
// @access Owner, Admin

export async function POST(req:Request) {
  try {
    await connectDB();
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

    const newAccount = await AccountModel.create({
      desk:desk._id,
      folder,
      title:title.trim(),
      type,
      assignedTo,
    });
    if(!newAccount) return NextResponse.json({ message:"Create account error"}, { status:500 });

    const account = await AccountModel.findById(newAccount._id).populate("assignedTo", "name email profileImageUrl").populate("folder", "title");
    if(!account) return NextResponse.json({ message:"Account not found"}, { status:404 });

    return NextResponse.json({ message:"Cuenta creada", account }, { status:201 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};