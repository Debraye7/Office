import { FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuCheck, LuTrash2 } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import { API_PATHS } from "@shared/utils/apiPaths";
import axiosInstance from "@shared/utils/axiosInstance";
import { ROLES_DATA } from "@shared/utils/data";
import DeleteAlert from "@shared/components/DeleteAlert";
import Modal from "@shared/components/Modal";
import DropdownSelect from "@shared/inputs/components/Dropdown";

export default function UserForm({ id, currentRole, update }:{ id:string, currentRole:string, update:()=>void }) {
  const { user } = useAuth();

  const [openAlert, setOpenAlert] = useState(false);
  const [role, setRole] = useState(currentRole);

  const deleteUser = async () => {
    try {
      const res = await axiosInstance.delete(API_PATHS.USERS.DELETE_USER(id));
      if(res.status === 200) {
        toast.success(res.data.message);
        update();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error(error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    }
  };

  const handleSubmit = async (e:FormEvent) => {
    e.preventDefault();
    if(role === currentRole || id === user?._id) return;
    try {
      const res = await axiosInstance.put(API_PATHS.USERS.UPDATE_ROLE(id), { role });
      if(res.status === 201) {
        toast.success(res.data.message);
        update();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error(error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    };
  };

  return(
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 max-h-full">
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        <DropdownSelect label="Rol" options={ROLES_DATA} placeholder="Elige un tipo de usuario" defaultValue={role} handleValue={(value:string)=>setRole(value)}/>
      </div>
      <div className="flex flex-wrap-reverse justify-end gap-2">
        <button type="button" onClick={()=>setOpenAlert(true)} className="flex-1 sm:flex-auto card-btn-red w-fit sm:max-w-52">
          <LuTrash2 className="text-xl"/>
          Eliminar
        </button>
        <button type="submit" className="flex-1 sm:flex-auto card-btn-fill w-fit sm:max-w-52">
          <LuCheck className="text-xl"/>
          Confirmar
        </button>
      </div>
      <Modal isOpen={openAlert} onClose={()=>setOpenAlert(false)} title="Eliminar Usuario">
        <DeleteAlert
          content="¿Estas seguro de eliminar este usuario?"
          description="Se eliminara de todos los escritorios"
          onDelete={deleteUser}
        />
      </Modal>
    </form>
  );
};