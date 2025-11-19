import { ChangeEvent, useState } from "react";

export default function CheckboxInput({ name, label, defaultValue, disabled, handle }: { name:string, label:string, defaultValue?:boolean, disabled?:boolean, handle:(newValue:boolean)=>void }) {
  const [checked, setChecked] = useState(defaultValue || false);

  const handleChecked = (value:boolean) => {
    setChecked(value);
    if(handle) handle(value);
  };

  return(
    <div 
      onClick={!disabled ? ()=>handleChecked(!checked) : undefined}
      className={`flex items-center gap-2 w-fit h-fit px-5 py-3 rounded-md font-medium text-sm text-basic bg-secondary-light dark:bg-secondary-dark hover:bg-primary-light dark:hover:bg-primary-dark border border-tertiary-light dark:border-tertiary-dark duration-300 ${!disabled ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
    >
      <input type="checkbox"
        name={name}
        checked={checked}
        className="size-4 bg-transparent outline-none font-medium text-basic cursor-pointer disabled:cursor-not-allowed"
        disabled={disabled}
        onChange={(e:ChangeEvent<HTMLInputElement>)=>handleChecked(e.target.checked)}
      />
      <label 
        htmlFor={name}
        className={`font-medium text-sm text-tertiary-dark dark:text-tertiary-light ${!disabled ? "cursor-pointer" : "cursor-not-allowed"}`}
      >
        {label}
      </label>
    </div>
  );
};