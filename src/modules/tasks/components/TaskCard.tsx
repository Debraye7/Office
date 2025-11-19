import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { IoLink } from "react-icons/io5";
import { TypeTask } from "@shared/utils/types";
import Modal from "@shared/components/Modal";
import AvatarGroup from "@users/components/AvatarGroup";
import Progress from "@tasks/components/ProgressBar";
import Task from "@tasks/components/TaskDetails";
import { PROFILE_PICTURE } from "@shared/utils/data";

export default function TaskCard({ task, refresh }:{ task:TypeTask, refresh:()=>void }) {
  const { folder, title, description, priority, status, progress, createdAt, updatedAt, dueDate, assignedTo, attachments, completedTodoCount, todoChecklist  } = task;
  const selectedUsersAvatars = assignedTo.map((assigned) => ({ name:assigned.name||"", img:assigned.profileImageUrl||PROFILE_PICTURE}));

  const [openModal, setOpenModal] = useState(false);

  const getStatusTagColor = () => {
    switch (status) {
      case "Pendiente":
        return "text-red-light dark:text-red-dark bg-red-light/20 dark:bg-red-dark/20 border-red-light dark:border-red-dark";
      case "En curso":
        return "text-yellow-light dark:text-yellow-dark bg-yellow-light/20 dark:bg-yellow-dark/20 border-yellow-light dark:border-yellow-dark";
      case "Finalizada":
        return "text-green-light dark:text-green-dark bg-green-light/20 dark:bg-green-dark/20 border-green-light dark:border-green-dark";
      case "Aprobada":
        return "text-blue-light dark:text-blue-dark bg-blue-light/10 dark:bg-blue-dark/10";
      default:
        return "text-quaternary bg-quaternary/25 border-quaternary";
    }
  };

  const getPriorityTagColor = () => {
    switch (priority) {
      case "Alta":
        return "text-red-light dark:text-red-dark bg-red-light/20 dark:bg-red-dark/20 border-red-light dark:border-red-dark";
      case "Media":
        return "text-yellow-light dark:text-yellow-dark bg-yellow-light/20 dark:bg-yellow-dark/20 border-yellow-light dark:border-yellow-dark";
      case "Baja":
        return "text-green-light dark:text-green-dark bg-green-light/20 dark:bg-green-dark/20 border-green-light dark:border-green-dark";
      default:
        return "text-quaternary bg-quaternary/25 border-quaternary";
    }
  };

  return(
    <>
      <li onClick={()=>setOpenModal(true)} className="flex flex-col gap-3 h-full bg-secondary-light dark:bg-secondary-dark hover:bg-transparent rounded-xl py-4 border border-tertiary-light dark:border-tertiary-dark shadow-md shadow-quaternary dark:shadow-secondary-dark cursor-pointer duration-300">
        <section className="flex flex-wrap md:flex-nowrap justify-between gap-x-4 gap-y-2 px-4">
          <span className="max-h-fit px-2 sm:px-4 py-0.5 rounded bg-blue-light/20 dark:bg-blue-dark/20">
            <p className="line-clamp-1 font-semibold text-xs text-blue-light dark:text-blue-dark">{folder.title}</p>
          </span>
          <div className="flex flex-wrap md:flex-nowrap items-end gap-1">
            <p className={`max-h-fit px-2 sm:px-4 py-0.5 rounded text-nowrap font-semibold text-xs ${getStatusTagColor()}`}>{status}</p>
            <p className={`max-h-fit px-2 sm:px-4 py-0.5 rounded text-nowrap font-semibold text-xs ${getPriorityTagColor()}`}>{priority}</p>
          </div>
        </section>
        <section className={`flex flex-col gap-0.5 px-4 border-l-[3px] ${status === "Pendiente" ? "border-red-dark" : status === "En curso" ? "border-yellow-dark" : "border-green-dark"}`}>
          <p className="line-clamp-1 font-semibold text-sm text-basic">{title}</p>
          <p className="line-clamp-1 leading-[18px] text-xs text-quaternary">{description}</p>
        </section>
        <section className="flex flex-col gap-2 px-4">
          <p className="leading-[18px] font-semibold text-[13px] text-tertiary-dark dark:text-tertiary-light">
            Pendientes:{" "}
            <span className="rounded px-2.5 py-0.5 bg-tertiary-light dark:bg-tertiary-dark">{completedTodoCount} / {todoChecklist?.length || 0}</span>
          </p>
          <Progress progress={progress <= 2 ? "2%" : `${progress}%`} color={progress < 26 ? "red" : progress < 51 ? "orange" : progress < 100 ? "yellow" : "green"}/>
        </section>
        <section className="flex-1 px-4 flex flex-col gap-2">
          <div className="flex-1 flex flex-wrap items-center justify-between gap-1.5">
            <div className="">
              <label className="font-medium text-xs text-quaternary">Inicio</label>
              <p className="font-medium text-[13px] text-tertiary-dark dark:text-tertiary-light">{createdAt && format(createdAt, "dd/MM/yyyy", { locale:es })}</p>
            </div>
            <div className="">
              <label className="font-medium text-xs text-quaternary">Actualizada</label>
              <p className="font-medium text-[13px] text-tertiary-dark dark:text-tertiary-light">{updatedAt && format(updatedAt, "dd/MM/yyyy", { locale:es })}</p>
            </div>
            <div className="">
              <label className="font-medium text-xs text-quaternary">Final</label>
              <p className="font-medium text-[13px] text-tertiary-dark dark:text-tertiary-light">{dueDate && format(dueDate, "dd/MM/yyyy", { locale:es })}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <AvatarGroup avatars={selectedUsersAvatars || []} maxVisible={5}/>
          {attachments.length > 0 &&
            <div className="flex items-center gap-2 bg-primary-dark dark:bg-primary-light px-2.5 py-1.5 rounded-lg">
              <IoLink className="text-primary-light dark:text-primary-dark"/>
              <span className="font-semibold text-xs text-primary-light dark:text-primary-dark">{` ${attachments.length}`}</span>
            </div>
          }
          </div>
        </section>
      </li>
      <Modal title={title} isOpen={openModal} onClose={()=>setOpenModal(false)}>
        <Task task={task} refresh={refresh}/>
      </Modal>
    </>
  );
};