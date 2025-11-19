import { useState } from "react";
import { LuPencil } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import { TypeProduct } from "@shared/utils/types";
import Modal from "@shared/components/Modal";
import ProductForm from "@products/components/ProductForm";

export default function ProductDetails({ product, refresh }:{ product:TypeProduct, refresh:()=>void }) {
  const { user } = useAuth();
  const { description, category, price, stock } = product;

  const [openForm, setOpenForm] = useState(false);

  const onRefresh = () => {
    refresh();
    setOpenForm(false);
  };

  return(
    <>
      <div className="flex flex-wrap gap-2 min-w-full">
        <span className="line-clamp-1 text-center font-semibold text-xs sm:text-sm px-4 py-1 rounded-full text-primary-light dark:text-primary-dark bg-primary-dark dark:bg-primary-light">{category ? category.label : "Sin categoría"}</span>
        <span className={`text-center font-semibold text-xs sm:text-sm px-4 py-1 min-w-20 rounded-full text-blue-light dark:text-blue-dark bg-blue-light/20 dark:bg-blue-dark/20`}>${price}</span>
        <span className={`text-center font-semibold text-xs sm:text-sm px-4 py-1 min-w-20 rounded-full ${stock ? "text-green-light dark:text-green-dark bg-green-light/20 dark:bg-green-dark/20" : "text-red-light dark:text-red-dark bg-red-light/20 dark:bg-red-dark/20"}`}>{stock || 0}</span>
      </div>
      <textarea readOnly value={description} placeholder="Sin descripción" className="flex-1 p-4 rounded font-medium text-lg bg-secondary-light dark:bg-secondary-dark border border-tertiary-light dark:border-tertiary-dark overflow-y-auto"/>
      <div className="flex justify-end">
    {user && (user.role === "owner" || user.role === "admin") &&
        <button type="button" onClick={()=>setOpenForm(true)} className="flex-1 sm:flex-auto card-btn-fill sm:max-w-52">
          <LuPencil className="text-xl"/>
          Editar
        </button>
    }
      </div>
      <Modal title={"Editar Producto"} isOpen={openForm} onClose={()=>setOpenForm(false)}>
        {openForm && <ProductForm values={product} refresh={onRefresh}/>}
      </Modal>
    </>
  );
};