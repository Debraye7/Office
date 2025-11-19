import { useState } from "react";
import Image from "next/image";
import { TypeUser } from "@shared/utils/types";
import { PROFILE_PICTURE, ROLES_DATA } from "@shared/utils/data";
import Modal from "@shared/components/Modal";
import UserForm from "@home/components/UserForm";

export default function User({ info, updateUsers }:{ info:TypeUser, updateUsers:()=>void }) {
  const [openForm, setOpenForm] = useState(false);

  const update = () => {
    updateUsers();
    setOpenForm(false);
  };

  return(
    <li className="flex items-center rounded-lg bg-transparent min-h-fit max-w-full hover:bg-secondary-light dark:hover:bg-secondary-dark duration-300">
      <button type="button" onClick={()=>setOpenForm(true)} className="flex-1 flex flex-col sm:flex-row items-center gap-4 max-w-full min-h-fit py-3 px-6 text-start text-sm text-basic overflow-hidden cursor-pointer">
        <div className="flex flex-col justify-center items-center gap-1">
          <Image src={info.profileImageUrl || PROFILE_PICTURE} alt="Avatar" width={1000} height={1000} className="size-10 sm:size-14 rounded-full"/>
          <span className="py-0.5 px-1 min-w-10 sm:max-w-14 rounded text-center font-semibold text-[6px] text-primary-light dark:text-primary-dark bg-blue-light dark:bg-blue-dark">{ROLES_DATA.find((role) => role.value === info.role)?.label}</span>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <p className="flex-1 flex items-center justify-center sm:justify-start text-center sm:text-start font-semibold text-base sm:text-lg text-basic">{info.name}</p>
          <p className="flex-1 flex items-center justify-center sm:justify-start text-center sm:text-start font-medium text-xs sm:text-sm text-quaternary">{info.email}</p>
        </div>
      </button>
      <Modal title="Editar Usuario" isOpen={openForm} onClose={()=>setOpenForm(false)}>
        {openForm && <UserForm id={info._id} currentRole={info.role} update={update}/>}
      </Modal>
    </li>
  );
};