"use client"

import { ReactNode } from "react";
import { useAuth } from "@shared/context/AuthContext";
import Header from "@shared/layouts/Header";

export default function AppLayout({ children, activeMenu }:{ children:ReactNode, activeMenu:string }) {
  const { user } = useAuth();
  return(
    <div className="flex flex-col items-center min-h-screen min-w-screen">
      <Header activeMenu={activeMenu} />
    {user &&
      <main className="flex-1 flex flex-col p-5 pr-6 w-full max-w-[1750px]">
        {children}
      </main>
    }
    </div>
  );
};