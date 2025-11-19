"use client"

import { useState } from "react";
import { PiDesktopDuotone } from "react-icons/pi";
import { useAuth } from "@shared/context/AuthContext";
import { BRAND_NAME } from "@shared/utils/data";
import ProtectedRoute from "@app/ProtectedRoute";
import DeskList from "@home/components/DeskList";
import UserList from "@home/components/UserList";
import UserProfile from "@home/components/UserProfile";

const MENU_ITEMS = [
  { label:"Usuarios", value:"users", owner:true },
  { label:"Perfil", value:"profile", owner:false },
  { label:"Escritorios", value:"desks", owner:false },
];

export default function HomePage() {
  const { user } = useAuth();

  const [active, setActive] = useState("desks");

  return(
    <ProtectedRoute>
      <main className="flex flex-col gap-2 p-5 pt-2 min-h-screen max-h-screen">
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 w-full">
          <div className="flex items-center gap-1 w-fit text-basic">
            <PiDesktopDuotone className="text-2xl"/>
            <h1 className="text-nowrap text-xl font-medium">{BRAND_NAME}</h1>
          </div>
          <div className="flex-1 flex flex-wrap items-center justify-end gap-2 py-2">
          {MENU_ITEMS.map((item) => (
            <button key={item.value} onClick={()=>setActive(item.value)} className={`${active === item.value ? "text-primary-light dark:text-primary-dark bg-primary-dark dark:bg-primary-light cursor-not-allowed" : "text-basic bg-tertiary-light/75 dark:bg-tertiary-dark/75 hover:bg-transparent cursor-pointer"} ${item.owner ? user?.role === "owner" ? "flex" : "hidden" : "flex"} flex-1 sm:flex-none items-center justify-center font-semibold text-sm rounded-full w-28 px-3 py-1 duration-300`}>
              {item.label}
            </button>
          ))}
          </div>
        </section>
        {active === "desks" && <DeskList/>}
        {active === "users" && <UserList/>}
        {active === "profile" && <UserProfile/>}
      </main>
    </ProtectedRoute>
  );
};