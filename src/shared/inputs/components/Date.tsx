import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function DateInput({ name, label, defaultValue, value, disabled, handle }: { name:string, label:string, defaultValue?:Date, value?:Date, disabled?:boolean, handle?:(value:string)=>void }) {
  return(
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="font-medium text-start text-sm text-tertiary-dark dark:text-tertiary-light">{label}</label>
      <div className="flex justify-between items-center w-full px-2.5 py-3 rounded-md font-medium text-basic bg-secondary-light dark:bg-secondary-dark focus-within:bg-primary-light dark:focus-within:bg-primary-dark border border-tertiary-light dark:border-tertiary-dark">
        <input 
          type="date"
          name={name}
          defaultValue={defaultValue ? format(defaultValue, "yyyy-MM-dd", { locale:es }) : undefined}
          value={value ? format(value, "yyyy-MM-dd", { locale:es }) : undefined}
          className="w-full bg-transparent outline-none font-medium text-basic disabled:cursor-not-allowed disabled:opacity-25"
          onChange={handle ? (e)=>handle(e.target.value) : undefined}
          disabled={disabled}
        />
      </div>
    </div>
  );
};