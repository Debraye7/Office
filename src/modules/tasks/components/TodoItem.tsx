export default function Todo({ loading, text, check, onChange }:{ loading:boolean, text:string, check?:boolean, onChange:()=>void }) {
  return(
    <div onClick={onChange} className="flex justify-between items-center gap-2 h-12 px-4 py-2 rounded-md text-xs bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark cursor-pointer duration-300 overflow-hidden">
      <div className="flex items-center gap-2 overflow-hidden">
        <input type="checkbox" readOnly checked={check} disabled={loading} className="min-w-5 min-h-5 rounded-sm outline-none text-blue-light bg-quaternary border-quaternary cursor-pointer"/>
        <p className="text-sm text-basic">{text}</p>
      </div>
    </div>
  );
}