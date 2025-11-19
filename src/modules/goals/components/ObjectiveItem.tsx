import { TypeObjective } from "@/src/shared/utils/types";
import { format, startOfDay } from "date-fns";

export default function ObjectiveItem({ loading, objective, onChange }:{ loading:boolean, objective:TypeObjective, onChange:()=>void }) {
  
  const getDateColor = () => {
    if(!objective.dueDate || !objective.deadline) return "text-quaternary";
    if(format(objective.deadline, "yyyy-MM-dd") === format(objective.dueDate, "yyyy-MM-dd")) return "text-yellow-light dark:text-yellow-dark";
    if(startOfDay(objective.deadline) > startOfDay(objective.dueDate)) return "text-green-light dark:text-green-dark";
    if(startOfDay(objective.deadline) < startOfDay(objective.dueDate)) return "text-red-light dark:text-red-dark";
  }; 
  
  return(
    <li onClick={onChange} className="flex justify-between items-center gap-2 min-h-12 px-4 py-2 rounded-md text-xs bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark cursor-pointer duration-300 overflow-hidden">
      <div className="flex gap-2 w-full overflow-hidden">
        <input type="checkbox" readOnly checked={objective.completed} disabled={loading} className="self-start min-w-5 min-h-5 rounded-sm outline-none text-blue-light bg-quaternary border-quaternary cursor-pointer"/>
        <div className="flex-1 flex flex-col justify-center">
          <span className="line-clamp-1 text-xs text-quaternary">{objective.deadline ? `Fecha objetivo: ${format(objective.deadline, "dd/MM/yyyy")}` : "Sin fecha limite"}</span>
          <p className="text-sm text-basic">{objective.text}</p>
        </div>
        <span className={`self-start line-clamp-1 font-medium text-xs ${getDateColor()}`}>{objective.dueDate && format(objective.dueDate, "dd/MM/yyyy")}</span>
      </div>
    </li>
  );
};