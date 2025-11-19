import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function TimeInput({ name, defaultValue, value, label, disabled, handle }: { name:string, defaultValue?:Date, value?:Date, label:string, disabled?:boolean, handle?:(value:string)=>void }) {
  return(
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="font-medium text-sm text-tertiary-dark dark:text-tertiary-light">{label}</label>
      <div className="flex justify-between items-center w-full px-2.5 py-3 rounded-md font-medium text-sm text-basic bg-secondary-light dark:bg-secondary-dark focus-within:bg-primary-light dark:focus-within:bg-primary-dark border border-tertiary-light dark:border-tertiary-dark">
        <input type="time"
          name={name}
          defaultValue={defaultValue && format(defaultValue || new Date(), "HH:mm", { locale:es })}
          value={value && format(value || new Date(), "HH:mm", { locale:es })}
          className="w-full bg-transparent outline-none font-medium text-basic disabled:cursor-not-allowed disabled:opacity-25"
          lang="es-MX"
          disabled={disabled}
          onChange={handle ? (e)=>handle(e.target.value) : undefined}
        />
      </div>
    </div>
  );
};