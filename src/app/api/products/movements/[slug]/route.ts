import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { verifyAdminToken, verifyDeskToken, verifyOwnerToken } from "@shared/middlewares/authMiddleware";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import MovementModel from "@movements/models/Movements";
import ProductModel from "@products/models/Product";

const STATUSES = [
  "Pendiente",
  "Finalizado",
  "Cancelado"
];

// @desc Update transaction details
// @route PUT /api/products/movements/:id
// @access Owner, Admin

export async function PUT(req:NextRequest) {
  try {
    await connectDB();
    const movementId = req.url.split("/")[6].split("?")[0];
    const { category, title, description, quantity, date, status } = await req.json();
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
    if(!movementId) return NextResponse.json({ message:"Missing movement" }, { status:400 });
    if(!title.trim()) return NextResponse.json({ message:"El título debe tener al menos 1 carácter." }, { status:400 });
    if(title.trim().length > 200) return NextResponse.json({ message:"El título puede tener un máximo de 200 caracteres." }, { status:400 });
    if(description.trim().length > 600) return NextResponse.json({ message:"La descripción puede tener un máximo de 600 caracteres." }, { status:400 });
    if(!quantity) return NextResponse.json({ message:"Missing quantity" }, { status:400 });
    if(!status || !STATUSES.includes(status)) return NextResponse.json({ message:"Missing status" }, { status:400 });

//! Update Movement
    const currentMovement = await MovementModel.findById(movementId).populate("createdBy", "name email profileImageUrl");
    if(!currentMovement) return NextResponse.json({ message:"Movement not found" }, { status:404 });

    if(currentMovement.status !== "Finalizado" && status === "Finalizado") {
      const updatedProduct = await ProductModel.findByIdAndUpdate(currentMovement.product, { $inc:{ stock:currentMovement.type === "inflow" ? quantity : -quantity }, }, { new:true });
      if(!updatedProduct) return NextResponse.json({ message:"Product not found"}, { status:404 });
    } else if(currentMovement.status === "Finalizado" && status !== "Finalizado") {
      const updatedProduct = await ProductModel.findByIdAndUpdate(currentMovement.product, { $inc:{ stock:currentMovement.type === "inflow" ? -currentMovement.quantity : currentMovement.quantity }, }, { new:true });
      if(!updatedProduct) return NextResponse.json({ message:"Product not found"}, { status:404 });
    } else if(currentMovement.status === "Finalizado" && status === "Finalizado") {
      let updatedProduct = await ProductModel.findByIdAndUpdate(currentMovement.product, { $inc:{ stock:currentMovement.type === "inflow" ? -currentMovement.quantity : currentMovement.quantity }, }, { new:true });
      if(!updatedProduct) return NextResponse.json({ message:"Product not found"}, { status:404 });
      updatedProduct = await ProductModel.findByIdAndUpdate(currentMovement.product, { $inc:{ stock:currentMovement.type === "inflow" ? quantity : -quantity }, }, { new:true });
      if(!updatedProduct) return NextResponse.json({ message:"Product not found"}, { status:404 });
    };

    const movement = currentMovement;
    movement.title = title || currentMovement.title;
    movement.description = description || currentMovement.description;
    movement.category = category || currentMovement.category;
    movement.quantity = quantity || currentMovement.quantity;
    movement.date = date || currentMovement.date;
    movement.status = status || currentMovement.status;
    await movement.save();

    return NextResponse.json({ message:"Movimiento actualizado" }, { status:201 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Delete movement
// @route DELETE /api/products/movements/:id
// @access Owner

export async function DELETE(req:NextRequest) {
  try {
    await connectDB();
    const movementId = req.url.split("/")[6].split("?")[0];
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
    if(!movementId) return NextResponse.json({ message:"Missing movement" }, { status:400 });

//! Delete movement
    const movement = await MovementModel.findByIdAndDelete(movementId);
    if(!movement) return NextResponse.json({ message:"Movement not found" }, { status:404 });

//! Update product stock
    if(movement.status === "Finalizado") {
      console.log(movement.product)
      const updatedProduct = await ProductModel.findByIdAndUpdate(movement.product, { $inc:{ stock:movement.type === "inflow" ? -movement.quantity : movement.quantity }, });
      if(!updatedProduct) return NextResponse.json({ message:"Product not found"}, { status:404 });
    };

    return NextResponse.json({ message:"Movimiento eliminado" }, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};