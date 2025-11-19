"use client"

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuPlus } from "react-icons/lu";
import { HiSortAscending, HiSortDescending } from "react-icons/hi";
import { TypeFolder, TypeReport } from "@shared/utils/types";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import { REPORTS_SORT_DATA } from "@shared/utils/data";
import AppLayout from "@shared/layouts/AppLayout";
import Skeleton from "@shared/components/Skeleton";
import Modal from "@shared/components/Modal";
import ProtectedRoute from "@app/ProtectedRoute";
import FolderSelect from "@folders/components/FolderSelect";
import ReportForm from "@reports/components/ReportForm";
import Report from "@reports/components/ReportCard";

export default function ReportsPage() {
  const [reports, setReports] = useState<TypeReport[]|undefined>();
  const [openForm, setOpenForm] = useState(false);
  const [filterFolder, setFilterFolder] = useState<TypeFolder|undefined>();
  const [sortLabel, setSortLabel] = useState(REPORTS_SORT_DATA[0]);
  const [sortType, setSortType] = useState(true);
  const [sortForm, setSortForm] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.REPORTS.GET_ALL_REPORTS, {
        params:{
          folder:!filterFolder ? "" : filterFolder._id,
          sort:`${sortLabel} ${sortType ? "(asc)" : "(desc)"}`,
        }
      });
      if(res.status === 200) {
        setReports(res.data);
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error fetching reports:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    }
  };

  useEffect(() => {
    fetchReports()
    return () => {};
  },[filterFolder, sortLabel, sortType]);

  const handleFilterFolder = (value:TypeFolder|undefined) => {
    setReports(undefined);
    setFilterFolder(value);
  };

  const handleSortLabel = (label:string) => {
    setSortLabel(label);
    setSortForm(false);
  };

  return(
    <ProtectedRoute>
      <AppLayout activeMenu="Reports">
        <article className="flex-1 flex flex-col gap-4">
          <section className="flex flex-wrap items-center justify-between gap-4 w-full">
            <h2 className="font-semibold text-3xl text-basic">Reportes</h2>
            <div className="flex-1 sm:flex-none min-w-48">
              <FolderSelect disabled={!reports ? true : false} selectedFolder={filterFolder} setSelectedFolder={handleFilterFolder}/>
            </div>
          </section>
        {reports === undefined &&
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <span key={item} className="flex min-h-32">
              <Skeleton/>
            </span>
          ))}
          </div>
        }
        {reports && reports.length < 1 &&
          <p className="flex-1 flex items-center justify-center text-center font-semibold text-lg text-quaternary">No hay reportes</p>
        }
        {reports && reports.length > 0 && 
          <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 mb-28 sm:mb-20">
          {reports.map(report => (
            <Report key={report._id} report={report} refresh={fetchReports}/>
          ))}
          </ul>
        }
{/* Tools (sort, create) */}
          <section className="fixed bottom-2 xl:bottom-4 left-0 w-full flex justify-center">
            <div className="flex flex-wrap-reverse justify-between gap-2 w-full max-w-[1750px] px-3">
              <div className="flex-1 sm:flex-none flex gap-1.5 sm:w-fit">
                <button onClick={()=>setSortType(!sortType)} className="flex items-center justify-center size-12 sm:size-10 rounded-md text-primary-light dark:text-primary-dark hover:text-primary-dark dark:hover:text-primary-light bg-primary-dark dark:bg-primary-light hover:bg-primary-light dark:hover:bg-primary-dark border-2 border-primary-dark dark:border-primary-light cursor-pointer duration-300">
                {sortType ? 
                  <HiSortAscending className="text-2xl"/>
                :
                  <HiSortDescending className="text-2xl"/>
                }
                </button>
                <button onClick={()=>setSortForm(true)} className="flex-1 sm:flex-none flex items-center justify-center h-12 sm:h-10 sm:w-fit px-4 rounded-md font-medium text-lg text-primary-light dark:text-primary-dark hover:text-primary-dark dark:hover:text-primary-light bg-primary-dark dark:bg-primary-light hover:bg-primary-light dark:hover:bg-primary-dark border-2 border-primary-dark dark:border-primary-light cursor-pointer duration-300">
                  {sortLabel}
                </button>
              </div>
              <button type="button" onClick={()=>setOpenForm(true)} className="flex-1 min-h-12 sm:min-h-fit sm:flex-none tool-btn">
                <LuPlus className="text-xl"/>
                Crear Reporte
              </button>
            </div>
          </section>
        </article>
        <Modal title="Crear Reporte" isOpen={openForm} onClose={()=>setOpenForm(false)}>
          {openForm && <ReportForm onClose={()=>setOpenForm(false)} refresh={fetchReports} />}
        </Modal>
        <Modal title="Ordenar Tareas" isOpen={sortForm} onClose={()=>setSortForm(false)}>
          <ul className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
          {REPORTS_SORT_DATA.map((value:string) => (
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