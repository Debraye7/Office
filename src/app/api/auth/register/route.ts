import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { serialize } from "cookie";
import { connectDB } from "@config/db";
import { decodedInviteToken, generateAuthToken } from "@shared/middlewares/authMiddleware";
import UserModel from "@users/models/User";
import SessionModel from "@sessions/models/Session";
import { uploadImageToCloudinary } from "@shared/lib/cloudinaryUpload";
import { PROFILE_PICTURE } from "@shared/utils/data";
import DeskModel from "@/src/modules/desks/models/Desk";

const { NODE_ENV } =  process.env;

export async function POST(req: Request) {
  try {
    await connectDB();

    const formData = await req.formData();

    const name = formData.get('name')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const password = formData.get('password')?.toString() || '';
    // const token = formData.get('token')?.toString() || '';
    const file = formData.get('file') as File | null;

    const formattedEmail = email.toLowerCase();

    //! Validations
    if (!name) return NextResponse.json({ message: "Missing name" }, { status: 400 });
    if (!email) return NextResponse.json({ message: "Missing email" }, { status: 400 });
    if (!password) return NextResponse.json({ message: "Missing password" }, { status: 400 });
    // if (!token) return NextResponse.json({ message: "Missing invite token" }, { status: 400 });

    //! Check if user already exists
    const userExists = await UserModel.findOne({ email: formattedEmail });
    if (userExists) return NextResponse.json({ message: "Ya existe un usuario con ese correo electrónico" }, { status: 400 });

    //! Determine user role
    // const role: NextResponse | string = await decodedInviteToken(token);
    // if (role instanceof NextResponse) return role;
    const role = "admin";

    //! Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //! Create user first to get ID (before uploading image)
    const newUser = await UserModel.create({
      name,
      email: formattedEmail,
      password: hashedPassword,
      role,
      profileImageUrl:PROFILE_PICTURE,
    });

    //! Upload image to Cloudinary
    if(file) {
      const imageUrl = await uploadImageToCloudinary(file, {
        folder: 'users',
        publicId: newUser._id.toString(),
      });

      newUser.profileImageUrl = imageUrl;
      await newUser.save();
    };

    //! Generate auth token
    const authToken = generateAuthToken(newUser._id);
    if (!authToken) return NextResponse.json({ message: "Error generating token" }, { status: 401 });

    const serializedAuthCookie = serialize('authToken', authToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
    });

    //! Create user session
    const newSession = await SessionModel.create({ user: newUser._id, checkIn: new Date() });
    if (!newSession) return NextResponse.json({ message: "Error creating session" }, { status: 500 });

//^ Agregar al escritorio por defecto y devolverlo
    const desk = await DeskModel.findById("686edbe6185bae845e209597");
    if(!desk) return NextResponse.json({ message:"Desk not found" }, { status:404 });
    const updatedDesk = await DeskModel.findByIdAndUpdate(desk._id, { members:[newUser._id, ...desk.members] }, { new:true }).populate("members", "name email profileImageUrl role");
    if(!updatedDesk) return NextResponse.json({ message:"Error updating desk" }, { status:500 });

    //! Return user data
    const res = NextResponse.json({
      message: "Sesión iniciada",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profileImageUrl: newUser.profileImageUrl,
        role: newUser.role,
      },
      desk:updatedDesk,
    }, { status: 201 });

    res.headers.set('Set-Cookie', serializedAuthCookie);
    return res;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return NextResponse.json({ message: "Server error", error }, { status: 500 });
  }
}
