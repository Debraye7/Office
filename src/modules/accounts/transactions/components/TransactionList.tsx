import { format, isToday, } from "date-fns";
import { es } from "date-fns/locale";
import { TypeTransaction } from "@shared/utils/types";
import Transaction from "@transactions/components/TransactionItem";

export default function Transactions({ transactions, refresh }:{ transactions:TypeTransaction[], refresh:()=>void }) {
  const groupedByDate:{ date:Date, group:TypeTransaction[] }[] = [];
  transactions.forEach((transaction) => {
    const key = transaction.date;//format(transaction.date, "dd 'de' MMMM", { locale:es });
    const index = groupedByDate.findIndex(item => item.date === key);
    if(index < 0) groupedByDate.push({ date:key, group:[] });
    groupedByDate[index >= 0 ? index : groupedByDate.length - 1].group.push(transaction);
  });

  return(
    <li className="flex flex-col gap-2 p-5 rounded-md bg-secondary-light dark:bg-secondary-dark">
      {groupedByDate.map(({ date, group }, index) => (
        <div key={index} className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold px-4 py-2 rounded-md text-primary-dark dark:text-primary-light bg-primary-light dark:bg-primary-dark">
            {isToday(date) ? "Hoy" : format(date, "dd 'de' MMMM", { locale:es })}
          </h2>
          <ul className="flex flex-col ">
            {group.map((transaction) => (
              <Transaction key={transaction._id} transaction={transaction} refresh={refresh}/>
            ))}
          </ul>
        </div>
      ))}
    </li>
  );
};