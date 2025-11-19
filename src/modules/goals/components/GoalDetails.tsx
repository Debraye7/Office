import { useState } from "react";
import { isAxiosError } from "axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";
import { LuPencil } from "react-icons/lu";
import { TypeGoal } from "@shared/utils/types";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import Modal from "@shared/components/Modal";
import AvatarGroup from "@users/components/AvatarGroup";
import GoalForm from "@goals/components/GoalForm";
import { PROFILE_PICTURE } from "@shared/utils/data";
import ObjectiveItem from "./ObjectiveItem";

export default function Goal({ goal, refresh }:{ goal:TypeGoal, refresh:()=>void }) {
  const { _id, folder, description, priority, status, createdAt, updatedAt, dueDate, assignedTo, objectives  } = goal;
  const selectedUsersAvatars = assignedTo.map((assigned) => ({ name:assigned.name||"", img:assigned.profileImageUrl||PROFILE_PICTURE }));

  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);

  const getStatusTagColor = () => {
    switch (status) {
      case "Pendiente":
        return "text-red-light dark:text-red-dark bg-red-light/20 dark:bg-red-dark/20 border-red-light dark:border-red-dark";
      case "En curso":
        return "text-yellow-light dark:text-yellow-dark bg-yellow-light/20 dark:bg-yellow-dark/20 border-yellow-light dark:border-yellow-dark";
      case "Finalizada":
        return "text-green-light dark:text-green-dark bg-green-light/20 dark:bg-green-dark/20 border-green-light dark:border-green-dark";
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

  
  const updateObjective = async (index:number) => {
    setLoading(true);
    const newObjectives = objectives;
    newObjectives[index].completed = !newObjectives[index].completed;
    newObjectives[index].dueDate = newObjectives[index].completed === true ? new Date() : undefined;
    try {
      const res = await axiosInstance.put(API_PATHS.GOALS.UPDATE_OBJECTIVES(_id), { objectives:newObjectives });
      if(res.status === 201) {
        toast.success(res.data.message);
        refresh();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error updating objective:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    } finally {
      setLoading(false);
    };
  };

  const onRefresh = () => {
    refresh();
    setOpenForm(false);
  };

  return(
    <div className="flex-1 flex flex-col gap-5 max-h-full">
      <article className="flex-1 flex flex-col gap-6 w-full overflow-y-auto">
        <section className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-4 py-1 rounded bg-blue-light/20 dark:bg-blue-dark/20">
            <p className="line-clamp-1 font-semibold text-xs text-blue-light dark:text-blue-dark">{folder.title}</p>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <p className={`w-fit px-4 py-1 rounded text-nowrap font-semibold text-xs ${getPriorityTagColor()}`}>{priority}</p>
            <p className={`w-fit px-4 py-1 rounded text-nowrap font-semibold text-xs ${getStatusTagColor()}`}>{status}</p>
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <div className="info-box">
            <label className="info-box-label">Descripción</label>
            <p className="info-box-value">{description}</p>
          </div>
          <div className="info-box">
            <label className="info-box-label">Asignados</label>
            <AvatarGroup avatars={selectedUsersAvatars} maxVisible={5}/>
          </div>
        </section>
        <section className="flex flex-wrap gap-4">
          <div className="info-box">
            <label className="info-box-label">Fecha Inicial</label>
            <p className="info-box-value">{createdAt && format(createdAt, "dd/MM/yyyy", { locale:es })}</p>
          </div>
          <div className="info-box">
            <label className="info-box-label">Fecha de actualización</label>
            <p className="info-box-value">{updatedAt && format(updatedAt, "dd/MM/yyyy", { locale:es })}</p>
          </div>
          <div className="info-box">
            <label className="info-box-label">Fecha Final</label>
            <p className="info-box-value">{dueDate && format(dueDate, "dd/MM/yyyy", { locale:es })}</p>
          </div>
        </section>
        <section className="flex flex-col gap-2 w-full">
          <label className="font-semibold text-xs text-quaternary">Objetivos</label>
          <div className="flex flex-col gap-4">
          {objectives.map((obj, index) => (
            <ObjectiveItem key={index} loading={loading} objective={obj} onChange={()=>updateObjective(index)}/>
          ))}
          </div>
        </section>
      </article>
      <div className="flex justify-end">
        <button type="button" onClick={()=>setOpenForm(true)} className="card-btn-fill">
          <LuPencil className="text-base"/>
          Editar
        </button>
      </div>
      <Modal title="Editar Meta" isOpen={openForm} onClose={()=>setOpenForm(false)}>
        {openForm && <GoalForm values={goal} refresh={onRefresh}/>}
      </Modal>
    </div>
  );
};