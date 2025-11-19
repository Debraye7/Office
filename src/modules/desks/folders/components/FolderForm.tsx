import { FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuCheck, LuTrash2 } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import { TypeFolder } from "@shared/utils/types";
import Modal from "@shared/components/Modal";
import DeleteAlert from "@shared/components/DeleteAlert";
import InputText from "@shared/inputs/components/Text";

export default function FolderForm({ value, refresh, closeForm }:{ value?:TypeFolder, refresh:()=>void, closeForm:()=>void, }) {
  const { user } = useAuth();

  const [error, setError] = useState("");
  const [openAlert, setOpenAlert] = useState(false);

  const createFolder = async (title:string) => {
    try {
      const res = await axiosInstance.post(API_PATHS.FOLDERS.CREATE_FOLDER, { title });
      if(res.status === 201) {
        toast.success(res.data.message);
        refresh();
        closeForm();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error(error);
      if(error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      };
    };
  };

  const updateFolder = async (title:string) => {
    if(!value) return;
    try {
      const res = await axiosInstance.put(API_PATHS.FOLDERS.UPDATE_FOLDER(value._id), { title });
      if(res.status === 201) {
        toast.success(res.data.message);
        refresh();
        closeForm();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error(error);
      if(error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      };
    };
  };

  const deleteFolder = async () => {
    if(!value) return;
    try {
      const res = await axiosInstance.delete(API_PATHS.FOLDERS.DELETE_FOLDER(value._id));
      refresh();
      toast.success(res.data.message);
      closeForm();
    } catch (error) {
      if(!isAxiosError(error)) return console.error(error);
      if(error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      };
    };
  };

  const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const title = formData.get("folder")?.toString() || "";

//! Validate form data
    if(!title?.trim()) return setError("Título obligatorio.");

    if(!value) createFolder(title);
    if(value) updateFolder(title);
  };

  return(
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col max-h-full">
      <section className="flex-1 overflow-y-auto">
        <InputText name="folder" label="Título" placeholder="Nombre de la carpeta" defaultValue={value?.title}/>
      </section>
      <section className="flex flex-col sm:flex-row gap-2">
        <p className="flex-1 flex items-center min-h-5 font-medium text-xs text-red-light dark:text-red-dark overflow-hidden">{error}</p>
        <div className="flex flex-wrap-reverse gap-2">
        {user?.role === "owner" && value &&
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
      </section>
      <Modal title="Eliminar Carpeta" isOpen={openAlert} onClose={()=>setOpenAlert(false)}>
        <DeleteAlert
          content="¿Estas seguro de eliminar esta carpeta?"
          description="Se eliminara todo el contenido marcado con esta carpeta"
          error={error}
          onDelete={deleteFolder}
        />
      </Modal>
    </form>
  );
};