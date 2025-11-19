import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { LuPencil } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import { TypeEvent } from "@shared/utils/types";
import Modal from "@shared/components/Modal";
import AvatarGroup from "@users/components/AvatarGroup";
import EventForm from "@events/components/EventForm";

export default function EventDetails({ event, avatars, refresh }:{ event:TypeEvent, avatars:{ name:string, img:string }[], refresh:()=>void }) {
  const { user } = useAuth();

  const [openForm, setOpenForm] = useState(false);

  return(
    <div className="flex-1 flex flex-col gap-4 max-h-full">
      <div className="flex flex-col gap-2">
        <span className="w-fit px-5 py-1.5 rounded bg-blue-light/20 dark:bg-blue-dark/20">
          <p className="line-clamp-1 font-semibold text-xs text-blue-light dark:text-blue-dark">{event.folder.title}</p>
        </span>
        <div>
          <AvatarGroup avatars={avatars} maxVisible={10}/>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 my-1 mx-4">
        <div className="">
          <label className="font-medium text-xs text-quaternary">Inicio</label>
          <p className="font-medium text-[13px] text-tertiary-dark dark:text-tertiary-light">{format(event.start, "dd/MM/yyyy", { locale:es })}</p>
          <p className="font-medium text-[13px] text-tertiary-dark dark:text-tertiary-light">{format(event.start, "hh:mm:ss a", { locale:es })}</p>
        </div>
        <div className="">
          <label className="font-medium text-xs text-quaternary">Final</label>
          <p className="font-medium text-[13px] text-tertiary-dark dark:text-tertiary-light">{format(event.end, "dd/MM/yyyy", { locale:es })}</p>
          <p className="font-medium text-[13px] text-tertiary-dark dark:text-tertiary-light">{format(event.end, "hh:mm:ss a", { locale:es })}</p>
        </div>
      </div>
      <textarea readOnly defaultValue={event.description} placeholder="Sin descripción" className="flex-1 p-4 rounded font-medium text-lg bg-secondary-light dark:bg-secondary-dark border border-tertiary-light dark:border-tertiary-dark overflow-y-auto"/>
    {user && (user.role === "owner" || user.role === "admin") &&
      <div className="flex flex-row sm:flex-col items-end">
        <button type="button" onClick={()=>setOpenForm(true)} className="flex-1 sm:flex-auto card-btn-fill w-fit sm:min-w-52">
          <LuPencil className="text-xl"/>
          Editar
        </button>
      </div>
    }
    <Modal title={"Editar Evento"} isOpen={openForm} onClose={()=>setOpenForm(false)}>
      {openForm && <EventForm values={event} closeForm={()=>setOpenForm(false)} refresh={refresh}/>}
    </Modal>
    </div>
  );
};