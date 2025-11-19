import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuCheck, LuTrash2 } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import { API_PATHS } from "@shared/utils/apiPaths";
import { TypeAccount, TypeAssigned, TypeFolder } from "@shared/utils/types";
import axiosInstance from "@shared/utils/axiosInstance";
import Modal from "@shared/components/Modal";
import DeleteAlert from "@shared/components/DeleteAlert";
import AssignedSelect from "@shared/inputs/components/Assigned";
import TextInput from "@shared/inputs/components/Text";
import FolderSelect from "@folders/components/FolderSelect";
import DropdownSelect from "@shared/inputs/components/Dropdown";
import { ACCOUNTS_TYPE } from "@shared/utils/data";

export default function AccountForm({ values, refresh, }:{ values?:TypeAccount, refresh?:()=>void }) {
  const { user } = useAuth();
  const router = useRouter();

  const [assignedTo, setAssignedTo] = useState<TypeAssigned[]>(values ? values.assignedTo : []);
  const [folder, setFolder] = useState<TypeFolder|undefined>(values?.folder);
  const [type, setType] = useState<string|undefined>(values?.type || "cash");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const createAccount = async (title:string) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post(API_PATHS.ACCOUNTS.CREATE_ACCOUNT, { title, type, folder:folder?._id, assignedTo });
      if(res.status === 201) {
        toast.success(res.data.message);
        router.push(`/accounts/${res.data.account._id}`);
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error creating account:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    } finally {
      setLoading(false);
    };
  };

  const updateAccount = async (title:string) => {
    if(!values || !refresh) return;
    setLoading(true);
    try {
      const res = await axiosInstance.put(API_PATHS.ACCOUNTS.UPDATE_ACCOUNT(values?._id), { title, type, folder:folder?._id, assignedTo });
      if(res.status === 200) {
        refresh();
        toast.success(res.data.message);
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error updating account:", error);
      if(error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      };
    } finally {
      setLoading(false);
    };
  };

  const deleteAccount = async () => {
    if(!values || !refresh) return;
    setLoading(true);
    try {
      const res = await axiosInstance.delete(API_PATHS.ACCOUNTS.DELETE_ACCOUNT(values._id));
      if(res.status === 200) {
        refresh();
        toast.success(res.data.message);
        router.push("/accounts");
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error deleting account:", error);
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

//! Validate form data
    if(!title?.trim()) return setError("Título obligatorio.");
    if(assignedTo.length < 1) return setError("Asignada al menos un miembro.");
    if(!folder) return setError("Selecciona una carpeta.");

    if(!values) createAccount(title);
    if(values) updateAccount(title);
  };

  return(
    <form onSubmit={(e) => handleSubmit(e)} className="flex-1 flex flex-col gap-4 max-h-full">
      <div className="flex-1 flex flex-col gap-4 pr-4 overflow-y-auto">
        <TextInput
          name="title"
          label="Título"
          placeholder="Título de la cuenta"
          defaultValue={values?.title || ""}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <DropdownSelect 
            label="Tipo"
            options={ACCOUNTS_TYPE}
            defaultValue={type}
            handleValue={(value)=>setType(value)}
          />
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
      <Modal title="Eliminar Cuenta" isOpen={openAlert} onClose={()=>setOpenAlert(false)}>
        {<DeleteAlert content="¿Estás seguro de que quieres eliminar esta cuenta?" description="Se eliminaran todas sus transacciones" onDelete={deleteAccount}/>}
      </Modal>
    </form>
  );
};