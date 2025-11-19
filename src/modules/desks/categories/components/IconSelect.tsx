import { useState } from "react";
import { LuSquarePen } from "react-icons/lu";
import { ICONS } from "@shared/utils/data";
import Modal from "@shared/components/Modal";

export default function IconSelect({ currentIcon, setIcon }:{ currentIcon:number|undefined, setIcon:(index:number)=>void }) {
  const [index, setIndex] = useState(currentIcon || 0);
  const [state, setState] = useState(false);

  const chooseIcon = (index:number) => {
    setIcon(index);
    setIndex(index);
    setState(false);
  };

  const getPreview = () => {
    const Icon = ICONS[index];
    return <Icon className="text-2xl"/>
  };

  return(
    <div className="flex flex-col gap-1">
      <label className="font-medium text-sm text-tertiary-dark dark:text-tertiary-light">Icono</label>
      <button type="button" onClick={()=>setState(true)} className="relative flex items-center justify-center w-12 xl:w-14 h-12 xl:h-14 rounded-full text-basic bg-secondary-light dark:bg-secondary-dark hover:bg-transparent border border-tertiary-light dark:border-tertiary-dark cursor-pointer duration-300">
        {getPreview()}
        <div className="absolute -bottom-2 -right-1 flex items-center justify-center w-6 xl:w-8 h-6 xl:h-8 rounded-full text-primary-light dark:text-primary-dark bg-primary-dark dark:bg-primary-light">
          <LuSquarePen className="text-xs xl:text-sm"/>
        </div>
      </button>
    {state &&
      <Modal title="Elige un icono" isOpen={state} onClose={()=>setState(false)}>
        <ul className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-full overflow-y-auto">
        {ICONS.map((Icon, index) => (
          <li key={index} className={`flex-1 ${index < 2 ? "hidden" : "flex"} justify-center h-fit`}>
            <span className={`relative w-14 sm:w-16 xl:w-20 h-14 sm:h-16 xl:h-20 flex items-center justify-center rounded-full border-2 border-transparent hover:border-primary-dark dark:hover:border-primary-light ${index === currentIcon ? "text-primary-light dark:text-primary-dark bg-primary-dark dark:bg-primary-light" : "text-primary-dark dark:text-primary-light bg-transparent"}  overflow-hidden cursor-pointer duration-300`} onClick={() => chooseIcon(index)}>
              <Icon className="text-3xl"/>
            </span>
          </li>
        ))}
        </ul>
      </Modal>
    }
    </div>
  );
};