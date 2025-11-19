import { FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuCheck, LuTrash2 } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import { TypeSession } from "@shared/utils/types";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import Modal from "@shared/components/Modal";
import DeleteAlert from "@shared/components/DeleteAlert";
import TimeInput from "@shared/inputs/components/Time";

export default function SessionForm({ session, update }:{ session:TypeSession, update:()=>void }) {
  const { user } = useAuth();

  const [error, setError] = useState("");
  const [openAlert, setOpenAlert] = useState(false);

  const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const checkInTime = `${formData.get('check-in')}` || "";
    const checkOutTime = `${formData.get('check-out')}` || "";

    if(!checkInTime || !checkOutTime) return setError("Entrada y salida requeridos");

    const checkIn = new Date(
      new Date(session.checkIn).getFullYear(),
      new Date(session.checkIn).getMonth(),
      new Date(session.checkIn).getDate(),
      Number(checkInTime.split(":")[0]),
      Number(checkInTime.split(":")[1]),
    );

    const checkOut = new Date(
      new Date(session.checkIn).getFullYear(),
      new Date(session.checkIn).getMonth(),
      new Date(session.checkIn).getDate(),
      Number(checkOutTime.split(":")[0]),
      Number(checkOutTime.split(":")[1]),
    );

    try {
      const res = await axiosInstance.put(API_PATHS.SESSIONS.UPDATE_SESSION(session._id), { checkIn, checkOut });
      if(res.status === 201) {
        toast.success(res.data.message);
        update();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error deleting desk:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
        setError(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    };
  };

  const deleteSession = async () => {
    try {
      const res = await axiosInstance.delete(API_PATHS.SESSIONS.DELETE_SESSION(session._id));
      if(res.status === 200) {
        toast.success(res.data.message);
        update();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error deleting desk:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
        setError(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    };
  };

  return(
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
      <section className="flex-1 flex flex-col gap-4 pr-4 overflow-y-auto">
        <TimeInput name="check-in" label="Entrada" defaultValue={session.checkIn}/>
        <TimeInput name="check-out" label="Salida" defaultValue={session.checkOut ? session.checkOut : undefined}/>
      </section>
      <div className="flex flex-col sm:flex-row gap-2">
        <p className="flex-1 flex items-center min-h-2 font-medium text-xs text-red-light dark:text-red-dark overflow-hidden">{error}</p>
        <div className="flex flex-wrap-reverse gap-2">
        {user?.role === "owner" && 
          <button type="button" onClick={()=>setOpenAlert(true)} className="flex-1 sm:flex-auto card-btn-red w-fit sm:min-w-52">
            <LuTrash2 className="text-xl"/>
            Eliminar
          </button>
        }
          <button type="submit" className="flex-1 sm:flex-auto card-btn-fill w-fit sm:min-w-52">
            <LuCheck className="text-xl"/>
            Confirmar
          </button>
        </div>
      </div>
      <Modal title="Eliminar Sesión" isOpen={openAlert} onClose={()=>setOpenAlert(false)}>
        {<DeleteAlert content="¿Estás seguro de que quieres eliminar esta sesión?" onDelete={deleteSession}/>}
      </Modal>
    </form>
  );
};