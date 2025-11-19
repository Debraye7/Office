import { ReactNode } from "react";
import { FaRegCircleXmark } from "react-icons/fa6";

export default function ModalB({ children, onClose, title, }:{ children:ReactNode, onClose:()=>void, title:string }) {
  return(
    <div className="flex-1 flex flex-col sm:h-full bg-primary-light dark:bg-primary-dark rounded-lg overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2 rounded-t border-b-2 border-secondary-light dark:border-secondary-dark">
        <h3 className="font-medium text-lg text-basic">{title}</h3>
        <button type="button" onClick={onClose} className="rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center text-primary-dark dark:text-primary-light hover:text-red-light dark:hover:text-red-dark cursor-pointer duration-300">
          <FaRegCircleXmark className="text-2xl"/>
        </button>
      </div>
      <div className="flex-1 flex flex-col gap-4 p-3 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};