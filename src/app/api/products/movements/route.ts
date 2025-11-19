import { NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { verifyDeskToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import ProductModel from "@products/models/Product";
import MovementModel from "@movements/models/Movements";

const STATUSES = [
  "Pendiente",
  "Finalizado",
  "Cancelado"
];

const TYPES = [
  "inflow",
  "outflow",
];

// @desc Create movement
// @route POST /api/products/movements
// @access Assigned only

export async function POST(req:Request) {
  try {
    await connectDB();
    const { productId, type, category, title, description, quantity, date, status } = await req.json();
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
    if(!productId) return NextResponse.json({ message:"Missing product" }, { status:400 });
    if(!type || !TYPES.includes(type)) return NextResponse.json({ message:"Missing type" }, { status:400 });
    if(!title.trim()) return NextResponse.json({ message:"El título debe tener al menos 1 carácter." }, { status:400 });
    if(title.trim().length > 200) return NextResponse.json({ message:"El título puede tener un máximo de 200 caracteres." }, { status:400 });
    if(!quantity) return NextResponse.json({ message:"Missing quantity" }, { status:400 });
    if(!status || !STATUSES.includes(status)) return NextResponse.json({ message:"Missing status" }, { status:400 });

//! Verify if stock is available
    const product = await ProductModel.findById(productId);
    if(!product) return NextResponse.json({ message:"Account not found"}, { status:404 });
    if(type === "outflow" && product.stock === 0) return NextResponse.json({ message:"No hay stock disponible"}, { status:400 });

    const movement = await MovementModel.create({
      product:productId,
      type,
      category,
      title,
      description,
      quantity,
      date,
      createdBy:userToken._id,
      status
    });
    if(!movement) return NextResponse.json({ message:"Create movement error"}, { status:500 });

    if(status === "Finalizado") {
      const updatedProduct = await ProductModel.findByIdAndUpdate(productId, { $inc:{ stock:type === "inflow" ? quantity : -quantity }, }, { new:true });
      if(!updatedProduct) return NextResponse.json({ message:"Product not found"}, { status:404 });
    };

    return NextResponse.json({ message:"Movimiento creado" }, { status:201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};