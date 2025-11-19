import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuFolderPen, LuPlus } from "react-icons/lu";
import { TypeFolder } from "@shared/utils/types";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import Skeleton from "@shared/components/Skeleton";
import Modal from "@shared/components/Modal";
import FolderForm from "@folders/components/FolderForm";

export default function Folders() {
  const [folders, setFolders] = useState<TypeFolder[]|undefined>();
  const [folder, setFolder] = useState<TypeFolder|undefined>();
  const [openForm, setOpenForm] = useState(false);

  const fetchFolders = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.FOLDERS.GET_ALL_FOLDERS);
      setFolders(res.data);
    } catch (error) {
      if(!isAxiosError(error)) return console.error(error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    }
  };

  useEffect(() => {
    fetchFolders();
    return () => {};
  },[]);

  // const addFolder = (newFolder:TypeFolder) => {
  //   setFolders((prev) => prev ? [...prev, newFolder] : [newFolder]);
  // };

  // const updateFolder = (updatedFolder:TypeFolder) => {
  //   const collection = folders ? folders : [];
  //   const index = collection.findIndex((f) => f._id === updatedFolder._id);
  //   collection[index] = updatedFolder;
  //   setFolders(collection);
  // };

  // const deleteFolder = (deletedFolder:TypeFolder) => {
  //   const collection = folders ? folders.filter((f) => f._id !== deletedFolder._id) : [];
  //   setFolders(collection);
  // };

  const selectFolder = (selectedFolder:TypeFolder) => {
    setFolder(selectedFolder);
    setOpenForm(true);
  };

  const closeForm = () => {
    setFolder(undefined);
    setOpenForm(false);
  };

  return(
    <div className="flex-1 flex flex-col gap-4 md:gap-5 max-h-full">
      <ul className="flex-1 flex flex-col gap-2 overflow-y-auto">
      {folders === undefined && [1,2].map(i => (
        <li key={`folder-${i}`} className="flex w-full h-16">
          <Skeleton/>
        </li>
      ))}
      {folders?.map(folder => (
        <li key={folder._id} className="  rounded-md border-2 text-basic bg-transparent hover:bg-secondary-light dark:hover:bg-secondary-dark border-secondary-light dark:border-secondary-dark duration-300">
          <button type="button" onClick={()=>selectFolder(folder)} className="flex items-center gap-3 px-5 h-16 w-full cursor-pointer">
            <LuFolderPen className="text-2xl"/>
            <span className="font-semibold text-xl">{folder.title}</span>
          </button>
        </li>
      ))}
      {folders && folders?.length < 1 && 
        <li className="flex-1 flex items-center justify-center">
          <p className="font-semibold text-lg text-quaternary">No hay carpetas</p>
        </li>
      }
      </ul>
      <section className="flex flex-wrap-reverse justify-end gap-2">
        <button onClick={()=>setOpenForm(true)} type="button" className="flex-1 sm:flex-auto card-btn-fill w-fit sm:max-w-52">
          <LuPlus className="text-xl"/>
          Crear Carpeta
        </button>
      </section>
      <Modal title={`${!folder ? "Crear" : "Editar"} Carpeta`} isOpen={openForm} onClose={closeForm}>
        {openForm && <FolderForm value={folder} closeForm={closeForm} refresh={fetchFolders}/>}
      </Modal>
    </div>
  );
};