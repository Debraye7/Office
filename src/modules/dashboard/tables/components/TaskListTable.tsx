import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TypeTask } from "@shared/utils/types";

export default function TaskListTable({ tableData }:{ tableData:TypeTask[]}) {
  const getStatusBadgeColor = (status?:string) => {
    switch (status) {
      case "Pendiente":
        return "text-red-light dark:text-red-dark border-red-light dark:border-red-dark";
      case "En curso":
        return "text-yellow-light dark:text-yellow-dark border-yellow-light dark:border-yellow-dark";
      case "Finalizada":
        return "text-green-light dark:text-green-dark border-green-light dark:border-green-dark";
      case "Aprobada":
        return "text-blue-light dark:text-blue-dark border-blue-light dark:border-blue-dark";
      default:
        return "text-quaternary border-quaternary";
    };
  };

  const getPriorityBadgeColor = (priority:string) => {
    switch (priority) {
      case "Alta":
        return "text-red-light dark:text-red-dark border-red-light dark:border-red-dark";
      case "Media":
        return "text-yellow-light dark:text-yellow-dark border-yellow-light dark:border-yellow-dark";
      case "Baja":
        return "text-green-light dark:text-green-dark border-green-light dark:border-green-dark";
      default:
        return "text-quaternary border-quaternary";
    };
  };

  return(
    <div className="overflow-x-auto p-0 rounded-lg mt-3">
      <table className="min-w-full">
        <thead>
          <tr className="text-left">
            <th className="py-3 px-4 font-medium text-[13px] text-quaternary">Título</th>
            <th className="py-3 px-4 font-medium text-[13px] text-quaternary">Estado</th>
            <th className="py-3 px-4 font-medium text-[13px] text-quaternary">Prioridad</th>
            <th className="py-3 px-4 font-medium text-[13px] text-quaternary hidden md:table-cell">Fecha de creación</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((task:TypeTask) => (
            <tr key={task._id} className="border-t-2 border-tertiary-light dark:border-tertiary-dark">
              <td className="flex items-center p-4 overflow-hidden font-semibold text-[13px] text-basic">
                {task.title}
              </td>
              <td className={`p-4`}>
                <span className={`p-1 min-w-20 font-semibold text-center text-xs rounded inline-block border-2 ${getStatusBadgeColor(task.status)}`}>
                  {task.status}
                </span>
              </td>
              <td className={`p-4`}>
                <span className={`p-1 min-w-16 font-semibold text-center text-xs rounded inline-block border-2 ${getPriorityBadgeColor(task.priority)}`}>
                  {task.priority}
                </span>
              </td>
              <td className="hidden md:table-cell p-4 text-nowrap font-medium text-[13px] text-tertiary-dark dark:text-tertiary-light">
                {task.createdAt ? format(task.createdAt, "dd/MM/yyyy", { locale:es }) : "N/D"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};