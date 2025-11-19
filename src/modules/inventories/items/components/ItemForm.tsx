import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { LuCheck, LuTrash2 } from "react-icons/lu";
import { isAxiosError } from "axios";
import { useAuth } from "@shared/context/AuthContext";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import { TypeCategory, TypeItem } from "@shared/utils/types";
import Modal from "@shared/components/Modal";
import DeleteAlert from "@shared/components/DeleteAlert";
import NumberInput from "@shared/inputs/components/Number";
import TextInput from "@shared/inputs/components/Text";
import Textarea from "@shared/inputs/components/Textarea";
import CategorySelect from "@shared/inputs/components/CategorySelect";

export default function ItemForm({ inventory, values, refresh }:{ inventory:string, values?:TypeItem, refresh:()=>void }) {
  const { user } = useAuth();

  const [category, setCategory] = useState<TypeCategory|undefined>(values?.category);
  const [error, setError] = useState("");
  const [openAlert, setOpenAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  const createItem = async (data:{ title:string, description:string, price:string }) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post(API_PATHS.INVENTORIES.ITEMS.CREATE_ITEM, { inventory, ...data, category:category?._id });
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

  const updateItem = async (data:{ title:string, description:string, price:string }) => {
    if(!values) return;
    setLoading(true);
    try {
      const res = await axiosInstance.put(API_PATHS.INVENTORIES.ITEMS.UPDATE_ITEM(values._id), { ...data, category:category?._id });
      if(res.status === 201) {
        toast.success(res.data.message);
        refresh();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error updating item:", error);
      if(error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      };
    } finally {
      setLoading(false);
    };
  };

  const deleteItem = async () => {
    if(!values) return;
    setLoading(true);
    try {
      const res = await axiosInstance.delete(API_PATHS.INVENTORIES.ITEMS.DELETE_ITEM(values._id));
      if(res.status === 200) {
        toast.success(res.data.message);
        refresh();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error deleting item:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    } finally {
      setLoading(false);
    };
  };

  const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title')?.toString() || "";
    const description = formData.get('description')?.toString() || "";
    const price = formData.get('price')?.toString() || "0";

//! Validate form data
    if(!title?.trim()) return setError("Título obligatorio.");
    if(!category) return setError("Selecciona una categoría.");

    if(!values) createItem({ title, description, price });
    if(values) updateItem({ title, description, price });
  };

  return(
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col max-h-full">
      <section className="flex-1 flex flex-col gap-2 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <NumberInput
            name="price"
            label="Precio"
            placeholder="Precio del artículo"
            defaultValue={values?.price || 0}
          />
          <CategorySelect
            label
            type="item"
            currentCategory={category}
            setCategory={(value:TypeCategory|undefined)=>setCategory(value)}
          />
        </div>
        <TextInput
          name="title"
          label="Título"
          placeholder="Nombre del artículo"
          defaultValue={values?.title || ""}
        />
        <Textarea
          name="description"
          label="Descripción"
          placeholder="Descripción del artículo"
          defaultValue={values?.description || ""}
        />
      </section>
      <section className="flex flex-col sm:flex-row gap-2">
        <p className="flex-1 flex items-center min-h-2 font-medium text-xs text-red-light dark:text-red-dark overflow-hidden">{error}</p>
        <div className="flex flex-wrap-reverse gap-2">
        {user?.role === "owner" && values &&
          <button type="button" disabled={loading} onClick={()=>setOpenAlert(true)} className="flex-1 sm:flex-auto card-btn-red w-fit sm:min-w-52">
            <LuTrash2 className="text-xl"/>
            Eliminar
          </button>
        }
          <button type="submit" disabled={loading} className="flex-1 sm:flex-auto card-btn-fill w-fit sm:min-w-52">
            <LuCheck className="text-xl"/>
            Confirmar
          </button>
        </div>
      </section>
      <Modal title="Eliminar Inventario" isOpen={openAlert} onClose={()=>setOpenAlert(false)}>
        {<DeleteAlert content="¿Estás seguro de que quieres eliminar este artículo?" onDelete={deleteItem}/>}
      </Modal>
    </form>
  );
};