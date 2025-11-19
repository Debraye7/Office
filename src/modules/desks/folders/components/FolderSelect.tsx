import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuFolder } from "react-icons/lu";
import { TypeFolder } from "@shared/utils/types";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import Modal from "@shared/components/Modal";

export default function FolderSelect({ disabled, label, selectedFolder, setSelectedFolder }:{ disabled?:boolean, label?:boolean, selectedFolder:TypeFolder|undefined, setSelectedFolder:(folder:TypeFolder|undefined)=>void }) {
  const [openModal, setOpenModal] = useState(false);
  const [folders, setFolders] = useState<TypeFolder[]|undefined>();
  const [tempSelectedFolder, setTempSelectedFolder] = useState<TypeFolder|undefined>(selectedFolder);

  const getFolders = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.FOLDERS.GET_ALL_FOLDERS);
      setFolders(res.data);
      if(selectedFolder) setTempSelectedFolder(selectedFolder);
    } catch (error) {
      if(!isAxiosError(error)) return console.error(error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    };
  };

  useEffect(() => {
    getFolders();
    return () => {};
  },[]);

  const handleFolder = (folder:TypeFolder|undefined) => {
    if(disabled) return;
    setTempSelectedFolder(folder);
    setSelectedFolder(folder);
    setOpenModal(false);
  };

  return(
    <div className={`flex flex-col gap-1 ${disabled && "opacity-50"}`}>
      {label && <label className="font-medium text-start text-sm text-tertiary-dark dark:text-tertiary-light">Carpeta</label>}
      <button type="button" onClick={() => setOpenModal(true)} disabled={disabled} className="card-btn">
        <LuFolder className="text-lg min-w-fit"/>
        <span className="line-clamp-1 text-nowrap text-ellipsis">{!selectedFolder ? "Seleccionar carpeta" : tempSelectedFolder?.title}</span>
      </button>
      <Modal isOpen={openModal} onClose={()=>setOpenModal(false)} title="Seleccionar Carpeta">
        <ul className="flex-1 flex flex-col gap-1 max-h-full overflow-y-auto">
        {folders && folders.length < 1 &&
          <li className="flex items-center justify-center h-full">
            <p className="font-medium text-xl text-quaternary">No hay carpetas</p>
          </li>
        }
        {!label && selectedFolder && 
          <li className="overflow-hidden min-h-fit mr-1 rounded-md bg-transparent hover:bg-secondary-light dark:hover:bg-secondary-dark border-2 border-secondary-light dark:border-secondary-dark duration-300">
            <button type="button" onClick={()=>handleFolder(undefined)} className="flex items-center gap-2 px-5 h-16 w-full cursor-pointer">
              <LuFolder className="text-lg sm:text-xl text-basic"/>
              <span className="font-medium text-sm sm:text-base text-basic">Todas</span>
            </button>
          </li>
        }
        {folders?.map(folder => (
          <li key={folder._id} className={`${!label && folder._id === selectedFolder?._id && "hidden"} flex`}>
            <button type="button" onClick={()=>handleFolder(folder)} className="flex items-center gap-2 py-2 px-4 w-full h-16 rounded-md hover:bg-secondary-light dark:hover:bg-secondary-dark cursor-pointer duration-300">
              <span className="flex items-center justify-center min-h-10 min-w-10 rounded-full text-primary-dark dark:text-primary-light bg-secondary-light dark:bg-secondary-dark">
                <LuFolder className="text-xl"/>
              </span>
              <p className="rounded line-clamp-1 text-start text-primary-dark dark:text-primary-light duration-300">{folder.title}</p>
            </button>
          </li>
        ))}
        </ul>
      </Modal>
    </div>
  );
};