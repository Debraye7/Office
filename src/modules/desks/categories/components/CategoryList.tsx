import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuCircleDashed, LuSquarePen } from "react-icons/lu";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import { TypeCategory } from "@shared/utils/types";
import Skeleton from "@shared/components/Skeleton";
import Modal from "@shared/components/Modal";
import DropdownSelect from "@shared/inputs/components/Dropdown";
import CategoryForm from "@categories/components/CategoryForm";

const types = [
  { label:"Todos", value:"" },
  { label:"Transacciones", value:"transaction" },
  { label:"Productos", value:"product" },
  { label:"Movimientos", value:"movement" },
  { label:"Artículos", value:"item" },
];

export default function Categories() {
  const [categories, setCategories] = useState<TypeCategory[]|undefined>();
  const [category, setCategory] = useState<TypeCategory|undefined>();
  const [type, setType] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.CATEGORIES.GET_CATEGORIES_BY_TYPE, {
        params: {
          type: type || "all"
        }
      });
      if(res.status === 200) setCategories(res.data);
    } catch (error) {
      if(!isAxiosError(error)) return console.error(error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    }
  };

  useEffect(() => {
    fetchCategories();
    return () => {};
  },[type]);

  const onRefresh = () => {
    fetchCategories();
    setCategory(undefined);
  };

  return(
    <div className="flex-1 flex flex-col gap-4 md:gap-5 max-h-full">
      <section className="flex flex-wrap-reverse justify-end gap-2">
        <DropdownSelect icon={<LuCircleDashed className="text-xl"/>} placeholder="Tipo" defaultValue="" options={types} handleValue={(value)=>setType(value)}/>
      </section>
      <ul className="flex-1 flex flex-col gap-2 overflow-y-auto">
      {categories === undefined && [1,2].map(i => (
        <li key={`folder-${i}`} className="flex w-full h-16">
          <Skeleton/>
        </li>
      ))}
      {categories?.map(category => (
        <li key={category._id} className="  rounded-md border-2 text-basic bg-transparent hover:bg-secondary-light dark:hover:bg-secondary-dark border-secondary-light dark:border-secondary-dark duration-300">
          <button type="button" onClick={()=>setCategory(category)} className="flex items-center gap-3 px-5 h-16 w-full cursor-pointer">
            <LuSquarePen className="text-2xl"/>
            <span className="font-semibold text-xl">{category.label}</span>
          </button>
        </li>
      ))}
      {categories && categories?.length < 1 && 
        <li className="flex-1 flex items-center justify-center">
          <p className="font-semibold text-lg text-quaternary">No hay categorías</p>
        </li>
      }
      </ul>
      <Modal title="Editar Categoría" isOpen={category ? true : false} onClose={()=>setCategory(undefined)}>
        {category && <CategoryForm values={category} type={category.type} refresh={onRefresh}/>}
      </Modal>
    </div>
  );
};