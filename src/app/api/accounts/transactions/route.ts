import { NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { verifyDeskToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import AccountModel from "@accounts/models/Account";
import TransactionModel from "@transactions/models/Transaction";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import { Money } from "@/src/shared/hooks/decimals";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { accountId, type, category, title, description, amount, date, status } = await req.json();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

    //! Validate user token
    const userToken: TypeUser | NextResponse = await verifyUserToken(authToken);
    if (userToken instanceof NextResponse) return userToken;

    //! Validate desk token
    const desk: TypeDesk | undefined = await verifyDeskToken(deskToken, userToken._id);
    if (!desk) return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });

    //! Validations
    if (!accountId) return NextResponse.json({ message: "Missing account" }, { status: 400 });
    if (!type) return NextResponse.json({ message: "Missing type" }, { status: 400 });
    if (!category) return NextResponse.json({ message: "Missing category" }, { status: 400 });
    if (!title.trim()) return NextResponse.json({ message: "El título debe tener al menos 1 carácter." }, { status: 400 });
    if (title.trim().length > 200) return NextResponse.json({ message: "El título puede tener un máximo de 200 caracteres." }, { status: 400 });
    if (!amount) return NextResponse.json({ message: "Missing amount" }, { status: 400 });
    const [_, decimals = ""] = amount.toString().split(".");
    if (decimals.length > 2) return NextResponse.json({ message: "El monto puede tener máximo 2 decimales." }, { status: 400 });

    //! Convertir a Money
    const money = Money.fromDecimal(amount);
    const amountInCents = money.toCents();

    //! Verify if the user is assigned to the account
    const account = await AccountModel.findById(accountId);
    if (!account) return NextResponse.json({ message: "Account not found" }, { status: 404 });
    if (!account.assignedTo.includes(userToken._id)) return NextResponse.json({ message: "No estás asignado" }, { status: 403 });

    //! Crear transacción en centavos
    const transaction = await TransactionModel.create({
      account:accountId,
      type,
      category,
      title,
      description,
      amount:amountInCents, // guardamos en centavos
      date,
      createdBy:userToken._id,
      status,
    });
    if (!transaction) return NextResponse.json({ message: "Create transaction error" }, { status: 500 });

    //! Si está finalizada, actualizamos balance en centavos
    if (status === "Finalizado") {
      const increment = type === "income" ? amountInCents : -amountInCents;

      const updatedAccount = await AccountModel.findByIdAndUpdate(
        accountId,
        { $inc: { balance: increment } }, // también en centavos
        { new: true }
      )
        .populate("assignedTo", "name email profileImageUrl")
        .populate("folder", "title");

      if (!updatedAccount) return NextResponse.json({ message: "Account not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Transacción creada",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Server error", error }, { status: 500 });
  };
};
