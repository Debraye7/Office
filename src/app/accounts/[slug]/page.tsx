"use client"

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuCircleMinus, LuCirclePlus, LuFilter } from "react-icons/lu";
import { HiSortAscending, HiSortDescending } from "react-icons/hi";
import { TypeAccount, TypeAssigned, TypeCategory } from "@shared/utils/types";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import { addThousandsSeparator } from "@shared/utils/helper";
import { PROFILE_PICTURE, TRANSACTIONS_SORT_DATA, TRANSACTIONS_STATUS_DATA } from "@shared/utils/data";
import AppLayout from "@shared/layouts/AppLayout";
import Skeleton from "@shared/components/Skeleton";
import Modal from "@shared/components/Modal";
import DropdownSelect from "@shared/inputs/components/Dropdown";
import CategorySelect from "@shared/inputs/components/CategorySelect";
import ProtectedRoute from "@app/ProtectedRoute";
import AvatarGroup from "@users/components/AvatarGroup";
import TransactionForm from "@transactions/components/TransactionForm";
import TabCard from "@tasks/components/TabCard";
import Transactions from "@transactions/components/TransactionList";

export default function AccountPage() {
  const accountId = usePathname().split("/")[2];

  const [account, setAccount] = useState<TypeAccount|undefined>();
  const [selectedUsersAvatars, setSelectedUsersAvatars] = useState([]);
  const [incomeForm, setIncomeForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState(false);
  const [type, setType] = useState<string|undefined>();
  const [status, setStatus] = useState<string|undefined>();
  const [category, setCategory] = useState<TypeCategory|undefined>();
  const [sortForm, setSortForm] = useState(false);
  const [sortLabel, setSortLabel] = useState(TRANSACTIONS_SORT_DATA[0]);
  const [sortType, setSortType] = useState(false);

  const fetchAccount = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.ACCOUNTS.GET_ACCOUNT_BY_ID(accountId), {
        params:{
          type:!type ? "" : type,
          status:!status ? "" : status,
          category:!category ? "" : category._id,
          sort:`${sortLabel} ${sortType ? "(asc)" : "(desc)"}`,
        },
      });
      if(res.status === 200) {
        setAccount(res.data);
        setSelectedUsersAvatars(res.data.assignedTo.map((assigned:TypeAssigned) => ({ name:assigned.name||"", img:assigned.profileImageUrl||PROFILE_PICTURE })));
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error fetching accounts:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    }
  };

  useEffect(() => {
    fetchAccount();
    return () => {};
  },[type, status, category, sortType, sortLabel]);

  const handleSortLabel = (label:string) => {
    setSortLabel(label);
    setSortForm(false);
  };

  return(
    <ProtectedRoute>
      <AppLayout activeMenu="Cuentas">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-x-5 gap-y-4 min-w-full">
          {!account ?
            <span className="flex h-24">
              <Skeleton/>
            </span>
          :
            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 overflow-hidden">
                  <span className={`w-fit px-5 py-1.5 text-blue-light dark:text-blue-dark bg-blue-light/20 dark:bg-blue-dark/20 rounded`}>
                    <p className="line-clamp-1 font-semibold text-xs">{account.folder.title}</p>
                  </span>
                  <h1 className="line-clamp-2 font-bold text-2xl">{account.title}</h1>
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <AvatarGroup avatars={selectedUsersAvatars || []} maxVisible={10}/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <TabCard label="Cancelado:" count={account.statusSummary ? `${account.statusSummary?.canceled > 0 ? "+" : account.statusSummary?.canceled < 0 ? "-" : ""} $${addThousandsSeparator(Math.abs(account.statusSummary?.canceled || 0))}` : "$0"} style="text-red-light dark:text-red-dark bg-red-light/10 dark:bg-red-dark/10"/>
                  <TabCard label="Pendiente:" count={account.statusSummary ? `${account.statusSummary?.pending > 0 ? "+" : account.statusSummary?.pending < 0 ? "-" : ""} $${addThousandsSeparator(Math.abs(account.statusSummary?.pending || 0))}` : "$0"} style="text-yellow-light dark:text-yellow-dark bg-yellow-light/10 dark:bg-yellow-dark/10"/>
                  <TabCard label="" count={`${account.balance > 0 ? "+" : account.balance < 0 ? "-" : ""} $${addThousandsSeparator(Math.abs(account.balance || 0))}` || "$0"} style={account.balance > 0 ? "text-green-light dark:text-green-dark bg-green-light/10 dark:bg-green-dark/10" : account.balance === 0 ? "text-yellow-light dark:text-yellow-dark bg-yellow-light/10 dark:bg-yellow-dark/10" : "text-red-light dark:text-red-dark bg-red-light/10 dark:bg-red-dark/10"}/>
                </div>
              </div>
            </section>
          }
{/* Filters */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex-1 min-w-48">
                <DropdownSelect disabled={!account ? true : false} options={[{ label:"Todos", value:"" }, ...TRANSACTIONS_STATUS_DATA]} defaultValue="" icon={<LuFilter className="text-lg"/>} placeholder="Estado" handleValue={(value:string)=>setStatus(value)}/>
              </div>
              <div className="flex-1 min-w-48 ">
                <DropdownSelect disabled={!account ? true : false} options={[{ label:"Todos", value:"" }, { label:"Ingreso", value:"income" }, { label:"Gasto", value:"expense" },]} defaultValue="" icon={<LuFilter className="text-lg"/>} placeholder="Tipo" handleValue={(value:string)=>setType(value)}/>
              </div>
              <div className="flex-1 min-w-48 ">
                <CategorySelect disabled={!account ? true : false} type="transaction" currentCategory={category} setCategory={(value:TypeCategory|undefined)=>setCategory(value)}/>
              </div>
            </section>
          </div>
          <ul className="flex-1 flex flex-col gap-6 min-w-full mb-10">
          {!account && 
            <div className="flex-1 flex min-h-32">
              <Skeleton/>
            </div>
          }
          {account?.transactions && account.transactions.length < 1 && 
            <p className="flex-1 flex items-center justify-center font-semibold text-2xl text-quaternary">No hay transacciones</p>
          }
          {account?.transactions && account.transactions.length > 0 &&
            <Transactions transactions={account.transactions} refresh={fetchAccount}/>
          }
          </ul>
        </div>
        <section>
          <div className="fixed bottom-2 xl:bottom-4 left-0 w-full max-w-[1750px] flex flex-wrap-reverse justify-between gap-2 px-3">
            <div className="flex gap-1.5 w-fit">
              <button onClick={()=>setSortType(!sortType)} disabled={!account ? true : false} className="flex items-center justify-center size-10 rounded-md text-primary-light dark:text-primary-dark hover:text-primary-dark dark:hover:text-primary-light bg-primary-dark dark:bg-primary-light hover:bg-primary-light dark:hover:bg-primary-dark border-2 border-primary-dark dark:border-primary-light cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 duration-300">
              {sortType ? 
                <HiSortAscending className="text-2xl"/>
              :
                <HiSortDescending className="text-2xl"/>
              }
              </button>
              <button onClick={()=>setSortForm(true)} disabled={!account ? true : false} className="flex items-center justify-center h-10 w-fit px-4 rounded-md font-medium text-lg text-primary-light dark:text-primary-dark hover:text-primary-dark dark:hover:text-primary-light bg-primary-dark dark:bg-primary-light hover:bg-primary-light dark:hover:bg-primary-dark border-2 border-primary-dark dark:border-primary-light cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 duration-300">
                {sortLabel}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={!account ? true : false} onClick={()=>setIncomeForm(true)} className="tool-btn">
                <LuCirclePlus className="text-base"/>
                Ingreso
              </button>
              <button type="button" disabled={!account ? true : false} onClick={()=>setExpenseForm(true)} className="tool-btn-red">
                <LuCircleMinus className="text-base"/>
                Gasto
              </button>
            </div>
          </div>
        </section>
        <Modal title="Crear Ingreso" isOpen={incomeForm} onClose={()=>setIncomeForm(false)}>
          {account && incomeForm && <TransactionForm account={account._id} type="income" closeForm={()=>setIncomeForm(false)} refresh={fetchAccount}/>}
        </Modal>
        <Modal title="Crear gasto" isOpen={expenseForm} onClose={()=>setExpenseForm(false)}>
          {account && expenseForm && <TransactionForm account={account._id} type="expense" closeForm={()=>setExpenseForm(false)} refresh={fetchAccount}/>}
        </Modal>
        <Modal title="Ordenar Transacciones" isOpen={sortForm} onClose={()=>setSortForm(false)}>
          <ul className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
          {TRANSACTIONS_SORT_DATA.map((value:string) => (
            <li key={value}>
              <button onClick={()=>handleSortLabel(value)} className="flex items-center px-5 h-14 w-full rounded-md text-basic bg-transparent hover:bg-secondary-light dark:hover:bg-secondary-dark border border-secondary-light dark:border-tertiary-dark cursor-pointer duration-300">{value}</button>
            </li>
          ))}
          </ul>
        </Modal>
      </AppLayout>
    </ProtectedRoute>
  );
};