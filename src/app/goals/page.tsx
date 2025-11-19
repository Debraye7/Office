"use client"

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuPlus } from "react-icons/lu";
import { HiSortAscending, HiSortDescending } from "react-icons/hi";
import { FaFilter } from "react-icons/fa6";
import { useAuth } from "@shared/context/AuthContext";
import axiosInstance from "@shared/utils/axiosInstance";
import { PRIORITY_DATA, TASKS_SORT_DATA, STATUS_DATA } from "@shared/utils/data";
import { TypeFolder, TypeGoal, TypeGoalStatusSummary } from "@shared/utils/types";
import { API_PATHS } from "@shared/utils/apiPaths";
import AppLayout from "@shared/layouts/AppLayout";
import Modal from "@shared/components/Modal";
import Skeleton from "@shared/components/Skeleton";
import SelectDropdown from "@shared/inputs/components/Dropdown";
import ProtectedRoute from "@app/ProtectedRoute";
import FolderSelect from "@folders/components/FolderSelect";
import GoalCard from "@goals/components/GoalCard";
import GoalForm from "@goals/components/GoalForm";
import TabCard from "@tasks/components/TabCard";

export default function GoalsPage() {
  const { user } = useAuth();

  const [goals, setGoals] = useState<TypeGoal[]|undefined>();
  const [tabs, setTabs] = useState<{ label:string, count:number }[]|undefined>();
  const [goalForm, setGoalForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string|undefined>();
  const [filterPriority, setFilterPriority] = useState<string|undefined>();
  const [filterFolder, setFilterFolder] = useState<TypeFolder|undefined>();
  const [sortLabel, setSortLabel] = useState(TASKS_SORT_DATA[0]);
  const [sortType, setSortType] = useState(true);
  const [sortForm, setSortForm] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.GOALS.GET_ALL_GOALS, {
        params:{
          status:!filterStatus ? "" : filterStatus,
          priority:!filterPriority ? "" : filterPriority,
          folder:!filterFolder ? "" : filterFolder._id,
          sort:`${sortLabel} ${sortType ? "(asc)" : "(desc)"}`,
        },
      });
      if(res.status === 200) {
        setGoals(res.data.goals);
        const statusSummary:TypeGoalStatusSummary = res.data.statusSummary || { all:0, pending:0, inProgress:0, completed:0 };
        const statusArray = [
          { label:"Pendientes", count:statusSummary.pending || 0 },
          { label:"En curso", count:statusSummary.inProgress || 0 },
          { label:"Finalizadas", count:statusSummary.completed || 0 }
        ];
        setTabs(statusArray);
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error fetching goals:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    }
  };

  useEffect(() => {
    fetchGoals();
    return () => {};
  },[filterStatus, filterPriority, filterFolder, sortLabel, sortType]);

  const handleFilterStatus = (value:string|undefined) => {
    setGoals(undefined);
    setFilterStatus(value);
  };

  const handleFilterPriority = (value:string|undefined) => {
    setGoals(undefined);
    setFilterPriority(value);
  };

  const handleFilterFolder = (value:TypeFolder|undefined) => {
    setGoals(undefined);
    setFilterFolder(value);
  };

  const handleSortLabel = (label:string) => {
    setSortLabel(label);
    setSortForm(false);
  };

  const handleRefresh = () => {
    fetchGoals();
    setGoalForm(false);
  };

  return(
    <ProtectedRoute>
      <AppLayout activeMenu="Metas">
        <article className="flex-1 flex flex-col gap-4 mb-10 text-basic">
          <section className="flex flex-col md:flex-row md:items-center justify-between gap-x-6 gap-y-4 w-full">
            <h2 className="font-semibold text-3xl">Metas</h2>
            <div className="flex-1 flex flex-wrap gap-3">
            {!tabs && [1,2,3,4].map((i)=>(
              <div key={`tab-${i}`} className="flex-1 flex h-12">
                <Skeleton/>
              </div>
            ))}
            {tabs?.map(tab => (
              <TabCard key={tab.label} label={tab.label} count={tab.count}/>
            ))}
            </div>
          </section>
{/* Filters */}
          <section className="flex flex-wrap justify-end gap-2 min-w-full md:min-w-fit">
            <div className="flex-1 min-w-48 ">
              <SelectDropdown disabled={!goals ? true : false} options={[{ label:"Todas", value:"" }, ...STATUS_DATA]} defaultValue="" icon={<FaFilter className="text-lg"/>} placeholder="Estado" handleValue={handleFilterStatus}/>
            </div>
            <div className="flex-1 min-w-48 ">
              <SelectDropdown disabled={!goals ? true : false} options={[{ label:"Todas", value:"" }, ...PRIORITY_DATA]} defaultValue="" icon={<FaFilter className="text-lg"/>} placeholder="Prioridad" handleValue={handleFilterPriority}/>
            </div>
            <div className="flex-1 min-w-48 ">
              <FolderSelect disabled={!goals ? true : false} selectedFolder={filterFolder} setSelectedFolder={handleFilterFolder}/>
            </div>
          </section>
{/* Loading */}
        {goals === undefined &&
          <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
          {[1,2].map((i) => (
            <div key={`card-${i}`} className="flex min-h-56 md:min-h-64 min-w-full">
              <Skeleton/>
            </div>
          ))}
          </section>
        }
{/* There are goals */}
        {goals && goals?.length > 0 &&
          <ul className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              refresh={fetchGoals}
            />
          ))}
          </ul>
        }
{/* There are no goals */}
        {goals && goals.length < 1 &&
          <section className="flex-1 flex items-center justify-center">
            <p className="font-semibold text-2xl text-quaternary">No hay metas</p>
          </section>
        }
{/* Tools (sort, create) */}
          <section className="fixed bottom-2 xl:bottom-4 left-0 w-full flex justify-center">
            <div className="flex flex-wrap justify-between gap-2 w-full max-w-[1750px] px-3">
              <div className="flex gap-1.5 w-fit">
                <button onClick={()=>setSortType(!sortType)} className="flex items-center justify-center size-10 rounded-md text-primary-light dark:text-primary-dark hover:text-primary-dark dark:hover:text-primary-light bg-primary-dark dark:bg-primary-light hover:bg-primary-light dark:hover:bg-primary-dark border-2 border-primary-dark dark:border-primary-light cursor-pointer duration-300">
                {sortType ? 
                  <HiSortAscending className="text-2xl"/>
                :
                  <HiSortDescending className="text-2xl"/>
                }
                </button>
                <button onClick={()=>setSortForm(true)} className="flex items-center justify-center h-10 w-fit px-4 rounded-md font-medium text-lg text-primary-light dark:text-primary-dark hover:text-primary-dark dark:hover:text-primary-light bg-primary-dark dark:bg-primary-light hover:bg-primary-light dark:hover:bg-primary-dark border-2 border-primary-dark dark:border-primary-light cursor-pointer duration-300">
                  {sortLabel}
                </button>
              </div>
            {user && (user.role === "owner" || user.role === "admin") &&
              <button type="button" onClick={()=>setGoalForm(true)} className="tool-btn">
                <LuPlus className="text-xl"/>
                Crear Meta
              </button>
            }
            </div>
          </section>
        </article>
{/* Modals */}
        <Modal title="Crear Meta" isOpen={goalForm} onClose={()=>setGoalForm(false)}>
          {goalForm && <GoalForm refresh={handleRefresh}/>}
        </Modal>
        <Modal title="Ordenar Metas" isOpen={sortForm} onClose={()=>setSortForm(false)}>
          <ul className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
          {TASKS_SORT_DATA.map((value:string) => (
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