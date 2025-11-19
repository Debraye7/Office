"use client"

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { useAuth } from "@shared/context/AuthContext";
import { PROFILE_PICTURE, ROLES_DATA } from "@shared/utils/data";
import AppLayout from "@shared/layouts/AppLayout";
import ProtectedRoute from "@app/ProtectedRoute";
import TaskDashboard from "@dashboard/tasks/components/TaskDashboard";
import AccountDashboard from "@dashboard/accounts/components/AccountDashboard";
import EventDashboard from "@dashboard/events/components/EventDashboard";

const dashboards = [
  "Tareas",
  "Cuentas",
  "Calendario",
];

export default function DashboardPage() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState("Tareas");

  return(
    <ProtectedRoute>
      <AppLayout activeMenu="Dashboard">
        <div className="flex flex-col gap-5">
          <div className="card">
            <div className="flex gap-2">
              <div className="flex flex-col items-center gap-1">
                <Image src={user?.profileImageUrl || PROFILE_PICTURE} alt="Avatar de usuario" width={100} height={100} className="rounded-full size-14 object-cover"/>
                <span className="w-14 py-0.5 rounded text-center font-bold text-[8px] bg-blue-light dark:bg-blue-dark text-primary-light dark:text-primary-dark">{ROLES_DATA.find((role) => role.value === user?.role)?.label}</span>
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-medium text-xl md:text-2xl text-basic">{user?.name}</p>
                <p className="text-sm md:text-base text-tertiary-dark dark:text-tertiary-light">{user?.email}</p>
                <p className="text-xs md:text-sm text-quaternary">{format(new Date(), "eeee, dd 'de' MMMM 'del' yyyy", { locale:es })}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 max-w-full py-2 overflow-x-auto">
          {dashboards.map((item, index) => (
            <button key={index} onClick={()=>setDashboard(item)} className={`${dashboard === item ? "text-primary-light dark:text-primary-dark bg-primary-dark dark:bg-primary-light cursor-not-allowed" : "text-basic bg-tertiary-light/75 dark:bg-tertiary-dark/75 hover:bg-transparent cursor-pointer"} flex flex-1 sm:flex-none items-center justify-center font-semibold text-sm rounded-full min-w-28 px-6 py-2 duration-300`}>
              {item}
            </button>
          ))}
          </div>
          {dashboard === "Tareas" && <TaskDashboard />}
          {dashboard === "Cuentas" && <AccountDashboard />}
          {dashboard === "Calendario" && <EventDashboard />}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
};