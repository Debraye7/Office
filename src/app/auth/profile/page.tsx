"use client"

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuCircleDashed, LuFolder, LuMonitorCog, LuScreenShareOff, LuUser } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import { PROFILE_PICTURE, ROLES_DATA } from "@shared/utils/data";
import { TypeAssigned } from "@shared/utils/types";
import ThemeToggle from "@shared/components/ThemeSwitcher";
import AppLayout from "@shared/layouts/AppLayout";
import Modal from "@shared/components/Modal";
import ProtectedRoute from "@app/ProtectedRoute";
import DeskForm from "@desks/components/DeskForm";
import FormProfile from "@users/components/UserForm";
import Folders from "@desks/folders/components/FolderList";
import AvatarGroup from "@users/components/AvatarGroup";
import Categories from "@desks/categories/components/CategoryList";

export default function Profile() {
  const { user, desk, changeDesk } = useAuth();

  const [openFoldersForm, setOpenFoldersForm] = useState(false);
  const [openCategoriesForm, setOpenCategoriesForm] = useState(false);
  const [openUserForm, setOpenUserForm] = useState(false);
  const [openDeskForm, setOpenDeskForm] = useState(false);

  const onRefresh = () => {
    if(desk) changeDesk(desk._id)
    setOpenUserForm(false);
  };

  return(
    <ProtectedRoute>
      <AppLayout activeMenu="desk">
        <div className="flex flex-col gap-4">
{/* Theme */}
          <ThemeToggle/>
{/* Desk */}
          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-4 py-5 px-7 rounded-md border border-secondary-light dark:border-secondary-dark shadow-md dark:shadow-secondary-dark/50">
              <div className="flex justify-between items-center gap-4 w-full">
                <p className="font-semibold text-lg text-basic">{desk?.title}</p>
                <span className="px-3 py-1 rounded font-semibold text-xs bg-blue-light dark:bg-blue-dark text-primary-light dark:text-primary-dark">Escritorio</span>
              </div>
              <div className="flex flex-col gap-2">
                <label className="info-box-label">Miembros</label>
                <AvatarGroup maxVisible={10} avatars={desk?.members.map((user:TypeAssigned) => ({ name:user.name||"", img:user.profileImageUrl||PROFILE_PICTURE })) || []}/>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <div className="flex flex-wrap gap-4">
                <button onClick={()=>setOpenDeskForm(true)} className="flex-1 sm:flex-none card-btn-fill">
                  <LuMonitorCog className="text-lg"/>
                  Editar
                </button>
                <button onClick={()=>setOpenFoldersForm(true)} className="flex-1 sm:flex-none card-btn-fill">
                  <LuFolder className="text-lg"/>
                  Carpetas
                </button>
                <button onClick={()=>setOpenCategoriesForm(true)} className="flex-1 sm:flex-none card-btn-fill">
                  <LuCircleDashed className="text-lg"/>
                  Categorías
                </button>
              </div>
              <Link href="/" className="flex-1 sm:flex-none card-btn-red">
                <LuScreenShareOff className="text-lg"/>
                Salir
              </Link>
            </div>
          </section>
{/* User */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-5 py-5 px-7 rounded-md border border-secondary-light dark:border-secondary-dark shadow-md dark:shadow-secondary-dark/50">
              <Image src={user?.profileImageUrl || PROFILE_PICTURE} alt="Avatar" width={1000} height={1000} className="size-16 rounded-full"/>
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <h1 className="font-medium text-xl text-basic">{user?.name}</h1>
                  <span className="px-3 py-1 rounded font-semibold text-xs bg-blue-light dark:bg-blue-dark text-primary-light dark:text-primary-dark">{ROLES_DATA.find((role) => role.value === user?.role)?.label}</span>
                </div>
                <div>
                  <p className="font-medium text-xs text-quaternary">{user?.email}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-between gap-5">
              <button onClick={()=>setOpenUserForm(true)} className="card-btn-fill">
                <LuUser className="text-lg"/>
                Editar
              </button>
            </div>
          </section>
        </div>
        <Modal title="Carpetas" isOpen={openFoldersForm} onClose={()=>setOpenFoldersForm(false)}>
          {openFoldersForm && <Folders/>}
        </Modal>
        <Modal title="Categorías" isOpen={openCategoriesForm} onClose={()=>setOpenCategoriesForm(false)}>
          {openCategoriesForm && <Categories/>}
        </Modal>
        <Modal title="Editar Perfil" isOpen={openUserForm} onClose={()=>setOpenUserForm(false)}>
          {openUserForm && <FormProfile refresh={onRefresh}/>}
        </Modal>
        <Modal title="Editar Escritorio" isOpen={openDeskForm} onClose={()=>setOpenDeskForm(false)}>
          {desk && openDeskForm && <DeskForm value={desk} closeForm={()=>setOpenDeskForm(false)}/>}
        </Modal>
      </AppLayout>
    </ProtectedRoute>
  );
};