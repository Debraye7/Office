import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TypeEvent } from "@shared/utils/types";

export default function EventListTable({ tableData }:{ tableData:TypeEvent[] }) {
  return(
    <div className="overflow-x-auto p-0 rounded-lg mt-3">
      <table className="min-w-full">
        <thead>
          <tr className="text-left">
            <th className="py-3 px-4 font-medium text-[13px] text-quaternary">Título</th>
            <th className="py-3 px-4 font-medium text-[13px] text-quaternary">Inicio</th>
            <th className="py-3 px-4 font-medium text-[13px] text-quaternary">Final</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((event) => (
            <tr key={event._id} className="border-t-2 font-semibold text-basic border-tertiary-light dark:border-tertiary-dark">
              <td className="flex items-center p-4 overflow-hidden text-xs">
                {event.title}
              </td>
              <td className={`p-4 text-xs`}>
                {format(event.start, "dd/MM/yyyy", { locale:es })}
              </td>
              <td className={`p-4 text-xs`}>
                {format(event.end, "dd/MM/yyyy", { locale:es })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};