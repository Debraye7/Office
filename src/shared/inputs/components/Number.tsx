export default function NumberInput({ autoComplete, name, label, placeholder, negative, defaultValue, decimal, disabled }:{ autoComplete?:string, name:string, label:string, placeholder:string, negative?:boolean, defaultValue?:number, decimal?:boolean, disabled?:boolean }) {
  return(
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="font-medium text-sm text-tertiary-dark dark:text-tertiary-light">{label}</label>
      <div className="w-full flex items-center justify-between gap-2 px-4  rounded bg-secondary-light focus-within:bg-primary-light dark:bg-secondary-dark dark:focus-within:bg-primary-dark border border-tertiary-light dark:border-tertiary-dark outline-none duration-300">
        <span className="font-semibold text-basic">{negative ? "-" : "+"}</span>
        <input
          id={name}
          type="number"
          autoComplete={autoComplete}
          name={name}
          placeholder={placeholder}
          min={0}
          defaultValue={defaultValue}
          disabled={disabled}
          className="w-full bg-transparent outline-none py-3 font-medium text-basic disabled:cursor-not-allowed disabled:opacity-25"
          step={decimal ? "0.01" : "1"}
        />
      </div>
    </div>
  );
};