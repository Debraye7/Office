import { NextResponse } from "next/server";
import { parse } from "cookie";
import { connectDB } from "@config/db";
import { verifyAdminToken, verifyDeskToken, verifyUserToken } from "@shared/middlewares/authMiddleware";
import EventModel from "@events/models/Event";
import { TypeAssigned, TypeDesk, TypeEvent, TypeUser } from "@shared/utils/types";
import { addDays, addMonths, addWeeks, addYears, endOfDay, endOfMonth, isWithinInterval, startOfDay, startOfMonth } from "date-fns";
import { ObjectId } from "mongodb";

// Función auxiliar para expandir eventos recurrentes
function expandRecurringEvent(event:TypeEvent, rangeStart:Date, rangeEnd:Date) {
  const recurrence = event.recurrence;
  const occurrences = [];

  if (!recurrence || recurrence === 'none') return [event];

  const start = new Date(event.start);
  const end = new Date(event.end);
  const recurrenceEnd = event.recurrenceEnd ? new Date(event.recurrenceEnd) : rangeEnd;

  let currentStart = start;
  let currentEnd = end;

  while (currentStart <= rangeEnd && currentStart <= recurrenceEnd) {
    if (isWithinInterval(currentStart, { start: rangeStart, end: rangeEnd })) {
      occurrences.push({
        ...event, // copia del documento de Mongoose
        _id: new ObjectId().toString(), // nuevo ID para la instancia recurrente
        start: new Date(currentStart),
        end: new Date(currentEnd),
        originalEventId: event._id,
        isRecurringInstance: true,
      });
    }

    switch (recurrence) {
      case 'daily':
        currentStart = addDays(currentStart, 1);
        currentEnd = addDays(currentEnd, 1);
        break;
      case 'weekly':
        currentStart = addWeeks(currentStart, 1);
        currentEnd = addWeeks(currentEnd, 1);
        break;
      case 'monthly':
        currentStart = addMonths(currentStart, 1);
        currentEnd = addMonths(currentEnd, 1);
        break;
      case 'yearly':
        currentStart = addYears(currentStart, 1);
        currentEnd = addYears(currentEnd, 1);
        break;
    };
  };
  return occurrences;
};

// @desc Get all events
// @route GET /api/events
// @access Owner|Admin:all, User|Client:only assigned events

export async function GET(req: Request) {
  try {
    await connectDB();
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const authToken = cookies.authToken;
    const deskToken = cookies.deskToken;

    const { searchParams } = new URL(req.url);
    const rawMonth = parseInt(searchParams.get("month") || "");
    const rawYear = parseInt(searchParams.get("year") || "");

    // Validaciones
    const isValidMonth = !isNaN(rawMonth) && rawMonth >= 1 && rawMonth <= 12;
    const isValidYear = !isNaN(rawYear) && rawYear >= 2000 && rawYear <= 2100;

    const today = new Date();
    const year = isValidYear ? rawYear : today.getFullYear();
    const month = isValidMonth ? rawMonth - 1 : today.getMonth(); // JS usa 0-11

    const startDate = startOfMonth(new Date(year, month));
    const endDate = endOfMonth(addMonths(new Date(year, month), 1)); // mes actual + siguiente

    const filter = {
      folder: searchParams.get("folder") || undefined,
      startOfMonth: startDate,
      endOfMonth: endDate,
    };

    // Validaciones
    const userToken = await verifyUserToken(authToken);
    if (userToken instanceof NextResponse) return userToken;
    const desk = await verifyDeskToken(deskToken, userToken._id);
    if (!desk) return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });

    let events = await EventModel.find({
      desk: desk._id,
      $or: [
        // Eventos recurrentes activos que empezaron antes del fin del rango
        {
          recurrence: { $ne: "none" },
          start: { $lte: filter.endOfMonth },
          $or: [
            { recurrenceEnd: { $exists: false } },
            { recurrenceEnd: { $gte: filter.startOfMonth } },
          ]
        },
        // Eventos normales
        { start: { $gte: filter.startOfMonth, $lte: filter.endOfMonth } },
        { end: { $gte: filter.startOfMonth, $lte: filter.endOfMonth } },
        { start: { $lte: filter.startOfMonth }, end: { $gte: filter.endOfMonth } },
      ]
    })
    .lean()
    .populate("createdBy", "name email profileImageUrl")
    .populate("assignedTo.assigned", "name email profileImageUrl")
    .populate("folder", "title")
    .sort({ start: 1 }) as unknown as TypeEvent[];

    // Filtros por usuario y folder
    if (userToken.role === "user" || userToken.role === "client") {
      events = events.filter(event =>
        event.assignedTo.some((user) => user.assigned._id.toString() === userToken._id.toString())
      );
    }
    if (filter.folder) {
      events = events.filter(event =>
        event.folder && event.folder._id.toString() === filter.folder
      );
    }

    // Expansión de eventos recurrentes
    const expandedEvents = [];
    for (const event of events) {
      const occurrences = expandRecurringEvent(event, filter.startOfMonth, filter.endOfMonth);
      expandedEvents.push(...occurrences);
    };

    // Reordenar eventos por fecha de inicio
    expandedEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return NextResponse.json(expandedEvents, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ message: "Server error", error }, { status: 500 });
  };
};

// @desc Create a new event
// @route POST /api/events
// @access Owner, Admin

export async function POST(req:Request) {
  try {
    await connectDB();
    const {
      folder,
      title,
      description = '',
      start,
      end,
      allDay = false,
      recurrence = 'none',
      recurrenceEnd,
      assignedTo = [],
    } = await req.json();
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
    if(!folder) return NextResponse.json({ message:"Folder required" }, { status:400 });
    if(!title) return NextResponse.json({ message:"Title required" }, { status:400 });
    if(!start) return NextResponse.json({ message:"Start date required" }, { status:400 });
    if(!end) return NextResponse.json({ message:"End date required" }, { status:400 });
    if(!Array.isArray(assignedTo)) return NextResponse.json({ message:"AssignedTo must be an array of users IDs" }, { status:400 });

    const newEvent = await EventModel.create({
      desk:desk._id,
      folder,
      title,
      description,
      start:allDay ? startOfDay(start) : start,
      end:allDay ? endOfDay(end) : end,
      allDay,
      recurrence,
      recurrenceEnd,
      createdBy:userToken._id,
      assignedTo: assignedTo.map((userId:string) => ({ assigned:userId, status:"pending" })),
    });
    if(!newEvent) return NextResponse.json({ message:"Create event error"}, { status:500 });

    return NextResponse.json({ message:"Evento creado" }, { status:201 });
  } catch (error) {
    return NextResponse.json({ message:"Server error", error }, { status:500 });
  };
};