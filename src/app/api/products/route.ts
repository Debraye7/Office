import { NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { verifyAdminToken, verifyDeskToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import ProductModel from "@products/models/Product";
import { TypeDesk, TypeProduct, TypeUser } from "@shared/utils/types";
import MovementModel from "@movements/models/Movements";
import { PRODUCT_PICTURE } from "@shared/utils/data";
import { uploadImageToCloudinary } from "@shared/lib/cloudinaryUpload";

// @desc Get all Products
// @route GET /api/inventories/products
// @access Owner, Admin, User, Client

export async function GET(req:Request) {
  try {
    await connectDB();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

    const queries = req.url.split("?")[1]?.split("&") || [];
    const queryTitle = queries.find(item => item.includes("title="))?.split("=")[1];
    const queryCategory = queries.find(item => item.includes("category="))?.split("=")[1];
    const filter = {
      title:queryTitle ? decodeURIComponent(queryTitle).replace("+", " ") : undefined,
      category:queryCategory ? decodeURIComponent(queryCategory).replace("+", " ") : undefined,
    };

    const querySort = queries.find(item => item.includes("sort="))?.split("=")[1];
    const sort =  querySort ? decodeURIComponent(querySort).replace(/\+/g, " ") : "Fecha Final (asc)";

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyUserToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Validate desk token
    const desk:TypeDesk|undefined = await verifyDeskToken(deskToken, userToken._id);
    if(!desk) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

//! All products
    let products = await ProductModel.find({ desk:desk._id }).populate("category");

//! Filter products
    if(filter.title) products = products.filter(product => product.title.toLowerCase().includes(filter.title?.toLowerCase()));
    if(filter.category === "null") products = products.filter(product => !product.category);
    if(filter.category && filter.category !== "null") products = products.filter(product => product.category && product.category._id.toString() === filter.category);

//! Sort Products
    if(sort === "Título (asc)") products = products.sort((a:TypeProduct, b:TypeProduct) => a.title.localeCompare(b.title));
    if(sort === "Título (desc)") products = products.sort((a:TypeProduct, b:TypeProduct) => b.title.localeCompare(a.title));
    if(sort === "Precio (asc)") products = products.sort((a:TypeProduct, b:TypeProduct) => a.price - b.price);
    if(sort === "Precio (desc)") products = products.sort((a:TypeProduct, b:TypeProduct) => b.price - a.price);
    if(sort === "Stock (asc)") products = products.sort((a:TypeProduct, b:TypeProduct) => a.stock - b.stock);
    if(sort === "Stock (desc)") products = products.sort((a:TypeProduct, b:TypeProduct) => b.stock - a.stock);

//! Add movements
    products = await Promise.all(products.map(async (product) => {
      const movements = await MovementModel.find({ product:product._id }).sort({ date:-1 }).populate("createdBy", "name email profileImageUrl").populate("category", "icon label type");
      return { ...product._doc, movements };
    }));

//! Add inventories and stock
    // products = await Promise.all(products.map(async (product) => {
    //   const stocks = await StockModel.find({ product:product._id });
    //   let quantity = 0;
    //   stocks.forEach((stock) => {
    //     quantity += stock.quantity;
    //   });
    //   return { ...product._doc, inventories:stocks.length, quantity };
    // }));

    return NextResponse.json(products, { status:200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Create a new product
// @route POST /api/products
// @access Owner, Admin

export async function POST(req: Request) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    const title = formData.get("title")?.toString().trim() || "";
    const description = formData.get("description")?.toString().trim() || "";
    const category = formData.get("category")?.toString();
    const price = Number(formData.get("price")?.toString() || 0);

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

//! Validations
    if (!title) return NextResponse.json({ message: "El título debe tener al menos 1 carácter." }, { status: 400 });
    if (title.length > 200) return NextResponse.json({ message: "El título puede tener un máximo de 200 caracteres." }, { status: 400 });
    if (!category) return NextResponse.json({ message: "Categoría obligatoria" }, { status: 400 });
    if (isNaN(price) || price < 0) return NextResponse.json({ message: "Precio obligatorio" }, { status: 400 });

//! Create product with default image
    const newProduct = await ProductModel.create({
      desk: desk._id,
      title,
      description,
      category,
      price,
      imageUrl:PRODUCT_PICTURE,
    });

//! Upload image to Cloudinary if provided
    if (file) {
      try {
        const imageUrl = await uploadImageToCloudinary(file, {
          folder: "products",
          publicId: newProduct._id.toString(),
        });
        newProduct.imageUrl = imageUrl;
        await newProduct.save();
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
      };
    };

    return NextResponse.json({ message: "Producto creado" }, { status: 201 });
  } catch (error) {
    console.error("Server error creating product:", error);
    return NextResponse.json({ message: "Server error", error }, { status: 500 });
  }
}
