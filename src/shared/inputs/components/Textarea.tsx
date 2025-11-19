export default function Textarea({ autoComplete, name, label, placeholder, defaultValue, value, disabled }:{ autoComplete?:string, name:string, label:string, placeholder:string, defaultValue?:string, value?:string, disabled?:boolean }) {
  return(
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="font-medium text-start text-sm text-tertiary-dark dark:text-tertiary-light">{label}</label>
      <div className="w-full flex justify-between gap-3 px-4 py-3 rounded bg-secondary-light focus-within:bg-primary-light dark:bg-secondary-dark dark:focus-within:bg-primary-dark border border-tertiary-light dark:border-tertiary-dark outline-none duration-300">
        <textarea
          rows={4}
          autoComplete={autoComplete}
          name={name}
          placeholder={placeholder}
          defaultValue={defaultValue}
          disabled={disabled}
          value={value}
          className={`w-full bg-transparent outline-none font-medium text-basic ${disabled ? value ? "cursor-text" : "cursor-not-allowed" : "cursor-text"}`}
        />
      </div>
    </div>
  );
};