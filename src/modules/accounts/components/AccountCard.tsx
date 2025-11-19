import Link from "next/link";
import { TypeAccount } from "@shared/utils/types";
import { addThousandsSeparator } from "@shared/utils/helper";
import AvatarGroup from "@users/components/AvatarGroup";
import TabCard from "@tasks/components/TabCard";
import { LuPencil, LuSquarePen, LuWalletCards } from "react-icons/lu";
import Modal from "@shared/components/Modal";
import AccountForm from "@accounts/components/AccountForm";
import { useState } from "react";
import { ACCOUNTS_TYPE, PROFILE_PICTURE } from "@shared/utils/data";
import { useAuth } from "@shared/context/AuthContext";
import { format } from "date-fns";

export default function AccountCard({ account, refresh }:{ account:TypeAccount, refresh:()=>void }) {
  const { user } = useAuth();
  const { _id, folder, title, assignedTo, balance, type, updatedAt } = account;
  const selectedUsersAvatars = assignedTo.map((assigned) => ({ name:assigned.name||"", img:assigned.profileImageUrl||PROFILE_PICTURE }));

  const [openForm, setOpenForm] = useState(false);

  const onRefresh = () => {
    refresh();
    setOpenForm(false);
  };

  return(
    <>
      <li className="flex flex-col gap-2 bg-secondary-light dark:bg-secondary-dark hover:bg-transparent dark:hover:bg-transparent rounded-xl p-6 border border-tertiary-light dark:border-tertiary-dark shadow-lg duration-300">
        <section className="flex-1 flex flex-col gap-2 overflow-hidden">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex-1 flex flex-wrap md:flex-nowrap justify-between gap-2">
              <p className="px-2 sm:px-4 py-0.5 w-fit h-fit rounded line-clamp-1 font-semibold text-xs text-blue-light dark:text-blue-dark bg-blue-light/20 dark:bg-blue-dark/20">{folder.title}</p>
              <p className={`px-2 sm:px-4 py-0.5 w-fit h-fit rounded text-nowrap font-semibold text-xs ${balance > 0 ? "text-green-light dark:text-green-dark bg-green-light/20 dark:bg-green-dark/20 border-green-light dark:border-green-dark" : balance === 0 ? "text-yellow-light dark:text-yellow-dark bg-yellow-light/20 dark:bg-yellow-dark/20 border-yellow-light dark:border-yellow-dark" : "text-red-light dark:text-red-dark bg-red-light/20 dark:bg-red-dark/20 border-red-light dark:border-red-dark"}`}>{`${balance > 0 ? "+" : balance === 0 ? "" : "-"}$${addThousandsSeparator(Math.abs(balance))}`}</p>
            </div>
            <p className="line-clamp-1 font-semibold text-xl text-basic">{title}</p>
            <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-0.5 text-quaternary">
                <LuWalletCards className="text-xs min-w-fit"/>
                <p className="line-clamp-1 text-xs">{ACCOUNTS_TYPE.find(item => item.value === type)?.label}</p>
              </span>
              <span className="flex items-center gap-0.5 text-quaternary">
                <p className="line-clamp-1 text-xs">{updatedAt && format(updatedAt, "dd/MM/yyyy")}</p>
              </span>
            </div>
          </div>
          <div className="">
            <AvatarGroup avatars={selectedUsersAvatars || []} maxVisible={3}/>
          </div>
        {/* {user && ["owner", "admin"].includes(user.role) &&
          <button type="button" onClick={()=>setOpenForm(true)} className="flex items-center justify-center size-10 min-w-10 min-h-10 rounded-md hover:bg-secondary-light dark:hover:bg-secondary-dark cursor-pointer duration-300">
            <LuPencil/>
          </button>
        } */}
        </section>
        <section className="flex flex-wrap gap-x-2 gap-y-1">
          <TabCard label="Cancelado" count={account.statusSummary?.canceled || 0} style="text-red-light dark:text-red-dark bg-red-light/10 dark:bg-red-dark/10"/>
          <TabCard label="Pendiente" count={account.statusSummary?.pending || 0} style="text-yellow-light dark:text-yellow-dark bg-yellow-light/10 dark:bg-yellow-dark/10"/>
          <TabCard label="Finalizado" count={account.statusSummary?.completed || 0} style="text-green-light dark:text-green-dark bg-green-light/10 dark:bg-green-dark/10"/>
        </section>
        <section className="flex flex-wrap items-end gap-2">
          <Link href={`/accounts/${_id}`} className="flex-1 card-btn-fill">Abrir</Link>
        {user && ["owner", "admin"].includes(user.role) &&
          <button type="button" onClick={()=>setOpenForm(true)} className="card-btn-fill">
            <LuSquarePen className="text-base sm:text-xl"/>
          </button>
        }
        </section>
      </li>
      <Modal title="Editar Cuenta" isOpen={openForm} onClose={()=>setOpenForm(false)}>
        {openForm && <AccountForm values={account} refresh={onRefresh}/>}
      </Modal>
    </>
  );
};