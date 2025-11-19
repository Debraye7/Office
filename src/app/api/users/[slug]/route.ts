import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import bcrypt from "bcryptjs";
import { connectDB } from "@config/db";
import { verifyDeskToken, verifyOwnerToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import DeskModel from "@desks/models/Desk";
import TaskModel from "@tasks/models/Task";
import UserModel from "@users/models/User";
import AccountModel from "@accounts/models/Account";
import { TypeDesk, TypeUser } from "@shared/utils/types";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@shared/lib/cloudinaryUpload";
import { PROFILE_PICTURE } from "@shared/utils/data";

const hashedPassword = async (newPassword:string) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);
  return hash;
};

// @desc Get user by ID
// @route GET /api/users/:id
// @access Private

export async function GET(req:NextRequest) {
  try {
    await connectDB();
    const userId = req.url.split("/")[5].split("?")[0];
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

//! Find user
    const user = await UserModel.findById(userId);
    if(userToken._id.toString() !== userId) return NextResponse.json({ message:"Acceso denegado" }, { status:403 });

    return NextResponse.json(user, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};

// @desc Update user
// @route PUT /api/users/:id
// @access Private

export async function PUT(req: Request) {
  try {
    await connectDB();

    const formData = await req.formData();
    const name = formData.get("name")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const newPassword = formData.get("newPassword")?.toString() || "";
    const password = formData.get("password")?.toString() || "";
    const file = formData.get("file") as File | null;

    const formattedEmail = email.toLowerCase().trim();

    //! Get auth token from cookies
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;

    //! Validate user token
    const userToken: TypeUser | NextResponse = await verifyUserToken(authToken);
    if (userToken instanceof NextResponse) return userToken;

    //! Validations
    if (!name) return NextResponse.json({ message: "Missing name" }, { status: 400 });
    if (!email) return NextResponse.json({ message: "Missing email" }, { status: 400 });
    if (!password) return NextResponse.json({ message: "Missing current password" }, { status: 400 });

    //! Find user
    const user = await UserModel.findOne({ email:userToken.email }).select("+password");
    if (!user) return NextResponse.json({ message:"Token error" }, { status: 401 });
    if (userToken._id.toString() !== user._id.toString()) return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });

    //! Check if email is used by someone else
    const emailExists = await UserModel.findOne({ email: formattedEmail });
    if (user.email !== formattedEmail && emailExists) return NextResponse.json({ message: "El correo ya está registrado" }, { status: 400 });

    //! Compare current password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return NextResponse.json({ message: "Contraseña incorrecta" }, { status: 400 });

    //! Hash new password if provided
    const hash = newPassword ? await hashedPassword(newPassword) : user.password;

    //! Upload new image if provided
    let imageUrl = user.profileImageUrl;
    if (file) {
      imageUrl = await uploadImageToCloudinary(file, {
        folder: 'users',
        publicId: user._id.toString(),
      });
    };

    //! Update user
    const updatedUser = await UserModel.findByIdAndUpdate(user._id,
      {
        name,
        email: formattedEmail,
        password: hash,
        profileImageUrl: imageUrl,
      },
      { new: true }
    );

    return NextResponse.json(
      {
        message: "Usuario actualizado",
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          profileImageUrl: updatedUser.profileImageUrl,
          role: updatedUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    return NextResponse.json({ message: "Server error", error }, { status: 500 });
  }
}

// @desc Delete user
// @route DELETE /api/users/:id
// @access Owner

export async function DELETE(req:NextRequest) {
  try {
    await connectDB();
    const userId = req.url.split("/")[5].split("?")[0];
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyOwnerToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

    const deleteImage = userToken.profileImageUrl !== PROFILE_PICTURE ? await deleteImageFromCloudinary({ folder:"users", publicId:userId }) : true;
    if(!deleteImage) return NextResponse.json({ message:"Error al eliminar la imagen" }, { status:404 });
    const deletedUser = await UserModel.findByIdAndDelete(userId);
    if(!deletedUser) return NextResponse.json({ message:"User not found" }, { status:404 });

//! Remove user from information
  //? Desks
    await DeskModel.updateMany({ members:userId }, { $pull:{ members:userId } });
  //? Task
    await TaskModel.updateMany({ assignedTo:userId }, { $pull:{ assignedTo:userId } });
  //? Accounts
    await AccountModel.updateMany({ assignedTo:userId }, { $pull:{ assignedTo:userId } });

    return NextResponse.json({ message:"Usuario eliminado" }, { status:200 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};