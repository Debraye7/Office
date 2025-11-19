import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { verifyAdminToken, verifyDeskToken, verifyOwnerToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import ProductModel from "@products/models/Product";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@shared/lib/cloudinaryUpload";
import { PRODUCT_PICTURE } from "@shared/utils/data";

// @desc Get product by ID
// @route GET /api/products/:id
// @access Owner, Admin, User, Client

export async function GET(req:NextRequest) {
  try {
    await connectDB();
    const productId = req.url.split("/")[5].split("?")[0];
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

//! Find Product
    const product = await ProductModel.findById(productId).populate("folder", "title").populate("category");
    if(!product) return NextResponse.json({ message:"Product not found" }, { status:404 });

    return NextResponse.json({ product }, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Update product details
// @route PUT /api/products/:id
// @access Owner, Admin

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    //! Extract product ID from URL
    const productId = req.url.split("/")[5].split("?")[0];

    //! Parse cookies
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

    //! Validate user token
    const userToken: TypeUser | NextResponse = await verifyAdminToken(authToken);
    if (userToken instanceof NextResponse) return userToken;

    //! Validate desk token
    const desk: TypeDesk | undefined = await verifyDeskToken(deskToken, userToken._id);
    if (!desk) return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });

    //! Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title")?.toString().trim() || "";
    const description = formData.get("description")?.toString().trim() || "";
    const category = formData.get("category")?.toString();
    const price = Number(formData.get("price")?.toString() || 0);

    //! Validations
    if (!title) return NextResponse.json({ message: "El título debe tener al menos 1 carácter." }, { status: 400 });
    if (title.length > 200) return NextResponse.json({ message: "El título puede tener un máximo de 200 caracteres." }, { status: 400 });
    if (!category) return NextResponse.json({ message: "Categoría obligatoria" }, { status: 400 });
    if (isNaN(price) || price < 0) return NextResponse.json({ message: "Precio obligatorio" }, { status: 400 });

    //! Find product
    const product = await ProductModel.findById(productId);
    if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });

    //! Update image if a new file is sent
    if (file) {
      const imageUrl = await uploadImageToCloudinary(file, {
        folder: "products",
        publicId: product._id.toString(),
      });
      product.imageUrl = imageUrl;
    }

    //! Update fields
    product.title = title;
    product.description = description;
    product.category = category;
    product.price = price;

    await product.save();

    return NextResponse.json({ message: "Producto actualizado" }, { status: 201 });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ message: "Server error", error }, { status: 500 });
  };
};

// @desc Delete product
// @route DELETE /api/products/:id
// @access Private Owner

export async function DELETE(req:NextRequest) {
  try {
    await connectDB();
    const productId = req.url.split("/")[5].split("?")[0];
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

//! Delete Product
    const product = await ProductModel.findByIdAndDelete(productId);
    if(!product) return NextResponse.json({ message:"Product not found" }, { status:404 });
  //? Delete Image
    const deleteImage = product.imageUrl !== PRODUCT_PICTURE ? await deleteImageFromCloudinary({ folder:"products", publicId:productId }) : true;
    if(!deleteImage) return NextResponse.json({ message:"Error al eliminar la imagen" }, { status:404 });

    return NextResponse.json({ message:"Producto eliminado" }, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};