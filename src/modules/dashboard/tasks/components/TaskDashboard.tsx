"use client"

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuCircleAlert, LuCircleCheck, LuCirclePlus, LuLoaderCircle } from "react-icons/lu";
import { API_PATHS } from "@shared/utils/apiPaths";
import axiosInstance from "@shared/utils/axiosInstance";
import { TypeTasksDashboardData } from "@shared/utils/types";
import { addThousandsSeparator } from "@shared/utils/helper";
import Skeleton from "@shared/components/Skeleton";
import InfoCard from "@shared/components/InfoCard";
import CustomBarChart from "@dashboard/charts/components/CustomBarChart";
import CustomPieChart from "@dashboard/charts/components/CustomPieChart";
import TaskListTable from "@dashboard/tables/components/TaskListTable";
import HeaderListTable from "@dashboard/tables/components/LatestListTable";

const STATUS_COLORS =[
  { label:"Pendiente", color:"#fb2c36" },
  { label:"En curso", color:"#efb100" },
  { label:"Finalizada", color:"#00c951" }
];
const PRIORITY_COLORS = [
  { label:"Alta", color:"#fb2c36" },
  { label:"Media", color:"#efb100" },
  { label:"Baja", color:"#00c951" }
];

export default function TasksDashboard() {
  const [dashboardData, setDashboardData] = useState<TypeTasksDashboardData|undefined>();
  const [pieChartData, setPieChartData] = useState<{ label:string, count:number }[]|undefined>();
  const [barChartData, setBarChartData] = useState<{ label:string, count:number }[]|undefined>();

  const getChartData = (data:{ taskDistribution:{ Pendiente:number, Encurso:number, Finalizada:number }, taskPriorityLevels:{ Alta:number, Media:number, Baja:number } }) => {
    const taskDistribution = data?.taskDistribution || null;
    const taskPriorityLevels = data?.taskPriorityLevels || null;

    const taskDistributionData = [
      { label:"Pendiente", count:taskDistribution?.Pendiente || 0 },
      { label:"En curso", count:taskDistribution?.Encurso || 0 },
      { label:"Finalizada", count:taskDistribution?.Finalizada || 0 },
    ];
    if(taskDistributionData[0].count === 0 && taskDistributionData[1].count === 0 && taskDistributionData[2].count === 0) {
      setPieChartData([]);
    } else {
      setPieChartData(taskDistributionData);
    };

    const priorityLevelData = [
      { label:"Alta", count:taskPriorityLevels?.Alta || 0 },
      { label:"Media", count:taskPriorityLevels?.Media || 0 },
      { label:"Baja", count:taskPriorityLevels?.Baja || 0 },
    ];
    if(priorityLevelData[0].count === 0 && priorityLevelData[1].count === 0 && priorityLevelData[2].count === 0) {
      setBarChartData([]);
    } else {
      setBarChartData(priorityLevelData);
    };
  }; 

  const getDashboardData = async () => {
    try {
      const res = await axiosInstance.get(`${API_PATHS.DASHBOARD.GET_TASKS_DATA}`);
      if(res.data) {
        setDashboardData(res.data);
        getChartData(res.data?.charts || null);
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error fetching task dashboard:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    };
  };

  useEffect(() => {
    getDashboardData();
    return () => {};
  },[]);

  return(
    <div className="flex flex-col gap-2">
      <section className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        <div className="col-span-1 sm:col-span-3 lg:col-span-1">
        {!dashboardData ?
          <span className="flex min-h-24">
            <Skeleton/>
          </span>
        :
          <InfoCard
            icon={<LuCirclePlus className="text-4xl text-blue-light dark:text-blue-dark"/>}
            label="Total"
            value={addThousandsSeparator(dashboardData.charts.taskDistribution.All)}
          />
        }
        </div>
      {!dashboardData ?
        <span className="flex min-h-24">
          <Skeleton/>
        </span>
      :
        <InfoCard
          icon={<LuCircleAlert className="text-4xl text-red-light dark:text-red-dark"/>}
          label="Pendientes"
          value={addThousandsSeparator(dashboardData?.charts.taskDistribution.Pendiente || 0)}
        />
      }
      {!dashboardData ?
        <span className="flex min-h-24">
          <Skeleton/>
        </span>
      :
        <InfoCard
          icon={<LuLoaderCircle className="text-4xl text-yellow-light dark:text-yellow-dark animate-spin"/>}
          label="En curso"
          value={addThousandsSeparator(dashboardData?.charts.taskDistribution.Encurso || 0)}
        />
      }
      {!dashboardData ?
        <span className="flex min-h-24">
          <Skeleton/>
        </span>
      :
        <InfoCard
          icon={<LuCircleCheck className="text-4xl text-green-light dark:text-green-dark"/>}
          label="Finalizadas"
          value={addThousandsSeparator(dashboardData?.charts.taskDistribution.Finalizada || 0)}
        />
      }
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {!pieChartData ?
        <span className="flex min-h-96">
          <Skeleton/>
        </span>
      :
        <CustomPieChart
          title="Estado"
          data={pieChartData}
          colors={STATUS_COLORS}
        />
      }
      {!barChartData ?
        <span className="flex min-h-96">
          <Skeleton/>
        </span>
      :
        <CustomBarChart
          colors={PRIORITY_COLORS}
          title="Prioridad"
          data={barChartData}
        />
      }
      </section>
      <section>
      {!dashboardData ?
        <span className="flex min-h-96">
          <Skeleton/>
        </span>
      :
        <HeaderListTable title="Tareas Recientes" label="Ver tareas" link="/tasks">
          {dashboardData?.recentTasks.length > 0 && <TaskListTable tableData={dashboardData.recentTasks}/>}
        </HeaderListTable>
      }
      </section>
    </div>
  );
};