import { FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuCheck, LuTrash2 } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import { TypeAssigned, TypeFolder, TypeInventory } from "@shared/utils/types";
import Modal from "@shared/components/Modal";
import DeleteAlert from "@shared/components/DeleteAlert";
import AssignedSelect from "@shared/inputs/components/Assigned";
import TextInput from "@shared/inputs/components/Text";
import FolderSelect from "@folders/components/FolderSelect";

export default function InventoryForm({ values, refresh }:{ values?:TypeInventory, refresh:()=>void }) {
  const { user } = useAuth();

  const [assignedTo, setAssignedTo] = useState<TypeAssigned[]>(values ? values.assignedTo : []);
  const [folder, setFolder] = useState<TypeFolder|undefined>(values?.folder);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const createInventory = async (data:{ title:string, location:string }) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post(API_PATHS.INVENTORIES.CREATE_INVENTORY, { ...data, folder:folder?._id, assignedTo:assignedTo.map(member => member._id) });
      if(res.status === 201) {
        toast.success(res.data.message);
        refresh();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error creating inventory:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    } finally {
      setLoading(false);
    };
  };

  const updateInventory = async (data:{ title:string, location:string }) => {
    if(!values) return;
    setLoading(true);
    try {
      const res = await axiosInstance.put(API_PATHS.INVENTORIES.UPDATE_INVENTORY(values?._id), { ...data, folder:folder?._id, assignedTo });
      if(res.status === 201) {
        toast.success(res.data.message);
        refresh();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error updating inventory:", error);
      if(error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      };
    } finally {
      setLoading(false);
    };
  };

  const deleteInventory = async () => {
    if(!values) return;
    setLoading(true);
    try {
      const res = await axiosInstance.delete(API_PATHS.INVENTORIES.DELETE_INVENTORY(values._id));
      if(res.status === 200) {
        toast.success(res.data.message);
        refresh();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error deleting inventory:", error);
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
    const location = formData.get('location')?.toString() || "";

//! Validate form data
    if(!title?.trim()) return setError("Título obligatorio.");
    if(assignedTo.length < 1) return setError("Asignada al menos un miembro.");
    if(!folder) return setError("Selecciona una carpeta.");

    if(!values) createInventory({ title, location });
    if(values) updateInventory({ title, location });
  };

  return(
    <form onSubmit={(e) => handleSubmit(e)} className="flex-1 flex flex-col gap-4 max-h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FolderSelect
          label
          selectedFolder={folder}
          setSelectedFolder={(selectedFolder:TypeFolder|undefined)=>setFolder(selectedFolder)}
        />
        <AssignedSelect
          label
          selectedUsers={assignedTo}
          setSelectedUsers={(assignedToList:TypeAssigned[])=>setAssignedTo(assignedToList)}
        />
      </div>
      <div className="flex-1 flex flex-col gap-4 pr-4 overflow-y-auto">
        <TextInput
          name="title"
          label="Título"
          placeholder="Nombre del inventario"
          defaultValue={values?.title || ""}
        />
        <TextInput
          name="location"
          label="Ubicación"
          placeholder="Ubicación del inventario"
          defaultValue={values?.location || ""}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
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
      </div>
      <Modal title="Eliminar Inventario" isOpen={openAlert} onClose={()=>setOpenAlert(false)}>
        {<DeleteAlert content="¿Estás seguro de que quieres eliminar este inventario?" description="Se eliminaran todas sus productos y movimientos" onDelete={deleteInventory}/>}
      </Modal>
    </form>
  );
};