"use client"

import { useEffect, useState } from "react";
import { API_PATHS } from "@shared/utils/apiPaths";
import axiosInstance from "@shared/utils/axiosInstance";
import { ROLES_DATA } from "@shared/utils/data";
import { TypeUser } from "@shared/utils/types";
import AppLayout from "@shared/layouts/AppLayout";
import Skeleton from "@shared/components/Skeleton";
import DropdownSelect from "@shared/inputs/components/Dropdown";
import ProtectedRoute from "@app/ProtectedRoute";
import UserCard from "@users/components/UserCard";

export default function UsersPage() {
  const [allUsers, setAllUsers] = useState<TypeUser[]|undefined>();
  const [role, setRole] = useState("");

  const getAllUsers = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.DESKS.GET_MEMBERS, {
        params:{
          role,
        },
      });
      setAllUsers(res.data.members);
    } catch (error) {
      console.error("Error fetching users:", error);
    };
  };

  useEffect(() => {
    getAllUsers();
    return () => {};
  },[role]);

  return(
    <ProtectedRoute>
      <AppLayout activeMenu="Miembros">
        <div className="">
          <section className="flex flex-wrap items-center justify-between gap-3 w-full">
            <h2 className="font-medium text-2xl md:text-3xl text-basic">Miembros</h2>
            <div className="flex flex-wrap justify-end gap-2 min-w-full md:min-w-fit">
              <div className="flex-1 min-w-48 ">
                <DropdownSelect disabled={!allUsers ? true : false} options={[{ label:"Todos", value:"" }, ...ROLES_DATA]} defaultValue="" placeholder="Rol" handleValue={(value)=>setRole(value)}/>
              </div>
            </div>
          </section>
          <ul className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 mt-4">
            {allUsers === undefined ?
            [1,2].map((i) => (
              <div key={i} className="flex min-h-36 min-w-full md:min-w-1/2 xl:min-w-1/3">
                <Skeleton/>
              </div>
            ))
            :
            allUsers.map((user) => (
              <UserCard key={user._id} info={user}/>
            ))
            }
          </ul>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
};