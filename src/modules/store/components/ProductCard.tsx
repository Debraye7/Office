import { ICONS } from "@shared/utils/data";
import { TypeProduct } from "@shared/utils/types";
import Image from "next/image";

export default function ProductCard({ product, addProduct }:{ product:TypeProduct, addProduct:(newProduct:TypeProduct)=>void }) {
  const { title, category, price, stock, imageUrl } = product;

  const getIcon = (index:number) => {
    const Icon = ICONS[index];
    return <Icon className="min-w-fit"/>
  };

  return(
    <button type="button" onClick={()=>addProduct(product)} className="card flex flex-col gap-2  bg-secondary-light dark:bg-secondary-dark hover:bg-primary-light dark:hover:bg-primary-dark duration-300">
      <div className="relative flex flex-col gap-2 w-full">
        <Image src={imageUrl} alt="Imagen del producto" width={1000} height={500} priority className="w-full h-32"/>
        <span className="absolute top-2 left-2 flex items-center gap-1 px-3 py-0.5 max-w-4/5 rounded-full line-clamp-1 font-semibold text-xs text-primary-light dark:text-primary-dark bg-primary-dark dark:bg-primary-light">
          {getIcon(category ? category.icon : 0)}
          <p className="line-clamp-1">{category ? category.label : "Sin categoría"}</p>
        </span>
        <span className="absolute bottom-2 left-2 px-3 py-0.5 rounded-full font-semibold text-xs text-primary-light dark:text-primary-dark bg-blue-light dark:bg-blue-dark">${price}</span>
        <span className={`absolute bottom-2 right-2 px-3 py-0.5 rounded-full font-semibold text-xs text-primary-light dark:text-primary-dark ${stock > 10 ? "bg-green-light dark:bg-green-dark" : stock > 0 ? "bg-yellow-light dark:bg-yellow-dark" : "bg-red-light dark:bg-red-dark"}`}>{stock || 0}</span>
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <p className="font-semibold text-start text-sm sm:text-base text-basic line-clamp-2">{title}</p>
      </div>
    </button>
  );
};