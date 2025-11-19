import { FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuCheck, LuTrash2 } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import { TypeCategory } from "@shared/utils/types";
import Modal from "@shared/components/Modal";
import DeleteAlert from "@shared/components/DeleteAlert";
import InputText from "@shared/inputs/components/Text";
import IconSelect from "@categories/components/IconSelect";

export default function CategoryForm({ type, values, refresh }:{ type:"transaction"|"product"|"movement"|"item", values?:TypeCategory, refresh:()=>void }) {
  const { user } = useAuth();

  const [icon, setIcon] = useState<number|undefined>();
  const [error, setError] = useState("");
  const [openAlert, setOpenAlert] = useState(false);

  const createCategory = async (label:string) => {
    try {
      const res = await axiosInstance.post(API_PATHS.CATEGORIES.CREATE_CATEGORY, { type, icon, label });
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
    };
  };

  const updateCategory = async (label:string) => {
    if(!values) return;
    try {
      const res = await axiosInstance.put(API_PATHS.CATEGORIES.UPDATE_CATEGORY(values._id), { icon, label });
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
    };
  };

  const deleteCategory = async () => {
    if(!values) return;
    try {
      const res = await axiosInstance.delete(API_PATHS.CATEGORIES.DELETE_CATEGORY(values._id));
      if(res.status === 200) {
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
    };
  };

  const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const label = formData.get("category")?.toString() || "";

//! Validate form data
    if(!icon || icon < 1) return setError("Icono obligatorio.");
    if(!label?.trim()) return setError("Título obligatorio.");

    if(!values) createCategory(label);
    if(values) updateCategory(label);
  };

  return(
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col max-h-full">
      <section className="flex-1 flex flex-col gap-5 overflow-y-auto">
        <InputText name="category" label="Título" placeholder="Nombre de la categoría" defaultValue={values?.label}/>
        <IconSelect currentIcon={values?.icon} setIcon={(index:number)=>setIcon(index)}/>
      </section>
      <section className="flex flex-col sm:flex-row gap-2">
        <p className="flex-1 flex items-center min-h-5 font-medium text-xs text-red-light dark:text-red-dark overflow-hidden">{error}</p>
        <div className="flex flex-wrap-reverse gap-2">
        {user?.role === "owner" && values &&
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
      <Modal title="Eliminar Categoría" isOpen={openAlert} onClose={()=>setOpenAlert(false)}>
        <DeleteAlert
          content="¿Estas seguro de eliminar esta categoría?"
          description="Todo el contenido marcado con esta categoría se marcará sin categoría"
          error={error}
          onDelete={deleteCategory}
        />
      </Modal>
    </form>
  );
};