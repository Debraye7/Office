import { useState } from "react";
import Image from "next/image";
import { LuArrowDownUp, LuInfo } from "react-icons/lu";
import { ICONS } from "@shared/utils/data";
import { TypeProduct } from "@shared/utils/types";
import Modal from "@shared/components/Modal";
import ProductDetails from "@products/components/ProductDetails";
import Movements from "@movements/components/MovementList";

export default function ProductCard({ product, refresh }:{ product:TypeProduct, refresh:()=>void }) {
  const { title, description, category, price, stock, imageUrl } = product;

  const [openDetails, setOpenDetails] = useState(false);
  const [openMovements, setOpenMovements] = useState(false);

  const getIcon = (index:number) => {
    const Icon = ICONS[index];
    return <Icon className="min-w-fit"/>
  };

  return(
    <>
      <div className="card flex flex-col gap-2 min-h-60 bg-secondary-light dark:bg-secondary-dark hover:bg-primary-light dark:hover:bg-primary-dark duration-300">
        <div className="relative flex flex-col gap-2 w-full">
          {/* <span className="flex items-center justify-center h-32 rounded-md text-primary-dark dark:text-primary-light bg-tertiary-light dark:bg-tertiary-dark">
            {getIcon(category ? category.icon : 0)}
          </span> */}
          <Image src={imageUrl} alt="Imagen del producto" width={1000} height={500} className="w-full h-32"/>
          <span className="absolute top-2 left-2 flex items-center gap-1 px-3 py-0.5 max-w-4/5 rounded-full font-semibold text-xs text-primary-light dark:text-primary-dark bg-primary-dark dark:bg-primary-light">
            {getIcon(category ? category.icon : 0)}
            <p className="line-clamp-1">{category ? category.label : "Sin categoría"}</p>
          </span>
          <span className="absolute bottom-2 left-2 px-3 py-0.5 rounded-full font-semibold text-xs text-primary-light dark:text-primary-dark bg-blue-light dark:bg-blue-dark">${price}</span>
          <span className={`absolute bottom-2 right-2 px-3 py-0.5 rounded-full font-semibold text-xs text-primary-light dark:text-primary-dark ${stock > 10 ? "bg-green-light dark:bg-green-dark" : stock > 0 ? "bg-yellow-light dark:bg-yellow-dark" : "bg-red-light dark:bg-red-dark"}`}>{stock || 0}</span>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <p className="font-semibold text-base sm:text-lg text-basic line-clamp-2">{title}</p>
          <p className="font-medium text-xs sm:text-sm text-quaternary line-clamp-1">{description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={()=>setOpenDetails(true)} className="flex-1 card-btn-fill">
            <LuInfo className="text-lg"/>
            Información
          </button>
          <button type="button" onClick={()=>setOpenMovements(true)} className="flex-1 card-btn-fill">
            <LuArrowDownUp className="text-lg"/>
            Movimientos
          </button>
        </div>
      </div>
      <Modal title={title} isOpen={openDetails} onClose={()=>setOpenDetails(false)}>
        {openDetails && <ProductDetails product={product} refresh={refresh}/>}
      </Modal>
      {openMovements && <Movements isOpen={openMovements} onClose={()=>setOpenMovements(false)} product={product} refresh={refresh}/>}
    </>
  );
};