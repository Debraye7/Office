"use client"

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuChevronDown, LuLogOut, LuMenu, LuX } from "react-icons/lu";
import { PiDesktopDuotone } from "react-icons/pi";
import { useAuth } from "@shared/context/AuthContext";
import { PROFILE_PICTURE, ROLES_DATA, SIDE_MENU_DATA, TypeNavLink, TypeNavSubMenu } from "@shared/utils/data";

export default function Navbar({ activeMenu }:{ activeMenu:string }) {
  const { user, logout, desk } = useAuth();

  const [openSideMenu, setOpenSideMenu] = useState(false);

  return(
    <header className="sticky top-0 z-30 flex items-center justify-between gap-5 w-full max-w-[1750px] h-[56px] pl-4 pr-8 bg-tertiary-light dark:bg-tertiary-dark border-b border-secondary-light dark:border-secondary-dark backdrop-blur-[2px]">
      <div className="flex items-center gap-2">
        <button onClick={()=>setOpenSideMenu(!openSideMenu)} className="text-basic hover:text-quaternary cursor-pointer duration-300"> {/* xl:hidden */}
        {openSideMenu ?
          <LuX className="text-2xl"/>
        :
          <LuMenu className="text-2xl"/>
        }
        </button>
        <Link href="/auth/profile" className="hidden sm:flex items-center gap-2 px-4 w-full rounded-xl font-medium text-sm py-2 hover:bg-primary-light dark:hover:bg-primary-dark cursor-pointer duration-300">
          <PiDesktopDuotone className="text-2xl text-basic"/>
          <h2 className="font-medium text-xl text-basic">{desk?.title}</h2>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={logout} className={`card-btn-red h-8 sm:h-10`}>
          <LuLogOut className="text-xl"/>
          <span className="hidden sm:inline text-nowrap font-medium text-sm">Terminar sesión</span>
          {/* <span className="absolute top-full right-5 hidden group-hover:inline px-4 py-2 mt-1 rounded-md text-nowrap font-medium text-sm text-basic bg-tertiary-light dark:bg-tertiary-dark">Terminar turno</span> */}
        </button>
        <Link href="/auth/profile" className="flex items-center gap-2 group">
          <Image src={user?.profileImageUrl || PROFILE_PICTURE} alt="Avatar" width={1000} height={1000} className="size-8 rounded-full"/>
          <span className="absolute top-full right-5 hidden group-hover:flex gap-2 px-4 py-2 mt-1 rounded-md bg-tertiary-light dark:bg-tertiary-dark">
            <Image src={user?.profileImageUrl || PROFILE_PICTURE} alt="Imagen de perfil" width={500} height={500} className="size-10 rounded-full"/>
            <div className="flex flex-col">
              <p className="font-semibold text-sm text-basic">{user?.name}</p>
              <p className="font-semibold text-xs text-quaternary">{user?.email}</p>
            </div>
          </span>
        </Link>
      </div>
      <SideMenu open={openSideMenu} activeMenu={activeMenu}/>
    </header>
  );
};

function SideMenu({ open, activeMenu }:{ open:boolean, activeMenu:string }) {
  const { user, desk } = useAuth();

  const [sideMenuData, setSideMenuData] = useState<(TypeNavLink|TypeNavSubMenu)[]>([]);

  useEffect(() => {
    if(!user) return;
    const level = ROLES_DATA.findIndex((item) => item.value === user.role);
    setSideMenuData(SIDE_MENU_DATA.filter((item) => item.level >= level));
    return () => {};
  },[user]);

  return(
    <nav className={`absolute top-full left-0 min-w-64 h-[calc(100vh-56px)] mt-[.75px] ${!open ? "opacity-0 invisible" : "opacity-100 visible"} text-primary-dark dark:text-primary-light bg-tertiary-light dark:bg-tertiary-dark border-r border-secondary-light dark:border-secondary-dark shadow-2xl duration-300`}>
      <div className="flex flex-col gap-1.5 h-full p-2.5 overflow-y-scroll">
        <Link href={`/auth/profile`} className={`flex sm:hidden items-center gap-2 px-6 w-full rounded-xl font-medium text-xs min-h-14 bg-linear-to-r ${activeMenu === "desk" ? "text-secondary-light dark:text-secondary-dark from-primary-dark dark:from-primary-light to-secondary-dark/70 dark:to-secondary-light/70" : "hover:bg-primary-light dark:hover:bg-primary-dark"} cursor-pointer duration-300`}>
          <PiDesktopDuotone className="text-xl"/>
          <p className="font-semibold text-sm sm:text-base">{desk?.title}</p>
        </Link>
      {sideMenuData.map((item) => {
        if(item.hasOwnProperty("subMenu")) return <NavSubMenu key={item.id} item={item as TypeNavSubMenu} activeMenu={activeMenu}/>;
        if(item.hasOwnProperty("path")) return <NavLink key={item.id} item={item as TypeNavLink} activeMenu={activeMenu}/>;
      })}
      </div>
    </nav>
  );
};

function NavLink({ item, activeMenu }:{ item:TypeNavLink, activeMenu:string }) {
  return(
    <Link
      key={`menu_${item.id}`}
      href={item.path ? item.path : ""}
      className={`flex items-center gap-2 px-6 w-full rounded-xl font-medium text-xs sm:text-sm min-h-14 bg-linear-to-r ${activeMenu === item.label ? "text-secondary-light dark:text-secondary-dark from-primary-dark dark:from-primary-light to-secondary-dark/70 dark:to-secondary-light/70" : "hover:bg-primary-light dark:hover:bg-primary-dark"} cursor-pointer duration-300`}
    >
      <item.icon className="text-xl"/>
      {item.label}
    </Link>
  );
};

function NavSubMenu({ item, activeMenu }:{ item:TypeNavSubMenu, activeMenu:string }) {
  const [open, setOpen] = useState(false);
  return(
    <div className="flex flex-col items-end gap-1.5">
      <button type="button" onClick={()=>setOpen(!open)} className={`flex items-center justify-between gap-2 px-6 w-full rounded-xl font-medium text-xs sm:text-sm min-h-14 bg-linear-to-r ${open ? "text-secondary-light dark:text-secondary-dark from-primary-dark dark:from-primary-light to-secondary-dark/70 dark:to-secondary-light/70" : "hover:bg-primary-light dark:hover:bg-primary-dark"} cursor-pointer duration-300`}>
        <div className="flex items-center gap-2">
          <item.icon className="text-xl"/>
          {item.label}
        </div>
        <LuChevronDown className={`text-lg duration-300 ${open && "rotate-180"}`}/>
      </button>
      <div data-show={open} className="flex flex-col gap-1.5 w-11/12 h-0 data-[show=true]:h-fit overflow-hidden duration-300">
      {item.subMenu.map((subItem) => (
        <NavLink key={subItem.id} item={subItem} activeMenu={activeMenu}/>
      ))}
      </div>
    </div>
  );
};