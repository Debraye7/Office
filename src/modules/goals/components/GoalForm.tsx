import { FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import { parseISO } from "date-fns";
import toast from "react-hot-toast";
import { LuCheck, LuTrash2 } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import { TypeAssigned, TypeFolder, TypeGoal, TypeObjective } from "@shared/utils/types";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import { PRIORITY_DATA } from "@shared/utils/data";
import Modal from "@shared/components/Modal";
import DeleteAlert from "@shared/components/DeleteAlert";
import SelectDropdown from "@shared/inputs/components/Dropdown";
import InputText from "@shared/inputs/components/Text";
import Textarea from "@shared/inputs/components/Textarea";
import InputDate from "@shared/inputs/components/Date";
import AssignedSelect from "@shared/inputs/components/Assigned";
import FolderSelect from "@folders/components/FolderSelect";
import ObjectivesInput from "@goals/components/ObjectivesInput";

export default function GoalForm({ values, refresh }:{ values?:TypeGoal, refresh:()=>void }) {
  const { user } = useAuth();

  const [priority, setPriority] = useState<string>(values ? values.priority : "Baja");
  const [assignedTo, setAssignedTo] = useState<TypeAssigned[]>(values ? values.assignedTo : []);
  const [objectives, setObjectives] = useState<TypeObjective[]>(values ? values.objectives : []);
  const [folder, setFolder] = useState<TypeFolder|undefined>(values?.folder);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const createGoal = async (data:{ title:string, description:string, dueDate:Date }) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post(API_PATHS.GOALS.CREATE_GOAL, { ...data, folder:folder?._id, priority, assignedTo, objectives });
      if(res.status === 201) {
        toast.success(res.data.message);
        refresh();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error(error);
      if(error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      };
    } finally {
      setLoading(false);
    };
  };

  const updateGoal = async (data:{ title:string, description:string, dueDate:Date }) => {
    if(!values) return;
    setLoading(true);
    try {
      const res = await axiosInstance.put(API_PATHS.GOALS.UPDATE_GOAL(values._id), { ...data, folder:folder?._id, priority, assignedTo, objectives });
      if(res.status === 201) {
        toast.success(res.data.message);
        refresh();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error(error);
      if(error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      };
    } finally {
      setLoading(false);
    };
  };

  const deleteGoal = async () => {
    if(!values) return;
    setLoading(true);
    try {
      const res = await axiosInstance.delete(API_PATHS.GOALS.DELETE_GOAL(values._id));
      if(res.status === 200) {
        toast.success(res.data.message);
        refresh();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error deleting goal:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    } finally {
      setLoading(false);
    };
  };

  const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title')?.toString() || "";
    const description = formData.get('description')?.toString() || "";
    const date = formData.get('due-date')?.toString() || undefined;
    const dueDate = date ? parseISO(date) : undefined;

//! Validate form data
    if(!title?.trim()) return setError("Título obligatorio.");
    if(!dueDate) return setError("Fecha de final obligatoria.");
    if(assignedTo.length < 1) return setError("Asignada al menos un miembro.");
    if(objectives.length < 1) return setError("Añade al menos un objetivo.");
    if(!folder) return setError("Selecciona una carpeta.");

    if(!values) createGoal({ title, description, dueDate });
    if(values) updateGoal({ title, description, dueDate });
  };

  return(
    <form onSubmit={(e) => handleSubmit(e)} className="flex-1 flex flex-col gap-4 max-h-full">
      <div className="flex-1 flex flex-col gap-4 pr-4 overflow-y-auto overflow-x-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FolderSelect
            label
            selectedFolder={folder}
            setSelectedFolder={(selectedFolder:TypeFolder|undefined)=>setFolder(selectedFolder)}
          />
          <AssignedSelect
            label
            selectedUsers={assignedTo}
            setSelectedUsers={(assignedToList:TypeAssigned[])=>setAssignedTo(assignedToList)}
          />
          <SelectDropdown
            label="Prioridad"
            options={PRIORITY_DATA}
            placeholder="Seleccionar prioridad"
            defaultValue={values?.priority || PRIORITY_DATA[0].value}
            handleValue={(value:string)=>setPriority(value)}
          />
          <InputDate
            name="due-date"
            label="Fecha final"
            defaultValue={values?.dueDate ? values.dueDate : new Date()}
          />
        </div>
        <InputText
          name="title"
          label="Título"
          placeholder="Título de la meta"
          defaultValue={values?.title || ""}
        />
        <Textarea
          name="description"
          label="Descripción"
          placeholder="Descripción de la meta"
          defaultValue={values?.description || ""}
        />
        <ObjectivesInput
          list={objectives}
          setList={(list:TypeObjective[]) => setObjectives(list)}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <p className="flex-1 flex items-center min-h-2 font-medium text-xs text-red-light dark:text-red-dark overflow-hidden">{error}</p>
        <div className="flex flex-wrap-reverse gap-2">
        {user?.role === "owner" && values && 
          <button type="button" onClick={()=>setOpenAlert(true)} className="flex-1 sm:flex-auto card-btn-red w-fit sm:min-w-52">
            <LuTrash2 className="text-xl"/>
            Eliminar
          </button>
        }
          <button type="submit" disabled={loading} className="flex-1 sm:flex-auto card-btn-fill w-fit sm:min-w-52">
            <LuCheck className="text-xl"/>
            Confirmar
          </button>
        </div>
      </div>
      <Modal title="Eliminar Meta" isOpen={openAlert} onClose={()=>setOpenAlert(false)}>
        {<DeleteAlert content="¿Estás seguro de que quieres eliminar esta meta?" onDelete={deleteGoal}/>}
      </Modal>
    </form>
  );
};