import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TypeTransaction } from "@shared/utils/types";

export default function TransactionsListTable({ tableData }:{ tableData:TypeTransaction[]}) {
  const getStatusBadgeColor = (status?:string) => {
    switch (status) {
      case "Pendiente":
        return "text-yellow-light dark:text-yellow-dark border-yellow-light dark:border-yellow-dark";
      case "Finalizado":
        return "text-green-light dark:text-green-dark border-green-light dark:border-green-dark";
      case "Cancelado":
        return "text-red-light dark:text-red-dark border-red-light dark:border-red-dark";
      default:
        return "text-quaternary border-quaternary";
    };
  };

  return(
    <div className="overflow-x-auto p-0 rounded-lg mt-3">
      <table className="min-w-full">
        <thead>
          <tr className="text-left">
            <th className="py-3 px-4 font-medium text-sm text-quaternary">Título</th>
            <th className="py-3 px-4 font-medium text-sm text-quaternary">Estado</th>
            <th className="py-3 px-4 font-medium text-sm text-quaternary">Monto</th>
            <th className="hidden md:table-cell py-3 px-4 font-medium text-sm text-quaternary">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((transaction:TypeTransaction) => (
            <tr key={transaction._id} className="border-t-2 border-tertiary-light dark:border-tertiary-dark">
              <td className="flex items-center p-4 overflow-hidden font-semibold text-[13px] text-basic">
                {transaction.title}
              </td>
              <td className={`p-4`}>
                <span className={`p-1 min-w-20 font-semibold text-center text-xs rounded inline-block border-2 ${getStatusBadgeColor(transaction.status)}`}>
                  {transaction.status}
                </span>
              </td>
              <td className={`p-4`}>
                <span className={`p-1 min-w-16 font-semibold text-center text-xs rounded inline-block border-2 ${transaction.type === "income" ? "text-green-light dark:text-green-dark border-green-light dark:border-green-dark" : "text-red-light dark:text-red-dark border-red-light dark:border-red-dark"}`}>
                  {transaction.amount}
                </span>
              </td>
              <td className="hidden md:table-cell p-4 text-nowrap font-medium text-[13px] text-tertiary-dark dark:text-tertiary-light">
                {transaction.date ? format(transaction.date, "dd/MM/yyyy", { locale:es }) : "N/D"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};