import { NextResponse } from 'next/server';
import { parse, serialize } from 'cookie';
import { connectDB } from '@config/db';
import { TypeUser } from '@shared/utils/types';
import { verifyUserToken } from '@shared/middlewares/authMiddleware';
import SessionModel from '@sessions/models/Session';

const { NODE_ENV } =  process.env;

export async function GET(req:Request) {
  // Eliminar la cookie estableciendo una cookie con una fecha de expiración en el pasado
  try {
    await connectDB();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;

//! Validate user token
    const userToken:TypeUser|NextResponse = await verifyUserToken(authToken);
    if(userToken instanceof NextResponse) return userToken;

//! Complete user session
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const session = await SessionModel.findOne({
      user:userToken._id,
      checkOut:null,
      checkIn:{ $gte:twelveHoursAgo } // Solo traer sesiones con checkIn dentro de las últimas 12 horas
    }).sort({ checkIn:-1 }); // Ordenar por el más reciente

    if(session) {
      session.checkOut = new Date();
      const completeSession = await session.save();
      if (!completeSession) return NextResponse.json({ message:"Error al cerrar la sesión" }, { status:500 });
    };

    const serializedAuthCookie = serialize('authToken', "", {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
    });
    const serializedDeskCookie = serialize('deskToken', "", {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
    });

    const response = NextResponse.json({ message:session ? "Sesión finalizada" : "Sin sesiones pendientes" }, { status:200 });
    response.headers.set('Set-Cookie', serializedAuthCookie);
    response.headers.append('Set-Cookie', serializedDeskCookie);

    return response;
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};