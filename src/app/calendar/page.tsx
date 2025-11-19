"use client"

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { addMonths, format, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { LuCircleChevronLeft, LuCircleChevronRight, LuPlus } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import { TypeEvent, TypeFolder } from "@shared/utils/types";
import { API_PATHS } from "@shared/utils/apiPaths";
import axiosInstance from "@shared/utils/axiosInstance";
import AppLayout from "@shared/layouts/AppLayout"
import Skeleton from "@shared/components/Skeleton";
import Modal from "@shared/components/Modal";
import ProtectedRoute from "@app/ProtectedRoute"
import FolderSelect from "@folders/components/FolderSelect";
import Calendar from "@calendar/components/CalendarBody";
import EventCard from "@calendar/events/components/EventCard";
import EventForm from "@calendar/events/components/EventForm";

export default function CalendarPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<TypeEvent[]>([]);
  const [date, setDate] = useState(new Date());
  const [filterFolder, setFilterFolder] = useState<TypeFolder|undefined>();
  const [openForm, setOpenForm] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_PATHS.EVENTS.GET_ALL_EVENTS, {
        params: {
          month: date.getMonth() + 1, // de 1 a 12
          year: date.getFullYear(),
          folder: filterFolder?._id || ""
        }
      });
      if(res.status === 200) setEvents(res.data.length > 0 ? res.data : []);
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error fetching accounts:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    } finally {
      setLoading(false);
    };
  };

  useEffect(() => {
    fetchEvents();
  },[date, filterFolder]);

  const handleFilterFolder = (value:TypeFolder|undefined) => {
    if (value?._id === filterFolder?._id) return;
    setFilterFolder(value);
  };

  const handleMonth = (direction: "prev" | "next") => {
    setEvents([]);
    setDate(direction === "next" ? addMonths(date, 1) : subMonths(date, 1));
  };

  const gridClass = "grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4";

  return(
    <ProtectedRoute>
      <AppLayout activeMenu="Calendario">
        <div className="relative flex-1 flex flex-col gap-8 text-basic">
          <section aria-label="Calendario" className="flex flex-col bg-primary-light dark:bg-primary-dark border-2 border-secondary-light dark:border-secondary-dark shadow-md rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 text-primary-dark dark:text-primary-light bg-secondary-light dark:bg-secondary-dark">
              <button onClick={()=>handleMonth("prev")} aria-label="Mes anterior">
                <LuCircleChevronLeft className="text-3xl hover:text-quaternary cursor-pointer duration-300"/>
              </button>
              <h1 className="text-center font-semibold">{format(new Date(date), "MMMM yyyy", { locale: es }).replace(/^./, m => m.toUpperCase())}</h1>
              <button onClick={()=>handleMonth("next")} aria-label="Mes siguiente">
                <LuCircleChevronRight className="text-3xl hover:text-quaternary cursor-pointer duration-300"/>
              </button>
            </div>
            <Calendar refresh={fetchEvents} date={date} events={events}/>
          </section>
          <section aria-labelledby="section-title" className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 w-full">
              <h2 id="section-title" className="flex flex-col font-semibold text-3xl">Eventos <span className="text-sm text-quaternary">({format(date, "MMMM", { locale:es }).replace(/^./, m => m.toUpperCase())} - {format(addMonths(date, 1), "MMMM", { locale:es }).replace(/^./, m => m.toUpperCase())})</span></h2>
              <div className="flex-1 sm:flex-none sm:min-w-64">
                <FolderSelect disabled={loading} selectedFolder={filterFolder} setSelectedFolder={handleFilterFolder}/>
              </div>
            </div>
{/* Loading */}
          {loading &&
            <div className={gridClass}>
            {[1,2,3,4].map((i) => (
              <div key={`card-${i}`} className="flex min-h-56 md:min-h-64 min-w-full">
                <Skeleton/>
              </div>
            ))}
            </div>
          }
{/* There are no tasks */}
          {!loading && events.length === 0 &&
            <div className="flex-1 flex items-center justify-center min-h-72">
              <p className="font-semibold text-2xl text-quaternary">No hay eventos</p>
            </div>
          }
{/* There are tasks */}
            <ul className={`${gridClass}`}>
            {events.map((event) => (
              <EventCard key={event._id} date={date} event={event} refresh={fetchEvents}/>
            ))}
            </ul>
          </section>
{/* Tools (sort, create) */}
          <section className="fixed bottom-2 xl:bottom-4 left-0 flex flex-wrap justify-end gap-2 w-full max-w-[1750px] px-3">
          {user && (user.role === "owner" || user.role === "admin") &&
            <button type="button" onClick={()=>setOpenForm(true)} aria-label="Crear evento" className="tool-btn">
              <LuPlus className="text-xl"/>
              Crear Evento
            </button>
          }
          </section>
        </div>
{/* Modals */}
        <Modal title="Crear Evento" isOpen={openForm} onClose={()=>setOpenForm(false)}>
          {openForm && <EventForm refresh={fetchEvents} closeForm={()=>setOpenForm(false)}/>}
        </Modal>
      </AppLayout>
    </ProtectedRoute>
  );
};

