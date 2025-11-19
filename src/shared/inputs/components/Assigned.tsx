import { useEffect, useState } from "react";
import Image from "next/image";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuCheck, LuUsers } from "react-icons/lu";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import { TypeAssigned, TypeUser } from "@shared/utils/types";
import Modal from "@shared/components/Modal";
import AvatarGroup from "@users/components/AvatarGroup";
import { PROFILE_PICTURE } from "@shared/utils/data";

export default function AssignedSelect({ label, selectedUsers, setSelectedUsers }:{ label?:boolean, selectedUsers:TypeAssigned[], setSelectedUsers:(users:TypeAssigned[])=>void }) {
  const [allUsers, setAllUsers] = useState<TypeUser[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [tempSelectedUsers, setTempSelectedUsers] = useState<TypeAssigned[]>(selectedUsers);

  const getAllUsers = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.USERS.GET_MEMBERS);
      setAllUsers(res.data);
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error fetching accounts:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    };
  };

  const toggleUserSelection = (userId:string) => {
    if(userId === "all") setTempSelectedUsers(allUsers.map(user => ({ _id:user._id })));
    if(tempSelectedUsers.some(temp => temp._id === userId)) return setTempSelectedUsers(tempSelectedUsers.filter(temp => temp._id !== userId));
    setTempSelectedUsers([ ...tempSelectedUsers, { _id:userId } ]);
  };

  const toggleAllUsers = () => {
    if(tempSelectedUsers.length === allUsers.length) return setTempSelectedUsers([]);
    setTempSelectedUsers(allUsers.map(user => ({ _id:user._id })));
  };

  const handleAssign = () => {
    setSelectedUsers(tempSelectedUsers);
    setOpenModal(false);
  };

  const selectedUsersAvatars = allUsers.filter(user => selectedUsers.some(someUser => someUser._id === user._id)).map((assigned) => ({ name:assigned.name||"", img:assigned.profileImageUrl||PROFILE_PICTURE }));

  useEffect(() => {
    getAllUsers();
  },[]);

  useEffect(() => {
    setTempSelectedUsers(selectedUsers);
    return () => {};
  },[selectedUsers]);

  return(
    <div className="flex flex-col gap-1">
      {label && <label className="font-medium text-start text-sm text-tertiary-dark dark:text-tertiary-light">Asignar usuarios</label>}
    {selectedUsersAvatars.length <= 0 ?
      <button type="button" onClick={() => setOpenModal(true)} className="card-btn">
        <LuUsers className="text-sm"/>
        Asignar miembros
      </button>
    :
      <div onClick={()=>setOpenModal(true)} className="w-full h-full cursor-pointer">
        <AvatarGroup
          avatars={selectedUsersAvatars}
          maxVisible={3}
        />
      </div>
    }
      <Modal isOpen={openModal} onClose={()=>setOpenModal(false)} title="Seleccionar miembros">
        <ul className="flex-1 overflow-y-auto">
          <li className="flex items-center gap-4 p-3 border-b border-secondary-light dark:border-secondary-dark">
            <div className="flex items-center justify-center size-10 rounded-full border border-secondary-light dark:border-secondary-dark">
              <LuUsers className="text-lg"/>
            </div>
            <div className="flex-1 text-start overflow-hidden">
              <p className="font-medium text-sm sm:text-base text-basic">Todos</p>
              <p className="text-xs sm:text-sm text-quaternary">Agregar a todos</p>
            </div>
            <input
              type="checkbox"
              checked={tempSelectedUsers.length === allUsers.length}
              onChange={toggleAllUsers}
              className="size-4"
            />
          </li>
        {allUsers.map(user => (
          <li key={user._id} className="flex items-center gap-4 p-3 border-b border-secondary-light dark:border-secondary-dark">
            <Image
              src={user.profileImageUrl || PROFILE_PICTURE}
              alt={user.name}
              width={50}
              height={50}
              className="size-10 rounded-full"
            />
            <div className="flex-1 text-start overflow-hidden">
              <p className="font-medium text-sm sm:text-base text-basic">{user.name}</p>
              <p className="text-xs sm:text-sm text-quaternary">{user.email}</p>
            </div>
            <input
              type="checkbox"
              checked={tempSelectedUsers.some(temp => temp._id === user._id)}
              onChange={() => toggleUserSelection(user._id)}
              className="size-4"
            />
          </li>
        ))}
        </ul>
        <div className="flex flex-wrap-reverse justify-end gap-2">
          <button type="button" onClick={handleAssign} className="flex-1 card-btn-fill sm:max-w-52">
            <LuCheck className="text-xl"/>
            Confirmar
          </button>
        </div>
      </Modal>
    </div>
  );
};