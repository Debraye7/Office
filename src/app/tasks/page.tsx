"use client"

import { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { HiSortAscending, HiSortDescending } from "react-icons/hi";
import { FaFilter } from "react-icons/fa6";
import { useAuth } from "@shared/context/AuthContext";
import { API_PATHS } from "@shared/utils/apiPaths";
import axiosInstance from "@shared/utils/axiosInstance";
import { PRIORITY_DATA, TASKS_SORT_DATA, STATUS_DATA } from "@shared/utils/data";
import { TypeFolder, TypeTaskStatusSummary, TypeTask } from "@shared/utils/types";
import AppLayout from "@shared/layouts/AppLayout";
import Modal from "@shared/components/Modal";
import Skeleton from "@shared/components/Skeleton";
import SelectDropdown from "@shared/inputs/components/Dropdown";
import ProtectedRoute from "@app/ProtectedRoute";
import FolderSelect from "@folders/components/FolderSelect";
import TaskCard from "@tasks/components/TaskCard";
import FormTask from "@tasks/components/TaskForm";
import TabCard from "@tasks/components/TabCard";

export default function TasksPage() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<TypeTask[]|undefined>();
  const [tabs, setTabs] = useState<{ label:string, count:number }[]|undefined>();
  const [openForm, setOpenForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string|undefined>();
  const [filterPriority, setFilterPriority] = useState<string|undefined>();
  const [filterFolder, setFilterFolder] = useState<TypeFolder|undefined>();
  const [sortLabel, setSortLabel] = useState(TASKS_SORT_DATA[0]);
  const [sortType, setSortType] = useState(true);
  const [sortForm, setSortForm] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params:{
          status:!filterStatus ? "" : filterStatus,
          priority:!filterPriority ? "" : filterPriority,
          folder:!filterFolder ? "" : filterFolder._id,
          sort:`${sortLabel} ${sortType ? "(asc)" : "(desc)"}`,
        },
      });
      const approvedTasks = res.data.tasks.filter((task:TypeTask) => task.status === "Aprobada") || [];
      const remainingTasks = res.data.tasks.filter((task:TypeTask) => task.status !== "Aprobada") || [];
      setTasks([ ...remainingTasks, ...approvedTasks ]);

      const statusSummary:TypeTaskStatusSummary = res.data.statusSummary || { allTasks:0, pendingTasks:0, inProgressTasks:0, completedTasks:0 };
      const statusArray = [
        // { label:"Todas", count:statusSummary.allTasks || 0 },
        { label:"Pendientes", count:statusSummary.pendingTasks || 0 },
        { label:"En curso", count:statusSummary.inProgressTasks || 0 },
        { label:"Finalizadas", count:statusSummary.completedTasks || 0 },
        { label:"Aprobadas", count:statusSummary.approveTasks || 0 }
      ];
      setTabs(statusArray);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    return () => {};
  },[filterStatus, filterPriority, filterFolder, sortLabel, sortType]);

  const handleFilterStatus = (value:string|undefined) => {
    setTasks(undefined);
    setFilterStatus(value);
  };

  const handleFilterPriority = (value:string|undefined) => {
    setTasks(undefined);
    setFilterPriority(value);
  };

  const handleFilterFolder = (value:TypeFolder|undefined) => {
    setTasks(undefined);
    setFilterFolder(value);
  };

  const handleSortLabel = (label:string) => {
    setSortLabel(label);
    setSortForm(false);
  };

  const onRefresh = () => {
    fetchTasks();
    setOpenForm(false);
  };

  return(
    <ProtectedRoute>
      <AppLayout activeMenu="Tareas">
        <article className="flex-1 flex flex-col gap-4 mb-10 text-basic">
          <section className="flex flex-col md:flex-row md:items-center justify-between gap-x-6 gap-y-4 w-full">
            <h2 className="font-semibold text-3xl">Tareas</h2>
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
              <SelectDropdown disabled={!tasks ? true : false} options={[{ label:"Todos", value:"" }, ...STATUS_DATA]} defaultValue="" icon={<FaFilter className="text-lg"/>} placeholder="Estado" handleValue={handleFilterStatus}/>
            </div>
            <div className="flex-1 min-w-48 ">
              <SelectDropdown disabled={!tasks ? true : false} options={[{ label:"Todas", value:"" }, ...PRIORITY_DATA]} defaultValue="" icon={<FaFilter className="text-lg"/>} placeholder="Prioridad" handleValue={handleFilterPriority}/>
            </div>
            <div className="flex-1 min-w-48 ">
              <FolderSelect disabled={!tasks ? true : false} selectedFolder={filterFolder} setSelectedFolder={handleFilterFolder}/>
            </div>
          </section>
{/* Loading */}
        {tasks === undefined &&
          <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
          {[1,2].map((i) => (
            <div key={`card-${i}`} className="flex min-h-56 md:min-h-64 min-w-full">
              <Skeleton/>
            </div>
          ))}
          </section>
        }
{/* There are tasks */}
        {tasks && tasks?.length > 0 &&
          <ul className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              refresh={fetchTasks}
            />
          ))}
          </ul>
        }
{/* There are no tasks */}
        {tasks && tasks.length < 1 &&
          <section className="flex-1 flex items-center justify-center">
            <p className="font-semibold text-2xl text-quaternary">No hay tareas</p>
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
              <button type="button" onClick={()=>setOpenForm(true)} className="tool-btn">
                <LuPlus className="text-xl"/>
                Crear Tarea
              </button>
            }
            </div>
          </section>
        </article>
{/* Modals */}
        <Modal title="Crear Tarea" isOpen={openForm} onClose={()=>setOpenForm(false)}>
          {openForm && <FormTask refresh={onRefresh}/>}
        </Modal>
        <Modal title="Ordenar Tareas" isOpen={sortForm} onClose={()=>setSortForm(false)}>
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