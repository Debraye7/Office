import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";
import { LuCirclePlus } from "react-icons/lu";
import { API_PATHS } from "@shared/utils/apiPaths";
import axiosInstance from "@shared/utils/axiosInstance";
import Skeleton from "@shared/components/Skeleton";
import InfoCard from "@shared/components/InfoCard";
import CustomBarChart from "@dashboard/charts/components/CustomBarChart";
import CustomPieChart from "@dashboard/charts/components/CustomPieChart";
import HeaderListTable from "@dashboard/tables/components/LatestListTable";
import EventListTable from "@dashboard/tables/components/EventListTable";
import { TypeEventsDashboardData } from "@shared/utils/types";

const getRandomColor = () => {
  const hue = Math.floor(Math.random() * 360); // 0-360°
  const saturation = 70 + Math.random() * 30; // Saturación alta (70-100%)
  const lightness = 40 + Math.random() * 40; // Evita negro (<40%) y blanco (>80%)

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const COLORS = [
  "#0085EB",
  "#E5EA00",
  "#EB5C00",
  "#84EB00",
  "#EB00BB",
  "#1000EB",
  "#EBCF00",
  "#00EBA8",
  "#6B00EB",
  "#FF0066",
  "#01E0EB",
  "#BA01EB",
];

export default function CalendarDashboard() {
  const [dashboardData, setDashboardData] = useState<TypeEventsDashboardData|undefined>();

  const getDashboardData = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.DASHBOARD.GET_EVENTS_DATA);
      if(res.status === 200) {
        setDashboardData(res.data);
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error fetching accounts dashboard:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    }
  };

  useEffect(() => {
    getDashboardData();
    return () => {};
  },[]);

  return(
    <div className="flex flex-col gap-10">
      <article className="flex flex-col gap-4">
        <section className="flex flex-wrap gap-2">
        {!dashboardData ?
          <span className="flex min-h-96 min-w-full">
            <Skeleton/>
          </span>
        :
          <HeaderListTable title={`Eventos (${format(new Date(), "eeee, dd 'de' MMMM", { locale:es })})`} label="Ver calendario" link="/calendar">
            {dashboardData.recurrence.eventsToday.length > 0 && <EventListTable tableData={dashboardData.recurrence.eventsToday}/>}
          </HeaderListTable>
        }
        </section>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {!dashboardData ?
          <span className="flex min-h-96">
            <Skeleton/>
          </span>
        :
          <CustomPieChart
            title="Carpetas"
            data={dashboardData.eventsByFolder}
            colors={dashboardData.eventsByFolder.map((folder) => ({ label:folder.label, color:getRandomColor() }))}
          />
        }
        {!dashboardData ?
          <span className="flex min-h-96">
            <Skeleton/>
          </span>
        :
          <CustomPieChart
            title="Eventos por hora"
            data={dashboardData.eventsByHour}
            colors={dashboardData.eventsByHour.map((hour) => ({ label:hour.label, color:getRandomColor() }))}
          />
        }
        </section>
        <section className="grid grid-cols-1 gap-2">
          <h2 className="font-semibold text-3xl text-basic">Recurrencia</h2>
        {!dashboardData ?
          <div className="flex min-h-24">
            <Skeleton/>
          </div>
        :
          <InfoCard
            icon={<LuCirclePlus className="text-4xl text-blue-light dark:text-blue-dark"/>}
            label="Eventos"
            value={`${dashboardData.totalEvents}`}
          />
        }
        {!dashboardData ?
          <span className="flex min-h-96">
            <Skeleton/>
          </span>
        :
          <CustomBarChart
            title={`Eventos (${format(new Date(), "MMMM", { locale:es })})`}
            data={dashboardData.recurrence.eventsByMonth}
            colors={dashboardData.recurrence.eventsByMonth.map((day) => ({ label:day.label, color:getRandomColor() }))}
          />
        }
        {!dashboardData ?
          <span className="flex min-h-96">
            <Skeleton/>
          </span>
        :
          <CustomBarChart
            title="Eventos con recurrencia"
            data={dashboardData.recurrence.recurrenceStats}
            colors={dashboardData.recurrence.recurrenceStats.map((stat, index) => ({ label:stat.label, color:COLORS[index] }))}
          />
        }
        </section>
      </article>
    </div>
  );
};