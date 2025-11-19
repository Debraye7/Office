import { connectDB } from "@config/db";
import { verifyDeskToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import { TypeDesk, TypeProduct, TypeUser } from "@shared/utils/types";
import { parse } from "cookie";
import { NextResponse } from "next/server";
import SaleModel from "@store/models/Sale";
import AccountModel from "@accounts/models/Account";
import TransactionModel from "@accounts/transactions/models/Transaction";
import ProductModel from "@products/models/Product";
import MovementModel from "@products/movements/models/Movements";
import { Money } from "@/src/shared/hooks/decimals";

// @desc Create a new Sale
// @route POST /api/store
// @access Owner, Admin, User

export async function POST(req:Request) {
  try {
    await connectDB();
    const { accountId, name, cart, total } = await req.json();
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

//! Validations
    if(!accountId) return NextResponse.json({ message:"Account ID is required" }, { status:400 });
    if(!cart || cart.length === 0) return NextResponse.json({ message:"Cart cannot be empty" }, { status:400 });
    if(total <= 0) return NextResponse.json({ message:"Total must be greater than 0" }, { status:400 });

//! Convertir a Money
    const money = Money.fromDecimal(total);
    const totalInCents = money.toCents();

//! Format cart
    const formattedCart = cart.map((item:{ product:TypeProduct, quantity:number }) => ({ product:item.product._id, quantity:item.quantity }));

    const newSale = await SaleModel.create({
      desk:desk._id,
      date:new Date(),
      name:name ? name : `Sin nombre`,
      cart:formattedCart,
      total:totalInCents,
      createdBy:userToken._id,
    });
    if(!newSale) return NextResponse.json({ message:"Create sale error"}, { status:500 });

//! Update account
    const account = await AccountModel.findById(accountId);
    if(!account) return NextResponse.json({ message:"Account not found" }, { status:404 });
    account.balance += totalInCents;
    await account.save();
//! Create transaction
    const transaction = await TransactionModel.create({
      account:account._id,
      type:"income",
      title:`Punto de venta`,
      description:`#${newSale._id}`,
      amount:totalInCents,
      date:newSale.date,
      createdBy:userToken._id,
      status:"Pendiente",
    });
    if(!transaction) return NextResponse.json({ message:"Create transaction error" }, { status:500 });

//! Update products stock and create movements
    await Promise.all(cart.map(async (item:{ product:TypeProduct, quantity:number }) => {
      const product = await ProductModel.findById(item.product._id);
      if(!product) return;
      product.stock -= item.quantity;
      await product.save();
      await MovementModel.create({
        product:item.product._id,
        type:"outflow",
        title:`Punto de venta`,
        description:`#${newSale._id}`,
        quantity:item.quantity,
        date:newSale.date,
        createdBy:userToken._id,
        status:"Pendiente",
      });
    }));

    return NextResponse.json({ message:"Venta creada" }, { status:201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};