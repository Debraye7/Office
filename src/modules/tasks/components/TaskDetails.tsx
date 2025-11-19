import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuCheck, LuPencil } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import { API_PATHS } from "@shared/utils/apiPaths";
import axiosInstance from "@shared/utils/axiosInstance";
import { TypeTask } from "@shared/utils/types";
import Modal from "@shared/components/Modal";
import Attachment from "@tasks/components/AttachmentItem";
import AvatarGroup from "@users/components/AvatarGroup";
import Todo from "@tasks/components/TodoItem";
import FormTask from "@tasks/components/TaskForm";
import { PROFILE_PICTURE } from "@shared/utils/data";

export default function Task({ task, refresh }:{ task:TypeTask, refresh:()=>void }) {
  const { user } = useAuth();
  const { _id, description, status, priority, folder, todoChecklist, attachments, assignedTo, dueDate, updatedAt, createdAt } = task;

  const [taskForm, setTaskForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateTodoChecklist = async (index:number) => {
    setLoading(true);
    const newTodoChecklist = todoChecklist;
    newTodoChecklist[index].completed = !newTodoChecklist[index].completed;
    try {
      const res = await axiosInstance.put(API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(_id), { todoChecklist:newTodoChecklist });
      if(res.status === 201) {
        toast.success(res.data.message);
        refresh();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error(error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    } finally {
      setLoading(false);
    };
  };

  const getStatusTagColor = (status?:string) => {
    switch (status) {
      case "Pendiente":
        return "text-red-light dark:text-red-dark bg-red-light/10 dark:bg-red-dark/10";
      case "En curso":
        return "text-yellow-light dark:text-yellow-dark bg-yellow-light/10 dark:bg-yellow-dark/10";
      case "Finalizada":
        return "text-green-light dark:text-green-dark bg-green-light/10 dark:bg-green-dark/10";
      case "Aprobada":
        return "text-blue-light dark:text-blue-dark bg-blue-light/10 dark:bg-blue-dark/10";
      default:
        return "text-quaternary bg-quaternary/10";
    };
  };

  const getPriorityTagColor = (priority?:string) => {
    switch (priority) {
      case "Alta":
        return "text-red-light dark:text-red-dark bg-red-light/10 dark:bg-red-dark/10";
      case "Media":
        return "text-yellow-light dark:text-yellow-dark bg-yellow-light/10 dark:bg-yellow-dark/10";
      case "Baja":
        return "text-green-light dark:text-green-dark bg-green-light/10 dark:bg-green-dark/10";
      default:
        return "text-quaternary bg-quaternary/10";
    };
  };

  const approveTask = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.patch(API_PATHS.TASKS.APPROVE_TASK(_id));
      if(res.status === 200) {
        refresh();
        toast.success(res.data.message);
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error(error);
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
    setTaskForm(false);
  };

  return(
    <>
      <div className="flex-1 flex flex-col gap-5 pr-4 max-w-full overflow-x-hidden overflow-y-auto">
        <div className="flex justify-center">
          <article className="flex flex-col gap-4 w-full">
            <section className="flex flex-wrap items-center justify-between gap-2 ">
              <span className="px-5 py-1.5 rounded bg-blue-light/20 dark:bg-blue-dark/20">
                <p className="line-clamp-1 font-semibold text-xs text-blue-light dark:text-blue-dark">{folder.title}</p>
              </span>
              <div className="flex-1 sm:flex-none flex items-center justify-end gap-2">
                <p className={`flex-1 sm:flex-none w-fit px-4 py-1 rounded text-center text-nowrap font-semibold text-xs ${getStatusTagColor(status)}`}>{status}</p>
                <p className={`flex-1 sm:flex-none w-fit px-4 py-1 rounded text-center text-nowrap font-semibold text-xs ${getPriorityTagColor(priority)}`}>{priority}</p>
              </div>
            </section>
            <section className="flex flex-col gap-4">
              <div className="info-box">
                <label className="info-box-label">Descripción</label>
                <p className="info-box-value">{description}</p>
              </div>
              <div className="info-box">
                <label className="info-box-label">Asignados</label>
                <AvatarGroup avatars={assignedTo.map(assigned => ({ name:assigned.name||"", img:assigned.profileImageUrl||PROFILE_PICTURE })) || []} maxVisible={10}/>
              </div>
            </section>
            <section className="flex flex-wrap gap-4">
              <div className="info-box">
                <label className="info-box-label">Fecha Inicial</label>
                <p className="info-box-value">{createdAt && format(createdAt, "dd/MM/yyyy", { locale:es })}</p>
              </div>
              <div className="info-box">
                <label className="info-box-label">Fecha de Actualización</label>
                <p className="info-box-value">{updatedAt && format(updatedAt, "dd/MM/yyyy", { locale:es })}</p>
              </div>
              <div className="info-box">
                <label className="info-box-label">Fecha Final</label>
                <p className="info-box-value">{dueDate && format(dueDate, "dd/MM/yyyy", { locale:es })}</p>
              </div>
            </section>
            <section className="flex flex-col gap-2 w-full">
              <label className="font-semibold text-xs text-quaternary">Pendientes</label>
              <div className="flex flex-col">
              {todoChecklist.map((todo, index) => (
                <Todo
                  key={`todo_${index}`}
                  text={todo.text}
                  check={todo.completed}
                  onChange={() => updateTodoChecklist(index)}
                  loading={loading}
                />
              ))}
              </div>
            </section>
            <section className={`w-full ${attachments.length < 1 && "hidden"}`}>
              <label className="font-semibold text-xs text-quaternary">Anexos</label>
              <div className="flex flex-col">
              {attachments.map((item, index) => (
                <Attachment key={`attachment_${index}`} attachment={item}/>
              ))}
              </div>
            </section>
          </article>
        </div>
      </div>
    {user && (user.role === "owner" || user.role === "admin") &&
      <div className="w-full flex justify-center">
        <div className="flex flex-wrap justify-end gap-2 w-full max-w-[1750px] px-3">
        {user.role === "owner" && task.status === "Finalizada" &&
          <button type="button" onClick={approveTask} className="flex-1 sm:flex-auto card-btn-fill w-fit sm:max-w-52">
            <LuCheck className="text-base"/>
            Aprobar
          </button>
        }
          <button type="button" onClick={()=>setTaskForm(true)} className="flex-1 sm:flex-auto card-btn-fill w-fit sm:max-w-52">
            <LuPencil className="text-base"/>
            Editar
          </button>
        </div>
      </div>
    }
      <Modal title="Editar Tarea" isOpen={taskForm} onClose={()=>setTaskForm(false)}>
        {task && taskForm && <FormTask values={task} refresh={onRefresh}/>}
      </Modal>
    </>
  );
};