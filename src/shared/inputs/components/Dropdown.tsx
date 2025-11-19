import { ReactNode, useState } from "react";
import { LuChevronDown } from "react-icons/lu";

export default function DropdownSelect({ disabled, label, options, icon, defaultValue, placeholder, handleValue }:{ disabled?:boolean, label?:string, options:{ label:string, value:string }[], defaultValue?:string, icon?:ReactNode, placeholder?:string, handleValue:(value:string)=>void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string|undefined>(defaultValue);

  const handleSelect = (option:string) => {
    if(disabled) return;
    setSelectedValue(option);
    handleValue(option);
    setIsOpen(false);
  };

  return(
    <div className={`flex-1 relative flex flex-col gap-1 max-h-fit ${disabled && "opacity-50"}`}>
      {label && <label className="font-medium text-start text-sm text-tertiary-dark dark:text-tertiary-light">{label}</label>}
      <button type="button" onClick={()=>setIsOpen(!isOpen)} disabled={disabled} className="flex items-center justify-between w-full px-3 min-h-12 rounded-md font-medium text-basic bg-secondary-light dark:bg-secondary-dark focus-within:bg-primary-light dark:focus-within:bg-primary-dark border border-tertiary-light dark:border-tertiary-dark cursor-pointer disabled:cursor-not-allowed duration-300">
        <div className="flex items-center gap-2">
          <span className={`${icon ? "inline" : "hidden"}`}>{icon && icon}</span>
          <p className="line-clamp-1 text-start">{selectedValue ? options.find((opt) => opt.value === selectedValue)?.label : placeholder}</p>
        </div>
        <span className="ml-2 text-lg">
          <LuChevronDown className={`${isOpen && "rotate-180"} duration-300`}/>
        </span>
      </button>
    {isOpen && 
      <ul className="absolute top-full w-full max-h-[50vh] overflow-y-auto mt-1 rounded-md text-basic bg-primary-light dark:bg-primary-dark border border-tertiary-light dark:border-tertiary-dark shadow-md z-10 overflow-hidden" onMouseLeave={()=>setIsOpen(false)}>
      {options.map((opt, index) => (
        <li key={`select_${index}`} onClick={()=>handleSelect(opt.value)} className={`p-3 font-medium text-sm hover:bg-secondary-light dark:hover:bg-secondary-dark cursor-pointer ${opt.value === selectedValue && "hidden"}`}>
          <p className="line-clamp-2">{opt.label}</p>
        </li>
      ))}
      </ul>
    }
    </div>
  );
};