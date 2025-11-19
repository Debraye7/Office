import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@shared/context/AuthContext";
import { ICONS, PROFILE_PICTURE } from "@shared/utils/data";
import { addThousandsSeparator } from "@shared/utils/helper";
import { TypeTransaction } from "@shared/utils/types";
import Modal from "@shared/components/Modal";
import TransactionForm from "@transactions/components/TransactionForm";

export default function Transaction({ transaction, refresh }:{ transaction:TypeTransaction, refresh:()=>void }) {
  const { user } = useAuth();
  const { _id, account, category, title, description, type, amount, status, createdBy } = transaction;

  const [openForm, setOpenForm] = useState(false);

  const getIcon = (index:number) => {
    const Icon = ICONS[index];
    return <Icon className="text-lg"/>
  };

  return(
    <>
    <li key={_id} onClick={user && (user.role === "owner" || user.role === "admin") ? ()=>setOpenForm(true) : ()=>{}} className={`relative flex items-center gap-2 p-4 rounded-md bg-secondary-light dark:bg-secondary-dark hover:bg-primary-light dark:hover:bg-primary-dark ${user && (user.role === "owner" || user.role === "admin") && "cursor-pointer"} group duration-300`}>
      <div className="flex flex-col gap-1">
        <span className="absolute top-0 hidden group-hover:flex w-4/5">
          <p className="line-clamp-1 text-xs text-quaternary">{category ? category.label : "Sin categoría"}</p>
        </span>
        <span className="flex items-center justify-center size-10 rounded-full text-primary-light dark:text-primary-dark bg-primary-dark dark:bg-primary-light">
          {getIcon(category ? category.icon : 0)}
        </span>
      </div>
      <div className="flex-1 flex flex-col">
        <span className="font-medium text-primary-dark dark:text-primary-light">{title}</span>
        <p className="text-sm text-quaternary">{description}</p>
      </div>
      <div className="flex flex-col items-end justify-between">
        <span className={`font-bold ${type === "income" ? "text-green-light dark:text-green-light" : "text-red-light dark:text-red-light"}`}>
          {type === "income" ? "+" : "-"}${addThousandsSeparator(amount)}
        </span>
        <span className={`font-medium text-xs text-quaternary`}>{status}</span>
      </div>
      <span className="absolute bottom-full right-0 hidden group-hover:flex items-center gap-1 px-5 py-3 rounded-lg bg-primary-light dark:bg-primary-dark border-2 border-secondary-light dark:border-secondary-dark">
        <Image src={createdBy.profileImageUrl || PROFILE_PICTURE} alt="Avatar" width={100} height={100} className="size-10 rounded-full"/>
        <div className="flex flex-col">
          <p className="font-medium text-sm text-basic">{createdBy.name}</p>
          <p className="font-medium text-xs text-quaternary">{createdBy.email}</p>
        </div>
      </span>
    </li>
    <Modal title="Editar Transacción" isOpen={openForm} onClose={()=>setOpenForm(false)}>
      {user && (user.role === "owner" || user.role === "admin") && openForm && <TransactionForm account={account} type={type} values={transaction} closeForm={()=>setOpenForm(false)} refresh={refresh}/>}
    </Modal>
    </>
  );
};