"use client"

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuPlus } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import { TypeFolder, TypeInventory } from "@shared/utils/types";
import AppLayout from "@shared/layouts/AppLayout";
import Skeleton from "@shared/components/Skeleton";
import Modal from "@shared/components/Modal";
import ProtectedRoute from "@app/ProtectedRoute";
import FolderSelect from "@folders/components/FolderSelect";
import InventoryCard from "@inventories/components//InventoryCard";
import InventoryForm from "@inventories/components/InventoryForm";

export default function InventoriesPage() {
  const { user } = useAuth();

  const [inventories, setInventories] = useState<TypeInventory[]|undefined>();
  const [filterFolder, setFilterFolder] = useState<TypeFolder|undefined>();
  const [openForm, setOpenForm] = useState(false);

  const fetchInventories = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.INVENTORIES.GET_ALL_INVENTORIES, {
        params:{
          folder:!filterFolder ? "" : filterFolder._id,
        },
      });
      setInventories(res.data.length > 0 ? res.data : []);
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error fetching inventories:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    };
  };

  useEffect(() => {
    fetchInventories();
    return () => {};
  },[filterFolder]);

  const handleFilterFolder = (value:TypeFolder|undefined) => {
    setInventories(undefined);
    setFilterFolder(value);
  };

  const refresh = () => {
    fetchInventories();
    setOpenForm(false);
  };

  return(
    <ProtectedRoute>
      <AppLayout activeMenu="Inventarios">
        <article className="flex-1 flex flex-col gap-5 mb-10 text-basic min-w-full">
          <section className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 w-full">
            <h2 className="font-semibold text-3xl">Inventarios</h2>
{/* Filter */}
            <div className="flex-1 sm:flex-none sm:min-w-64">
              <FolderSelect disabled={!inventories ? true : false} selectedFolder={filterFolder} setSelectedFolder={handleFilterFolder}/>
            </div>
          </section>
{/* Loading */}
        {inventories === undefined &&
          <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
          {[1,2].map((i) => (
            <div key={`card-${i}`} className="flex min-h-56 md:min-h-64 min-w-full">
              <Skeleton/>
            </div>
          ))}
          </section>
        }
{/* There are inventories */}
        {inventories && inventories?.length > 0 &&
          <ul className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 min-w-full">
          {inventories.map((inventory) => (
            <InventoryCard
              key={inventory._id}
              inventory={inventory}
              refresh={fetchInventories}
            />
          ))}
          </ul>
        }
{/* There are no inventories */}
        {inventories && inventories.length < 1 &&
          <section className="flex-1 flex items-center justify-center">
            <p className="font-semibold text-2xl text-quaternary">No hay inventarios</p>
          </section>
        }
{/* Tools (sort, create) */}
          <section className="fixed bottom-2 xl:bottom-4 left-0 w-full flex justify-center">
            <div className="flex flex-wrap justify-end gap-2 w-full max-w-[1750px] px-3">
            {user && (user.role === "owner" || user.role === "admin") &&
              <button onClick={()=>setOpenForm(true)} className="tool-btn">
                <LuPlus className="text-xl"/>
                Crear Inventario
              </button>
            }
            </div>
          </section>
        </article>
{/* Modals */}
        <Modal title="Crear Inventario" isOpen={openForm} onClose={()=>setOpenForm(false)}>
          {openForm && <InventoryForm refresh={refresh}/>}
        </Modal>
      </AppLayout>
    </ProtectedRoute>
  );
};