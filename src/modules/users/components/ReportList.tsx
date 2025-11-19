import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { API_PATHS } from "@shared/utils/apiPaths";
import axiosInstance from "@shared/utils/axiosInstance";
import { TypeReport } from "@shared/utils/types";
import Skeleton from "@shared/components/Skeleton";
import Report from "@reports/components/ReportCard";

export default function Reports({ userId }:{ userId:string }) {
  const [reports, setReports] = useState<TypeReport[]|undefined>();

  const fetchReports = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.REPORTS.GET_ALL_REPORTS, {
        params:{
          user:userId,
        },
      });
      if(res.status === 200) {
        setReports(res.data);
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error(error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    };
  };

  useEffect(() => {
    fetchReports();
  return () => {};
  },[]);

  return(
    <ul className="flex-1 flex flex-col gap-4 max-h-full overflow-y-auto">
      {reports === undefined &&
        [1,2].map(item => (
          <div key={item} className="flex min-h-44">
            <Skeleton/>
          </div>
        ))
      }
      {reports && reports.length < 1 &&
        <p className="flex items-center justify-center min-h-full text-center font-semibold text-lg text-quaternary">No hay reportes</p>
      }
      {reports && reports.length > 0 && reports.map((report) => (
        <Report key={report._id} report={report} refresh={fetchReports}/>
      ))
      }
    </ul>
  );
};