import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuLogOut, LuPlus } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import { API_PATHS } from "@shared/utils/apiPaths";
import axiosInstance from "@shared/utils/axiosInstance";
import { TypeUser } from "@shared/utils/types";
import Skeleton from "@shared/components/Skeleton";
import Modal from "@shared/components/Modal";
import User from "@home/components/UserItem";
import FormToken from "@users/components/TokenForm";

export default function HomeUsers() {
  const { user, logout } = useAuth();

  const [users, setUsers] = useState<TypeUser[]|undefined>();
  const [openToken, setOpenToken] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      setUsers(res.data);
    } catch (error) {
      if(!isAxiosError(error)) return console.error(error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    }
  };

  useEffect(() => {
    fetchUsers();
    return () => {};
  },[]);

  return(
    <section className="flex-1 flex flex-col gap-3 min-h-96 min-w-3/5 p-2 sm:p-5 rounded border border-secondary-light dark:border-secondary-dark shadow">
      <div>
        <h1 className="font-medium text-lg sm:text-xl text-basic">Usuarios</h1>
        <p className="text-xs sm:text-sm text-quaternary">Administra todos los usuarios de la app</p>
      </div>
    {users === undefined &&
      <div className="flex-1 flex flex-col gap-2 min-h-full">
      {[1,2].map((i)=>(
        <div key={`tab-${i}`} className="flex min-h-28 sm:min-h-24 max-h-16 min-w-full">
          <Skeleton/>
        </div>
      ))}
      </div>
    }
    {users?.length === 0 && 
      <span className="flex-1 flex items-center justify-center">
        <p className="text-center font-semibold text-lg sm:text-xl text-basic">No hay usuarios para mostrar</p>
      </span>
    }
    {users && users.length > 0 &&
      <ul className="flex-1 flex flex-col gap-1 overflow-y-auto">
      {users.map((user) => (
        <User key={user._id} info={user} updateUsers={fetchUsers}/>
      ))}
      </ul>
    }
      <section className={`${users === undefined ? "hidden" : "flex"} flex-wrap-reverse justify-end gap-2`}>
        <button type="button" onClick={logout} className="flex-1 card-btn-red sm:max-w-52">
          <LuLogOut className="text-base sm:text-lg"/>
          Cerrar sesión
        </button>
        <button type="button" onClick={()=>setOpenToken(true)} className={`${user?.role === "owner" ? "card-btn-fill" : "hidden"} flex-1 sm:max-w-52`}>
          <LuPlus className="text-base sm:text-lg"/>
          Crear token
        </button>
      </section>
      <Modal title="Crear Token" isOpen={openToken} onClose={()=>setOpenToken(false)}>
        {openToken &&  <FormToken/>}
      </Modal>
    </section>
  );
};