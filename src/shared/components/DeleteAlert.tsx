import { LuTrash2 } from "react-icons/lu";

export default function DeleteAlert({ content, description, error, onDelete }:{ content:string, description?:string, error?:string, onDelete:()=>void }) {
  return(
    <div className="flex-1 flex flex-col max-h-full">
      <div className="flex-1 flex flex-col items-center justify-center gap-2 overflow-y-auto">
        <p className="font-semibold text-center text-sm sm:text-base text-basic">{content}</p>
        <p className="font-semibold text-center text-base sm:text-lg text-red-light dark:text-red-dark">{description}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <p className="flex-1 flex items-center min-h-5 font-medium text-xs text-red-light dark:text-red-dark overflow-hidden">{error}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onDelete} className="flex-1 sm:flex-auto card-btn-red w-fit sm:min-w-52">
            <LuTrash2 className="text-xl"/>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};