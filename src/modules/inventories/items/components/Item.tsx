import { useState } from "react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { LuChevronLeft, LuChevronRight, LuSquarePen } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import { API_PATHS } from "@shared/utils/apiPaths";
import axiosInstance from "@shared/utils/axiosInstance";
import { ICONS } from "@shared/utils/data";
import { TypeItem } from "@shared/utils/types";
import Modal from "@shared/components/Modal";
import ItemForm from "@items/components/ItemForm";

export default function Item({ item, refresh }:{ item:TypeItem, refresh:()=>void }) {
  const { user } = useAuth();
  const { _id, category, title, description, price, stock } = item;

  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);

  const getIcon = (index:number, size:"sm"|"lg") => {
    const Icon = ICONS[index];
    return <Icon className={`${size === "sm" ? "text-lg" : "text-xl"}`}/>
  };

  const handleSubtract = async () => {
    if(stock <= 0) return;
    setLoading(true);
    try {
      const res = await axiosInstance.put(API_PATHS.INVENTORIES.ITEMS.UPDATE_STOCK(_id), { stock:stock - 1 });
      if(res.status === 201) {
        toast.success(res.data.message);
        refresh();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error creating item:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    } finally {
      setLoading(false);
    };
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.put(API_PATHS.INVENTORIES.ITEMS.UPDATE_STOCK(_id), { stock:stock + 1 });
      if(res.status === 201) {
        toast.success(res.data.message);
        refresh();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error creating item:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    } finally {
      setLoading(false);
    };
  };

  const onRefresh = () => {
    refresh();
    setOpenForm(false);
  };

  return(
    <>
      <div className={`flex items-center justify-between gap-2 hover:bg-secondary-light dark:hover:bg-secondary-dark p-4 rounded-md duration-300 ${user?.role === "owner" || user?.role === "admin" && "cursor-pointer"}`}>
        <div className="flex flex-col items-center justify-center">
          <span className="flex items-center justify-center min-h-10 min-w-10 rounded-full text-primary-light dark:text-primary-dark bg-primary-dark dark:bg-primary-light">
            {getIcon(category ? category.icon : 0, "lg")}
          </span>
          <p className="font-medium text-xs text-quaternary line-clamp-1">${price}</p>
        </div>
        <div className="flex-1 flex flex-col gap-0.5">
          <p className="font-semibold text-base line-clamp-1">{title}</p>
          <span className="text-quaternary text-xs line-clamp-1">{description}</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleSubtract} disabled={loading || stock === 0} className="flex items-center justify-center size-10 rounded-md hover:bg-tertiary-light dark:hover:bg-tertiary-dark border border-tertiary-light dark:border-tertiary-dark disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed duration-300">
            <LuChevronLeft className="text-xl"/>
          </button>
          <p className="flex items-center justify-center min-w-10 font-semibold text-xl">{stock}</p>
          <button type="button" onClick={handleAdd} disabled={loading} className="flex items-center justify-center size-10 rounded-md hover:bg-tertiary-light dark:hover:bg-tertiary-dark border border-tertiary-light dark:border-tertiary-dark disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed duration-300">
            <LuChevronRight className="text-xl"/>
          </button>
          <button type="button" onClick={user?.role === "owner" || user?.role === "admin" ? ()=>setOpenForm(true) : ()=>{}} className="flex items-center justify-center size-10 rounded-md hover:bg-tertiary-light dark:hover:bg-tertiary-dark border border-tertiary-light dark:border-tertiary-dark disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed duration-300">
            <LuSquarePen className="text-xl"/>
          </button>
        </div>
      </div>
      <Modal title="Editar Artículo" isOpen={openForm} onClose={()=>setOpenForm(false)}>
        {openForm && <ItemForm inventory={item.inventory} values={item} refresh={onRefresh}/>}
      </Modal>
    </>
  );
};