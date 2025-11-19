"use client"

import { useState } from "react";
import Image from "next/image";
import { LuLogOut, LuUser } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import { PROFILE_PICTURE, ROLES_DATA } from "@shared/utils/data";
import Modal from "@shared/components/Modal";
import FormProfile from "@users/components/UserForm";

export default function HomeProfile() {
  const { user, logout } = useAuth();

  const [openForm, setOpenForm] = useState(false);

  return(
    <div className="flex-1 flex flex-col gap-2 min-h-96 min-w-3/5 p-2 sm:p-5 rounded border border-secondary-light dark:border-secondary-dark shadow">
      <section className="flex-1 flex flex-col justify-center gap-3">
        <div className="flex flex-col items-center gap-2">
          <Image src={user?.profileImageUrl || PROFILE_PICTURE} alt="Avatar" width={1000} height={1000} className="size-16 rounded-full"/>
          <span className="px-3 py-1 rounded font-semibold text-xs bg-blue-light dark:bg-blue-dark text-primary-light dark:text-primary-dark">{ROLES_DATA.find((role) => role.value === user?.role)?.label}</span>
        </div>
        <div className="flex flex-col items-center overflow-hidden">
          <h1 className="text-center font-medium text-xl sm:text-2xl text-basic">{user?.name}</h1>
          <p className="line-clamp-1 text-center font-medium text-sm sm:text-xl text-quaternary">{user?.email}</p>
        </div>
      </section>
      <section className={`flex flex-wrap-reverse justify-end gap-2`}>
        <button type="button" onClick={logout} className="flex-1 card-btn-red sm:max-w-52">
          <LuLogOut className="text-base sm:text-lg"/>
          Cerrar sesión
        </button>
        <button type="button" onClick={()=>setOpenForm(true)} className={`card-btn-fill flex-1 sm:max-w-52`}>
          <LuUser className="text-base sm:text-lg"/>
          Editar
        </button>
      </section>
      <Modal title="Editar Perfil" isOpen={openForm} onClose={()=>setOpenForm(false)}>
        {openForm && <FormProfile refresh={()=>setOpenForm(false)}/>}
      </Modal>
    </div>
  );
};