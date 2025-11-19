"use client"

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuArrowDownWideNarrow, LuArrowUpNarrowWide, LuPlus } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import { TypeCategory, TypeProduct } from "@shared/utils/types";
import { PRODUCTS_SORT_DATA } from "@shared/utils/data";
import AppLayout from "@shared/layouts/AppLayout";
import Modal from "@shared/components/Modal";
import Skeleton from "@shared/components/Skeleton";
import CategorySelect from "@shared/inputs/components/CategorySelect";
import ProtectedRoute from "@app/ProtectedRoute";
import ProductForm from "@products/components/ProductForm";
import ProductCard from "@products/components/ProductCard";

export default function ProductsPage() {
  const { user } = useAuth();

  const [products, setProducts] = useState<TypeProduct[]|undefined>();
  const [category, setCategory] = useState<TypeCategory|undefined>();
  const [sortLabel, setSortLabel] = useState(PRODUCTS_SORT_DATA[0]);
  const [sortType, setSortType] = useState(true);
  const [sortForm, setSortForm] = useState(false);
  const [openForm, setOpenForm] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.PRODUCTS.GET_ALL_PRODUCTS, {
        params:{
          category:category?._id || "",
          sort:`${sortLabel} ${sortType ? "(asc)" : "(desc)"}`,
        },
      });
      if(res.status === 200) {
        setProducts(res.data);
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error fetching products:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    };
  };

  useEffect(() => {
    fetchProducts();
    return () => {};
  },[sortLabel, sortType, category]);

  const handleSortLabel = (label:string) => {
    setSortLabel(label);
    setSortForm(false);
  };

  const refresh = () => {
    setProducts(undefined);
    fetchProducts();
    setOpenForm(false);
  };

  return(
    <ProtectedRoute>
      <AppLayout activeMenu="Products">
        <article className="flex-1 flex flex-col gap-5 mb-10 text-basic">
          <section className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 w-full">
            <h2 className="font-semibold text-3xl">Productos</h2>
{/* Filter */}
            <div className="flex-1 sm:flex-none sm:min-w-64">
              <CategorySelect disabled={!products ? true : false} type="product" currentCategory={category} setCategory={(value:TypeCategory|undefined)=>setCategory(value)}/>
            </div>
          </section>
          <section className="flex-1 flex flex-col">
          {products === undefined &&
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2">
            {[1,2,3].map((item) => (
              <div key={item} className="flex min-h-36">
                <Skeleton/>
              </div>
            ))}
            </div>
          }
          {products && products.length < 1 &&
            <p className="flex-1 flex items-center justify-center font-semibold text-2xl text-quaternary">No hay productos</p>
          }
          {products && products?.length > 0 &&
            <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
            {products?.map((product) => (
              <li key={product._id}>
                <ProductCard product={product} refresh={fetchProducts}/>
              </li>
            ))}
            </ul>
          }
          </section>
{/* Tools (sort, create) */}
          <section className="fixed bottom-2 xl:bottom-4 left-0 w-full flex justify-center">
            <div className="flex flex-wrap justify-between gap-2 w-full max-w-[1750px] px-3">
              <div className="flex gap-1.5 w-fit">
                <button onClick={()=>setSortType(!sortType)} className="flex items-center justify-center size-10 rounded-md text-primary-light dark:text-primary-dark hover:text-primary-dark dark:hover:text-primary-light bg-primary-dark dark:bg-primary-light hover:bg-primary-light dark:hover:bg-primary-dark border-2 border-primary-dark dark:border-primary-light cursor-pointer duration-300">
                {sortType ? 
                  <LuArrowUpNarrowWide className="text-2xl"/>
                :
                  <LuArrowDownWideNarrow className="text-2xl"/>
                }
                </button>
                <button onClick={()=>setSortForm(true)} className="flex items-center justify-center h-10 w-fit px-4 rounded-md font-medium text-lg text-primary-light dark:text-primary-dark hover:text-primary-dark dark:hover:text-primary-light bg-primary-dark dark:bg-primary-light hover:bg-primary-light dark:hover:bg-primary-dark border-2 border-primary-dark dark:border-primary-light cursor-pointer duration-300">
                  {sortLabel}
                </button>
              </div>
            {user && (user.role === "owner" || user.role === "admin") &&
              <button onClick={()=>setOpenForm(true)} className="tool-btn">
                <LuPlus className="text-xl"/>
                Crear Producto
              </button>
            }
            </div>
          </section>
        </article>
{/* Modals */}
        <Modal title="Crear Producto" isOpen={openForm} onClose={()=>setOpenForm(false)}>
          {openForm && <ProductForm refresh={refresh}/>}
        </Modal>
        <Modal title="Ordenar Productos" isOpen={sortForm} onClose={()=>setSortForm(false)}>
          <ul className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
          {PRODUCTS_SORT_DATA.map((value:string) => (
            <li key={value}>
              <button onClick={()=>handleSortLabel(value)} className="flex items-center px-5 h-14 w-full rounded-md text-basic bg-transparent hover:bg-secondary-light dark:hover:bg-secondary-dark border border-secondary-light dark:border-tertiary-dark cursor-pointer duration-300">{value}</button>
            </li>
          ))}
          </ul>
        </Modal>
      </AppLayout>
    </ProtectedRoute>
  );
};