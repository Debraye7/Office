import { NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { verifyAdminToken, verifyDeskToken, verifyOwnerToken } from "@shared/middlewares/authMiddleware";
import EventModel from "@events/models/Event";
import { TypeAssigned, TypeAssignedStatus, TypeDesk, TypeUser } from "@shared/utils/types";

// @desc Update event
// @route PATCH /api/events/:id
// @access Owner, Admin

export async function PATCH(req:Request) {
  try {
    await connectDB();
    const id = req.url.split("/")[5].split("?")[0];

    const {
      folder,
      title,
      description,
      start,
      end,
      allDay,
      recurrence,
      recurrenceEnd,
      assigned,
      assignedTo
    } = await req.json();

    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

    const userToken: TypeUser | NextResponse = await verifyAdminToken(authToken);
    if (userToken instanceof NextResponse) return userToken;

    const desk: TypeDesk | undefined = await verifyDeskToken(deskToken, userToken._id);
    if (!desk) return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });

    const event = await EventModel.findById(id);
    if (!event) return NextResponse.json({ message: "Evento no encontrado" }, { status: 404 });

    if (event.desk.toString() !== desk._id.toString()) return NextResponse.json({ message: "Este evento no pertenece a este escritorio" }, { status: 403 });

    // Actualizar campos válidos
    if (folder !== undefined) event.folder = folder;
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (start !== undefined) event.start = new Date(start);
    if (end !== undefined) event.end = new Date(end);
    if (allDay !== undefined) event.allDay = allDay;
    if (recurrence !== undefined) event.recurrence = recurrence;
    if (recurrenceEnd !== undefined) event.recurrenceEnd = recurrenceEnd ? new Date(recurrenceEnd) : undefined;
    if (Array.isArray(assigned)) event.assignedTo = assigned.map((userId:string) => ({ assigned:userId, status:event.assignedTo.find((item:{ assigned:TypeAssigned, status:TypeAssignedStatus }) => item.assigned.toString() === userId.toString())?.status || "pending" }));
    if (Array.isArray(assignedTo)) event.assignedTo = assignedTo;

    await event.save();

    return NextResponse.json({ message: "Evento actualizado" }, { status: 200 });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ message: "Server error", error }, { status: 500 });
  }
}


// @desc Delete event
// @route DELETE /api/events/:id
// @access Owner

export async function DELETE(req:Request) {
  try {
    await connectDB();

    const id = req.url.split("/")[5].split("?")[0];
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

    const userToken: TypeUser | NextResponse = await verifyOwnerToken(authToken);
    if (userToken instanceof NextResponse) return userToken;

    const desk: TypeDesk | undefined = await verifyDeskToken(deskToken, userToken._id);
    if (!desk) return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });

    // Find event and ensure it belongs to this desk
    const event = await EventModel.findById(id);
    if (!event) return NextResponse.json({ message: "Evento no encontrado" }, { status: 404 });

    await event.deleteOne();

    return NextResponse.json({ message: "Evento eliminado" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ message: "Server error", error }, { status: 500 });
  }
}
