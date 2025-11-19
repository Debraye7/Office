import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuCheck, LuTrash2 } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import { TypeAssigned, TypeDesk } from "@shared/utils/types";
import Modal from "@shared/components/Modal";
import DeleteAlert from "@shared/components/DeleteAlert";
import TextInput from "@shared/inputs/components/Text";
import AssignedSelect from "@shared/inputs/components/Assigned";
import { PROFILE_PICTURE } from "@shared/utils/data";

export default function DeskForm({ value, closeForm }:{ value?:TypeDesk, closeForm:()=>void, }) {
  const { user, changeDesk, removeDesk } = useAuth();
  const router = useRouter();

  const [selectedUsers, setSelectedUsers] = useState<TypeAssigned[]>(value ? value?.members : user ? [{ _id:user._id, email:user.email, name:user.name, profileImageUrl:user.profileImageUrl }] : []);
  const [error, setError] = useState("");
  const [openAlert, setOpenAlert] = useState(false);

  const getIds = () => {
    const ids:string[] = [];
    selectedUsers.forEach((user) => {
      ids.push(user._id);
    });
    return ids;
  };

  const createDesk = async (title:string) => {
    try {
      const res = await axiosInstance.post(API_PATHS.DESKS.CREATE_DESK, { title, members:getIds() });
      if(res.status === 201) {
        toast.success(res.data.message);
        changeDesk(res.data.desk._id);
        router.push("/dashboard");
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

  const updateDesk = async (title:string) => {
    if(!value) return;
    try {
      const res = await axiosInstance.put(API_PATHS.DESKS.UPDATE_DESK(value._id), { title, members:getIds() });
      if(res.status === 201) {
        toast.success(res.data.message);
        changeDesk(res.data.desk._id);
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

  const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const title = formData.get("desk-title")?.toString() || "";

//! Validate form data
    if(!title?.trim()) return setError("Título obligatorio.");
    if(selectedUsers.length < 1) return setError("Asigna al menos un miembro");

    if(!value) createDesk(title);
    if(value) updateDesk(title);
  };

  const handleDelete = async () => {
    if(!value) return;
    try {
      const res = await axiosInstance.delete(API_PATHS.DESKS.DELETE_DESK(value._id)); 
      if(res.status === 200) {
        toast.success(res.data.message);
        removeDesk();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error deleting desk:", error);
      if(error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      };
    };
  };

  return(
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col max-h-full">
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
        <TextInput name="desk-title" label="Título" placeholder="Título del escritorio" defaultValue={value && value.title}/>
        <AssignedSelect label selectedUsers={selectedUsers} setSelectedUsers={(users:TypeAssigned[])=>setSelectedUsers(users)}/>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 min-h-fit">
        <p className="flex-1 flex items-center min-h-5 font-medium text-xs text-red-light dark:text-red-dark overflow-hidden">{error}</p>
        <div className="flex flex-wrap-reverse justify-end gap-2">
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
      </div>
      <Modal title="Eliminar Escritorio" isOpen={openAlert} onClose={()=>setOpenAlert(false)}>
        {openAlert && <DeleteAlert content="¿Estás seguro de que quieres borrar el escritorio?" description="También se eliminara todo el contenido del escritorio" error={error} onDelete={handleDelete}/>}
      </Modal>
    </form>
  );
};