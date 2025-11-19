import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { startOfWeek, format, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";
import { LuChevronLeft, LuChevronRight, LuTrash2 } from "react-icons/lu";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import { TypeSession } from "@shared/utils/types";
import Skeleton from "@shared/components/Skeleton";
import DeleteAlert from "@shared/components/DeleteAlert";
import Modal from "@shared/components/Modal";
import SessionForm from "@sessions/components/SessionForm";

export default function Sessions({ userId }:{ userId:string }) {
  const [weeks, setWeeks] = useState<{ week:string, sessions:TypeSession[], total:number }[]|undefined>();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [openForm, setOpenForm] = useState<TypeSession|undefined>();
  const [openAlert, setOpenAlert] = useState(false);

  const fetchSessions = async () => {
    setWeeks(undefined);
    setOpenForm(undefined);
    try {
      const res = await axiosInstance.get(API_PATHS.SESSIONS.GET_USER_SESSIONS, {
        params:{
          user:userId,
        },
      });
      if(res.status === 200) {
        const sessions:TypeSession[] = res.data;
        if(sessions.length < 1) return setWeeks([]);
        const grouped = (sessions ?? []).reduce((acc, session) => {
          const start = startOfWeek(new Date(session.checkIn), { weekStartsOn: 1 });
          const end = endOfWeek(new Date(session.checkIn), { weekStartsOn: 1 });
          const weekLabel = `${format(start, "dd 'de' MMMM 'del' yyyy", { locale:es })}-${format(end, "dd 'de' MMMM 'del' yyyy", { locale:es })}`;
          let weekEntry = acc.find(entry => entry.week === weekLabel);
          if (!weekEntry) {
            weekEntry = { week: weekLabel, sessions: [], total: 0 };
            acc.push(weekEntry);
          }
          weekEntry.sessions.push(session);
          if (session.checkOut) weekEntry.total += session.hours;
          return acc;
        }, [] as { week:string; sessions:TypeSession[]; total:number }[]);
        setWeeks(grouped);
        setCurrentWeek(grouped.length - 1);
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error(error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    };
  };

  useEffect(() => {
    fetchSessions();
  return () => {};
  },[]);

  const emptyWeek = async () => {
    try {
      const res = await axiosInstance.delete(API_PATHS.SESSIONS.EMPTY_WEEK, {
        params:{
          member:userId,
          week:weeks ? weeks[currentWeek].week : "",
        },
      });
      if(res.status === 200) {
        toast.success(res.data.message);
        fetchSessions();
        setOpenAlert(false);
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error(error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    }
  };

  return(
    <div className="flex-1 flex flex-col gap-2 max-h-full">
    {!weeks &&
      <div className="flex flex-col gap-4 min-w-full h-full">
        <span className="flex min-w-full min-h-16">
          <Skeleton/>
        </span>
        <span className="flex-1 flex min-w-full min-h-16">
          <Skeleton/>
        </span>
      </div>
    }
    {weeks &&
      <section className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-nowrap font-semibold text-xs sm:text-sm text-basic bg-secondary-light dark:bg-secondary-dark border border-tertiary-light dark:border-tertiary-dark duration-300">
          <button 
            className={`flex items-center justify-center px-1 h-12 min-w-10 sm:min-w-20 hover:text-quaternary cursor-pointer disabled:cursor-not-allowed duration-300`}
            disabled={currentWeek === 0} 
            onClick={() => setCurrentWeek(prev => prev - 1)}
          >
            <LuChevronLeft className="text-xl"/>
          </button>
          <span className="flex-1 text-center min-w-20">
            <span>Semana</span>
            <br/>
            <span>{weeks.length > 0 ? currentWeek + 1 : 0} / {weeks.length}</span>
          </span>
          <button 
            className={`flex items-center justify-center px-1 h-12 min-w-10 sm:min-w-20 hover:text-quaternary cursor-pointer disabled:cursor-not-allowed duration-300`}
            disabled={currentWeek >= weeks.length - 1} 
            onClick={() => setCurrentWeek(prev => prev + 1)}
          >
            <LuChevronRight className="text-xl"/>
          </button>
        </div>
      </section>
    }
      <section className="flex-1 flex flex-col gap-3 overflow-auto">
      {weeks && weeks.length < 1 &&
        <div className="flex-1 flex justify-between items-center h-16 gap-1 rounded-md p-1 bg-secondary-light dark:bg-secondary-dark overflow-hidden duration-300 opacity-85 hover:opacity-100">
          <span className="flex-1 flex items-center justify-center h-full p-1 rounded-md text-center bg-primary-light dark:bg-primary-dark">
            <p className="font-semibold text-sm md:text-base text-basic">No hay registros</p>
          </span>
        </div>
      }
      {weeks && weeks.length > 0 &&
        <table key={weeks[currentWeek].week} className="flex-1 flex flex-col items-center gap-1 p-1 min-w-fit rounded-md bg-secondary-light dark:bg-secondary-dark">
          <caption className={`flex w-full gap-1 h-16`}>
            <span className="flex-3/4 flex flex-wrap items-center justify-center font-semibold text-xs md:text-sm p-1 rounded-md text-basic bg-primary-light dark:bg-primary-dark">
              <span className="flex-1">{weeks[currentWeek].week.split("-")[0]}</span>
              <span className="font-light text-2xl">/</span>
              <span className="flex-1">{weeks[currentWeek].week.split("-")[1]}</span>
            </span>
            <span className="flex-1/4 flex items-center justify-center font-semibold text-xs md:text-sm p-1 rounded-md text-basic bg-primary-light dark:bg-primary-dark">{weeks[currentWeek].total && weeks[currentWeek].total.toFixed(2)}</span>
          </caption>
          <thead className="flex flex-col gap-1 w-full">
            <tr className="flex justify-between items-center h-16 gap-1 overflow-hidden duration-300">
              <th className="flex-1 flex items-center justify-center h-full p-1 rounded-md text-center font-semibold text-xs md:text-sm text-basic bg-primary-light dark:bg-primary-dark">Fecha</th>
              <th className="flex-1 flex items-center justify-center h-full p-1 rounded-md text-center font-semibold text-xs md:text-sm text-basic bg-primary-light dark:bg-primary-dark">Entrada</th>
              <th className="flex-1 flex items-center justify-center h-full p-1 rounded-md text-center font-semibold text-xs md:text-sm text-basic bg-primary-light dark:bg-primary-dark">Salida</th>
              <th className="flex-1 flex items-center justify-center h-full p-1 rounded-md text-center font-semibold text-xs md:text-sm text-basic bg-primary-light dark:bg-primary-dark">Horas</th>
            </tr>
          </thead>
          <tbody className="flex flex-col gap-1 w-full">
          {weeks[currentWeek].sessions?.map((session) => (
            <Row key={session._id} session={session} update={setOpenForm}/>
          ))}
          </tbody>
        </table>
      }
      </section>
      <section className="flex items-center justify-end">
        <button type="button" onClick={()=>setOpenAlert(true)} className="flex-1 sm:flex-auto card-btn-red w-fit sm:max-w-52">
          <LuTrash2 className="text-base"/>
          Vaciar
        </button>
      </section>
      <Modal title="Editar Sesión" isOpen={openForm ? true : false} onClose={()=>setOpenForm(undefined)}>
        {openForm && <SessionForm session={openForm} update={fetchSessions}/>}
      </Modal>
      <Modal title="Vaciar semana" isOpen={openAlert} onClose={()=>setOpenAlert(false)}>
        {<DeleteAlert content="¿Estás seguro de que quieres vaciar esta semana?" description="Se eliminaran todos sus registros" onDelete={emptyWeek}/>}
      </Modal>
    </div>
  );
};

function Row({ session, update }:{ session:TypeSession, update:(updateSession:TypeSession)=>void }) {
  return(
    <tr key={session._id} onClick={()=>update(session)} className="flex justify-between items-center h-16 gap-1 overflow-hidden cursor-pointer group duration-300">
      <td className="flex-1 flex items-center justify-center h-full p-1 rounded-md text-center group-hover:bg-primary-light group-hover:dark:bg-primary-dark duration-300">
        <p className="font-semibold text-xs md:text-sm text-basic">{format(session.checkIn, "dd/MM/yyyy", { locale:es })}</p>
      </td>
      <td className="flex-1 flex items-center justify-center h-full p-1 rounded-md text-center group-hover:bg-primary-light group-hover:dark:bg-primary-dark duration-300">
        <p className="font-semibold text-xs md:text-sm text-basic">{format(session.checkIn, "HH:mm", { locale:es })}</p>
      </td>
      <td className={`flex-1 flex items-center justify-center h-full p-1 rounded-md text-center group-hover:bg-primary-light group-hover:dark:bg-primary-dark duration-300`}>
        <p className={`font-semibold text-xs md:text-sm ${session.checkOut ? "text-basic" : "text-red-light dark:text-red-dark"}`}>{session.checkOut ? format(session.checkOut, "HH:mm", { locale:es }) : "Pendiente"}</p>
      </td>
      <td className={`flex-1 flex items-center justify-center h-full p-1 rounded-md text-center group-hover:bg-primary-light group-hover:dark:bg-primary-dark duration-300`}>
        <p className={`font-bold text-xs md:text-sm text-basic`}>{session.hours ? session.hours?.toFixed(2) : 0}</p>
      </td>
    </tr>
  );
};