import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { verifyDeskToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import TransactionModel from "@transactions/models/Transaction";
import AccountModel from "@accounts/models/Account";
import { TypeAccount, TypeAccountsDashboardData, TypeDesk, TypeTransaction, TypeUser } from "@shared/utils/types";
import CategoryModel from "@categories/models/Category";
import { Money } from "@/src/shared/hooks/decimals";

const CURRENT_YEAR = new Date().getFullYear();
const EMPTY:TypeAccountsDashboardData = {
  generalInfo: { totalBalance:0, totalIncome:0, totalExpense:0, totalPending:0 },
  transactionsAnalysis: {
    recentTransactions:[],
    categoryDistribution:[],
  },
  timeAnalysis: {
    monthlyTrends:[],
  },
  insights:{
    transactionsStatuses:{ total:0, pending:0, completed:0, canceled:0 },
    topAccounts:{
      income:[],
      expense:[],
      balance:[],
    },
  },
};

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
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

    // 🔹 Filtrar cuentas que pertenecen a ese desk
    let accounts:TypeAccount[] = [];
    if(userToken.role === "owner") accounts = await AccountModel.find({ desk:desk._id });
    if(userToken.role === "admin" || userToken.role === "user" || userToken.role === "client") accounts = await AccountModel.find({ desk:desk._id, assignedTo:userToken._id });
    if(!accounts.length) return NextResponse.json({ accounts, dashboard:EMPTY }, { status:200 });

    const accountIds = accounts.map((account) => account._id);

    // 🔹 Información General (Filtrada por las cuentas de ese desk)
    const [incomeResult, expenseResult] = await Promise.all([
      TransactionModel.aggregate([{ $match: { account: { $in: accountIds }, type: "income", status:"Finalizado" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      TransactionModel.aggregate([{ $match: { account: { $in: accountIds }, type: "expense", status:"Finalizado" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);
    const [incomePending, expensePending] = await Promise.all([
      TransactionModel.aggregate([{ $match: { account: { $in: accountIds }, type: "income", status:"Pendiente" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      TransactionModel.aggregate([{ $match: { account: { $in: accountIds }, type: "expense", status:"Pendiente" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);

    const totalIncome = Money.fromCents(incomeResult[0]?.total || 0).toDecimal();
    const totalExpense = Money.fromCents(expenseResult[0]?.total || 0).toDecimal();
    const totalBalance = Money.fromDecimal(totalIncome - totalExpense).toDecimal();
    const totalPending = Money.fromCents((incomePending[0]?.total || 0) - (expensePending[0]?.total || 0)).toDecimal();

    // 🔹 Análisis de Transacciones
    let recentTransactions = await TransactionModel.find({ account:{ $in:accountIds } }).sort({ date:-1 }).limit(10);
    recentTransactions = await Promise.all(recentTransactions.map(async (transaction:TypeTransaction) => {
      transaction.amount = Money.fromCents(transaction.amount).toDecimal();
      return transaction;
    }));
    let categoryDistribution = await TransactionModel.aggregate([
      { $match: { account: { $in: accountIds } }, },
      {
        $group: {
          _id: "$category",
          total: {
            $sum: {
              $cond: [
                { $eq: ["$type", "income"] },
                "$amount",          // si es income, suma 
                { $multiply: ["$amount", -1] } // si es expense, resta
              ]
            }
          }
        }
      },
      {
        $project: {
          label: "$_id",
          count: "$total"
        }
      }
    ]);
    categoryDistribution = await Promise.all(categoryDistribution.map(async (dis) => {
      const cat = await CategoryModel.findById(dis.label);
      dis.label = cat.label || "";
      dis.count = Money.fromCents(dis.count).toDecimal();
      return dis;
    }));

    // 🔹 Análisis Temporal
    let monthlyTrends = await TransactionModel.aggregate([
      { $match: { account: { $in: accountIds } } },
      {
        $group: {
          _id:{ $month:"$date" },
          income:{ 
            $sum: { 
              $cond: [
                { $and: [{ $eq: ["$type", "income"] }, { $eq: ["$status", "Finalizado"] }] },
                "$amount",
                0
              ]
            } 
          },
          expense: { 
            $sum: { 
              $cond: [
                { $and: [{ $eq: ["$type", "expense"] }, { $eq: ["$status", "Finalizado"] }] },
                "$amount",
                0
              ]
            } 
          },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    monthlyTrends = await Promise.all(monthlyTrends.map(async (month) => {
      month.income = Money.fromCents(month.income).toDecimal();
      month.expense = Money.fromCents(month.expense).toDecimal();
      return month;
    }));

    // 🔹 Insights y Alertas
    const transactionsStatuses = {
      total:await TransactionModel.countDocuments({ account:{ $in:accountIds } }),
      pending:await TransactionModel.countDocuments({ account:{ $in:accountIds }, status:"Pendiente" }),
      completed:await TransactionModel.countDocuments({ account:{ $in:accountIds }, status:"Finalizado" }),
      canceled:await TransactionModel.countDocuments({ account:{ $in:accountIds }, status:"Cancelado" }),
    };
    const topAccounts = {
      income:await TransactionModel.aggregate([
        { $match:{ account:{ $in:accountIds }, type:"income", status:"Finalizado" } },
        { $group:{ _id:"$account", total:{ $sum:"$amount" } } },
        { $sort:{ total:-1 } },
        { $limit:3 },
      ]),
      expense:await TransactionModel.aggregate([
        { $match:{ account:{ $in:accountIds }, type:"expense", status:"Finalizado" } },
        { $group:{ _id:"$account", total:{ $sum:"$amount" } } },
        { $sort:{ total:-1 } },
        { $limit:3 },
      ]),
      balance:await AccountModel.aggregate([
        { $match:{ desk:desk._id, } },
        { $group:{ _id:"$_id", total:{ $sum:"$balance" } } },
        { $sort:{ total:-1 } },
        { $limit:3 },
      ]),
    };
    topAccounts.income = await Promise.all(topAccounts.income.map(async (account) => {
      account.total = Money.fromCents(account.total).toDecimal();
      return account;
    }));
    topAccounts.expense = await Promise.all(topAccounts.expense.map(async (account) => {
      account.total = Money.fromCents(account.total).toDecimal();
      return account;
    }));
    topAccounts.balance = await Promise.all(topAccounts.balance.map(async (account) => {
      account.total = Money.fromCents(account.total).toDecimal();
      return account;
    }));

    // 🔹 Estructurar respuesta
    const data:TypeAccountsDashboardData = {
      generalInfo: { totalBalance, totalIncome, totalExpense, totalPending },
      transactionsAnalysis: {
        recentTransactions,
        categoryDistribution,
      },
      timeAnalysis: {
        monthlyTrends:monthlyTrends.map(({ _id, income, expense, transactions }) => ({
          month: new Date(CURRENT_YEAR, _id - 1, 1).toLocaleString("es", { month: "long" }),
          income,
          expense,
          transactions,
        })),
      },
      insights:{
        transactionsStatuses,
        topAccounts:{
          income:topAccounts.income.map(({ _id, total }) => ({ _id, total })),
          expense:topAccounts.expense.map(({ _id, total }) => ({ _id, total })),
          balance:topAccounts.balance.map(({ _id, total }) => ({ _id, total })),
        },
      },
    };

    return NextResponse.json({ accounts, dashboard:data }, { status:200 });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ message:"Internal Server Error" }, { status:500 });
  };
};