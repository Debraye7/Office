"use client"

import { MouseEvent, MouseEventHandler, useState } from "react";
import { format, isAfter, isBefore, isSameMonth, isWithinInterval, startOfToday } from "date-fns";
import { es } from "date-fns/locale";
import { TypeAssignedStatus, TypeEvent } from "@shared/utils/types";
import Modal from "@shared/components/Modal";
import AvatarGroup from "@users/components/AvatarGroup";
import EventDetails from "@events/components/EventDetails";
import { PROFILE_PICTURE } from "@shared/utils/data";
import { LuCircleCheck, LuCircleX } from "react-icons/lu";
import { useAuth } from "@/src/shared/context/AuthContext";
import axiosInstance from "@/src/shared/utils/axiosInstance";
import { API_PATHS } from "@/src/shared/utils/apiPaths";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

export default function EventCard({ date, event, refresh }:{ date:Date, event:TypeEvent, refresh:()=>void }) {
  const { user } = useAuth();

  const { folder, title, description, allDay, start, end, assignedTo } = event;
  const avatars = assignedTo.map((user) => ({ name:user.assigned.name||"", status:user.status, img:user.assigned.profileImageUrl||PROFILE_PICTURE }));
  const currentStatus = assignedTo.find(assigned => assigned.assigned._id === user?._id)?.status || "pending";

  const [openModal, setOpenModal] = useState(false);

  const handleConfirmation = async (e:MouseEvent, status:TypeAssignedStatus) => {
    e.stopPropagation();
    try {
      const index = assignedTo.findIndex(assigned => assigned.assigned._id === user?._id);
      assignedTo[index].status = currentStatus === status ? "pending" : status;
      const res = await axiosInstance.patch(API_PATHS.EVENTS.UPDATE_EVENT(event.originalEventId || ""), { assignedTo });
      if(res.status === 200) {
        toast.success(res.data.message);
        refresh();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error fetching accounts:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    }
  };

  return(
    <>
      <li onClick={()=>setOpenModal(true)} className={`flex flex-col gap-3 h-full bg-secondary-light dark:bg-secondary-dark hover:bg-transparent dark:hover:bg-transparent rounded-xl py-4 border border-tertiary-light dark:border-tertiary-dark shadow-md shadow-quaternary dark:shadow-secondary-dark cursor-pointer duration-300 ${isSameMonth(start, date) && isAfter(end, startOfToday()) ? "opacity-100" : "opacity-25 hover:opacity-100" }`}>
        <div className="flex items-center justify-between gap-4 mx-4">
          <span className="w-fit px-2 sm:px-4 py-0.5 rounded bg-blue-light/20 dark:bg-blue-dark/20">
            <p className="line-clamp-1 font-semibold text-xs text-blue-light dark:text-blue-dark">{folder.title}</p>
          </span>
          {/* <input onClick={(e)=>e.stopPropagation()} type="checkbox" name="" id="" className="self-start size-5"/> */}
        {user && assignedTo.some(assigned => assigned.assigned._id === user._id) &&
          <div className="flex items-center justify-center gap-2">
            <button onClick={(e)=>handleConfirmation(e, "accepted")} className={`flex items-center justify-center ${currentStatus === "accepted" ? "text-green-light dark:text-green-dark hover:text-primary-dark dark:hover:text-primary-light" : "text-primary-dark dark:text-primary-light hover:text-green-light dark:hover:text-green-dark"} duration-300`}>
              <LuCircleCheck className="text-xl"/>
            </button>
            <button onClick={(e)=>handleConfirmation(e, "declined")} className={`flex items-center justify-center ${currentStatus === "declined" ? "text-red-light dark:text-red-dark hover:text-primary-dark dark:hover:text-primary-light" : "text-primary-dark dark:text-primary-light hover:text-red-light dark:hover:text-red-dark"} duration-300`}>
              <LuCircleX className="text-xl"/>
            </button>
          </div>
        }
        </div>
        <div className={`flex flex-col gap-0.5 px-4 mr-4 border-l-[3px] ${isBefore(start, startOfToday()) && isBefore(end, startOfToday()) ? "border-red-light dark:border-red-dark" : isWithinInterval(date, { start, end }) ? "border-green-light dark:border-green-dark" : isSameMonth(start, date) ? "border-yellow-light dark:border-yellow-dark" : "border-primary-dark dark:border-primary-light"}`}>
          <p className="line-clamp-1 font-semibold text-sm text-basic">{title}</p>
          <p className="line-clamp-1 leading-[18px] text-xs text-quaternary">{description}</p>
        </div>
        <div className="flex items-center justify-between my-1 mx-4">
          <div className="">
            <label className="font-medium text-xs text-quaternary">Inicio</label>
            <p className="font-medium text-[13px] text-tertiary-dark dark:text-tertiary-light">{format(start, "dd/MM/yyyy", { locale:es })}</p>
            {!allDay && <p className="font-medium text-[13px] text-tertiary-dark dark:text-tertiary-light">{format(start, "hh:mm:ss a", { locale:es })}</p>}
          </div>
          <div className="">
            <label className="font-medium text-xs text-quaternary">Final</label>
            <p className="font-medium text-[13px] text-tertiary-dark dark:text-tertiary-light">{format(end, "dd/MM/yyyy", { locale:es })}</p>
            {!allDay && <p className="font-medium text-[13px] text-tertiary-dark dark:text-tertiary-light">{format(end, "hh:mm:ss a", { locale:es })}</p>}
          </div>
        </div>
        <div className="flex items-center justify-between mx-4">
          <AvatarGroup avatars={avatars} maxVisible={3}/>
        </div>
      </li>
      <Modal title={title} isOpen={openModal} onClose={()=>setOpenModal(false)}>
        {openModal && <EventDetails event={event} avatars={avatars} refresh={refresh}/>}
      </Modal> 
    </>
  );
};