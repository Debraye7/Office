import { FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import { parseISO } from "date-fns";
import toast from "react-hot-toast";
import { LuCheck, LuTrash2 } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import { TypeFolder, TypeReport } from "@shared/utils/types";
import Modal from "@shared/components/Modal";
import DeleteAlert from "@shared/components/DeleteAlert";
import TextInput from "@shared/inputs/components/Text";
import Textarea from "@shared/inputs/components/Textarea";
import DateInput from "@shared/inputs/components/Date";
import FolderSelect from "@folders/components/FolderSelect";

export default function ReportForm({ values, onClose, refresh }:{ values?:TypeReport, onClose:()=>void, refresh:()=>void }) {
  const { user } = useAuth();

  const [folder, setFolder] = useState<TypeFolder|undefined>(values?.folder);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const createReport = async (data:{ title:string, description:string, date:Date }) => {
    try {
      const res = await axiosInstance.post(API_PATHS.REPORTS.CREATE_REPORT, { ...data, folder:folder?._id });
      if(res.status === 201) {
        toast.success(res.data.message);
        refresh();
        onClose();
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

  const updateReport = async (data:{ title:string, description:string, date:Date }) => {
    if(!values) return;
    try {
      const res = await axiosInstance.put(API_PATHS.REPORTS.UPDATE_REPORT(values?._id), { ...data, folder:folder?._id });
      if(res.status === 201) {
        toast.success(res.data.message);
        refresh();
        onClose();
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

  const deleteReport = async () => {
    if(!values) return;
    try {
      const res = await axiosInstance.delete(API_PATHS.REPORTS.DELETE_REPORT(values._id));
      if(res.status === 200) {
        toast.success(res.data.message);
        refresh();
        onClose();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error deleting desk:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    };
  };

  const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title')?.toString() || "";
    const description = formData.get('description')?.toString() || "";
    const stringDate = formData.get('date')?.toString() || undefined;
    const date = stringDate ? parseISO(stringDate) : undefined;

//! Validate form data
    if(!title?.trim()) return setError("Título obligatorio.");
    if(!date) return setError("Fecha obligatoria.");
    if(!folder) return setError("Selecciona una carpeta.");

    if(!values) createReport({ title, description, date });
    if(values) updateReport({ title, description, date });
  };

  return(
    <form onSubmit={(e) => handleSubmit(e)} className="flex-1 flex flex-col gap-4 max-h-full">
      <div className="flex-1 flex flex-col gap-4 pr-4 overflow-y-auto">
        <TextInput
          name="title"
          label="Título"
          placeholder="Título del reporte"
          defaultValue={values?.title || ""}
        />
        <Textarea
          name="description"
          label="Descripción"
          placeholder="Descripción del reporte"
          defaultValue={values?.description || ""}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FolderSelect
            label
            selectedFolder={folder}
            setSelectedFolder={(selectedFolder:TypeFolder|undefined)=>setFolder(selectedFolder)}
          />
          <DateInput
            name="date"
            label="Fecha"
            defaultValue={values ? values.date : new Date()}
          />
        </div>
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
      <Modal title="Eliminar Reporte" isOpen={openAlert} onClose={()=>setOpenAlert(false)}>
        {<DeleteAlert content="¿Estás seguro de que quieres eliminar este reporte?" onDelete={deleteReport}/>}
      </Modal>
    </form>
  );
};