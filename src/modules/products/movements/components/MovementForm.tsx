import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { format, parseISO } from "date-fns";
import { LuCheck, LuTrash2 } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import { TypeCategory, TypeMovement } from "@shared/utils/types";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import { TRANSACTIONS_STATUS_DATA } from "@shared/utils/data";
import Modal from "@shared/components/Modal";
import DeleteAlert from "@shared/components/DeleteAlert";
import DropdownSelect from "@shared/inputs/components/Dropdown";
import DateInput from "@shared/inputs/components/Date";
import Textarea from "@shared/inputs/components/Textarea";
import TextInput from "@shared/inputs/components/Text";
import NumberInput from "@shared/inputs/components/Number";
import CategorySelect from "@shared/inputs/components/CategorySelect";
import { es } from "date-fns/locale";

export default function MovementForm({ product, type, values, refresh }:{ product:string, type:"inflow"|"outflow", values?:TypeMovement, refresh:()=>void }) {
  const { user } = useAuth();

  const [category, setCategory] = useState<TypeCategory|undefined>(values && values.category);
  const [status, setStatus] = useState<string>(values ? values.status : "Finalizado");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const createMovement = async (data:{ title:string, description:string, quantity:number, date:Date }) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post(API_PATHS.PRODUCTS.CREATE_MOVEMENT, { productId:product, ...data, type, category:category?._id, status });
      if(res.status === 201) {
        toast.success(res.data.message);
        refresh();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error creating movement:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    } finally {
      setLoading(false);
    };
  };

  const updateMovement = async (data:{ title:string, description:string, quantity:number, date:Date }) => {
    if(!values) return;
    setLoading(true);
    try {
      const res = await axiosInstance.put(API_PATHS.PRODUCTS.UPDATE_MOVEMENT(values._id), { ...data, category:category?._id, status });
      if(res.status === 201) {
        toast.success(res.data.message);
        refresh();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error updating movement:", error);
      if(error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      };
    } finally {
      setLoading(false);
    };
  };

  const deleteMovement = async () => {
    if(!values) return;
    try {
      const res = await axiosInstance.delete(API_PATHS.PRODUCTS.DELETE_MOVEMENT(values._id));
      if(res.status === 200) {
        toast.success(res.data.message);
        refresh();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error deleting movement:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    };
  };

  const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title')?.toString() || "";
    const description = formData.get('description')?.toString() || "";
    const quantity = Number(formData.get('quantity')?.toString() || "");
    const textDate = formData.get('date')?.toString() || undefined;
    const date = textDate ? parseISO(`${textDate} ${format(new Date(), "HH:mm:ss")}`) : undefined;

//! Validate form data
    if(!title?.trim()) return setError("Título obligatorio.");
    if(!date) return setError("Fecha obligatoria.");
    if(!quantity) return setError("Cantidad obligatoria.");
    // if(!category) return setError("Categoría obligatoria.");

    if(!values) createMovement({ title, description, quantity, date });
    if(values) updateMovement({ title, description, quantity, date });
  };

  return(
    <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col gap-4 max-h-full">
      <div className="flex flex-col gap-4 pr-4 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <CategorySelect label currentCategory={category} type="movement" setCategory={(selectedCategory:TypeCategory|undefined)=>setCategory(selectedCategory)}/>
          <DropdownSelect
            label="Estado"
            options={TRANSACTIONS_STATUS_DATA}
            placeholder="Seleccionar estado"
            defaultValue={values?.status || TRANSACTIONS_STATUS_DATA[1].value}
            handleValue={(value:string)=>setStatus(value)}
          />
          <DateInput
            name="date"
            label="Fecha"
            defaultValue={values?.date ? values.date : new Date()}
          />
          <NumberInput
            name="quantity"
            label="Cantidad"
            placeholder="Número de unidades"
            defaultValue={values ? values.quantity : 1}
            negative={type === "outflow"}
          />
        </div>
        <TextInput
          name="title"
          label="Concepto"
          placeholder="Concepto del movimiento"
          defaultValue={values?.title || ""}
        />
        <Textarea
          name="description"
          label="Descripción"
          placeholder="Descripción del movimiento"
          defaultValue={values?.description || ""}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <p className="flex-1 flex items-center min-h-2 font-medium text-xs text-red-light dark:text-red-dark overflow-hidden">{error}</p>
        <div className="flex flex-wrap-reverse gap-2">
        {user?.role === "owner" && values && 
          <button type="button" onClick={()=>setOpenAlert(true)} className="flex-1 sm:flex-auto card-btn-red w-fit sm:min-w-52">
            <LuTrash2 className="text-xl"/>
            Eliminar
          </button>
        }
          <button type="submit" disabled={loading} className="flex-1 sm:flex-auto card-btn-fill w-fit sm:min-w-52">
            <LuCheck className="text-xl"/>
            Confirmar
          </button>
        </div>
      </div>
      <Modal title="Eliminar Movimiento" isOpen={openAlert} onClose={()=>setOpenAlert(false)}>
        {<DeleteAlert content="¿Estás seguro de que quieres eliminar este movimiento?" description="Se modificara el stock del producto" onDelete={deleteMovement}/>}
      </Modal>
    </form>
  );
};