import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuCircleAlert, LuCircleArrowDown, LuCircleArrowUp, LuCircleCheck, LuCircleDollarSign, LuCircleX, LuRefreshCcwDot } from "react-icons/lu";
import { TypeAccount, TypeAccountsDashboardData } from "@shared/utils/types";
import { API_PATHS } from "@shared/utils/apiPaths";
import axiosInstance from "@shared/utils/axiosInstance";
import { addThousandsSeparator } from "@shared/utils/helper";
import Skeleton from "@shared/components/Skeleton";
import InfoCard from "@shared/components/InfoCard";
import CustomPieChart from "@dashboard/charts/components/CustomPieChart";
import CustomBarChart from "@dashboard/charts/components/CustomBarChart";
import HeaderListTable from "@dashboard/tables/components/LatestListTable";
import TransactionsListTable from "@dashboard/tables/components/TransactionsListTable";

const ACCOUNTS_COLORS = [
  "#00c951",
  "#efb100",
  "#fb2c36",
];

const ACCOUNTS_COLORS_REVERSE = [
  "#fb2c36",
  "#efb100",
  "#00c951",
];

const MONTHS_COLORS = [
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

export default function AccountsDashboard() {
  const [accounts, setAccounts] = useState<TypeAccount[]|undefined>();
  const [dashboardData, setDashboardData] = useState<TypeAccountsDashboardData|undefined>();

  const getTopAccountsChartData = (collection:{ _id:string, total:number }[], negative?:boolean) => {
    if(!accounts) return [];
    const topAccounts = collection.map((top) => ({ label:accounts.find((account) => account._id === top._id)?.title || "error", count:negative ? -top.total : top.total }));
    return topAccounts;
  };

  const getMonthsBalanceChartData = (collection:{ month:string, income:number, expense:number }[]) => {
    const months = collection.map((month) => ({ label:month.month, count:(month.income - month.expense) >= 0 ? month.income - month.expense : 0 }));
    return months;
  };

  const getMonthsIncomeChartData = (collection:{ month:string, income:number, expense:number }[]) => {
    const months = collection.map((month) => ({ label:month.month, count:month.income }));
    return months;
  };

  const getMonthsExpenseChartData = (collection:{ month:string, income:number, expense:number }[]) => {
    const months = collection.map((month) => ({ label:month.month, count:month.expense }));
    return months;
  };

  const getMonthsTransactionsChartData = (collection:{ month:string, income:number, expense:number, transactions:number }[]) => {
    const months = collection.map((month) => ({ label:month.month, count:month.transactions }));
    return months;
  };

  const getDashboardData = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.DASHBOARD.GET_ACCOUNTS_DATA)
      if(res.status === 200) {
        setAccounts(res.data.accounts);
        setDashboardData(res.data.dashboard);
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error fetching accounts dashboard:", error);
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
    <div className="flex flex-col gap-10">
      <article className="flex flex-col gap-2">
        <h2 className="font-semibold text-3xl text-basic">Cuentas</h2>
        <section className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <div className="col-span-1 sm:col-span-3 lg:col-span-1">
          {!dashboardData ?
            <div className="flex min-h-24">
              <Skeleton/>
            </div>
          :
            <InfoCard
              icon={<LuCircleDollarSign className="text-4xl text-blue-light dark:text-blue-dark"/>}
              label="Balance"
              value={`${dashboardData.generalInfo.totalBalance < 0 ? "-" : "+"} $${addThousandsSeparator(Math.abs(dashboardData.generalInfo.totalBalance))}`}
            />
          }
          </div>
        {!dashboardData ?
          <div className="flex min-h-24">
            <Skeleton/>
          </div>
        :
          <InfoCard
            icon={<LuCircleAlert className="text-4xl text-yellow-light dark:text-yellow-dark"/>}
            label="Pendiente"
            value={`${dashboardData.generalInfo.totalPending < 0 ? "-" : "+"} $${addThousandsSeparator(Math.abs(dashboardData.generalInfo.totalPending))}`}
          />
        }
        {!dashboardData ?
          <div className="flex min-h-24">
            <Skeleton/>
          </div>
        :
          <InfoCard
            icon={<LuCircleArrowUp className="text-4xl text-green-light dark:text-green-dark"/>}
            label="Ingresos"
            value={`+ $${addThousandsSeparator(dashboardData.generalInfo.totalIncome)}`}
          />
        }
        {!dashboardData ?
          <div className="flex min-h-24">
            <Skeleton/>
          </div>
        :
          <InfoCard
            icon={<LuCircleArrowDown className="text-4xl text-red-light dark:text-red-dark"/>}
            label="Gastos"
            value={`- $${addThousandsSeparator(dashboardData.generalInfo.totalExpense)}`}
          />
        }
        </section>
        <section className="flex flex-col gap-2">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {!dashboardData ?
            <span className="flex min-h-96">
              <Skeleton/>
            </span>
          :
            <CustomBarChart
              title="Ingresos"
              data={getTopAccountsChartData(dashboardData.insights.topAccounts.income)}
              colors={getTopAccountsChartData(dashboardData.insights.topAccounts.income).map((top, index) => ({ label:top.label, color:ACCOUNTS_COLORS[index] }))}
            />
          }
          {!dashboardData ?
            <span className="flex min-h-96">
              <Skeleton/>
            </span>
          :
            <CustomBarChart
              title="Gastos"
              data={getTopAccountsChartData(dashboardData.insights.topAccounts.expense, true)}
              colors={getTopAccountsChartData(dashboardData.insights.topAccounts.expense).map((top, index) => ({ label:top.label, color:ACCOUNTS_COLORS_REVERSE[index] }))}
            />
          }
            <div className="col-span-1 md:col-span-2 xl:col-span-1">
            {!dashboardData ?
              <span className="flex min-h-96">
                <Skeleton/>
              </span>
            :
              <CustomBarChart
                title="Balance"
                data={getTopAccountsChartData(dashboardData.insights.topAccounts.balance)}
                colors={getTopAccountsChartData(dashboardData.insights.topAccounts.balance).map((top, index) => ({ label:top.label, color:top.count > 0 ? ACCOUNTS_COLORS[index] : ACCOUNTS_COLORS_REVERSE[index] }))}
              />
            }
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {!dashboardData ?
            <span className="flex min-h-96">
              <Skeleton/>
            </span>
          :
            <CustomPieChart
              title="Ingresos Mensuales"
              data={getMonthsIncomeChartData(dashboardData.timeAnalysis.monthlyTrends)}
              colors={getMonthsIncomeChartData(dashboardData.timeAnalysis.monthlyTrends).map((month, index) => ({ label:month.label, color:MONTHS_COLORS[index] }))}
            />
          }
          {!dashboardData ?
            <span className="flex min-h-96">
              <Skeleton/>
            </span>
          :
            <CustomPieChart
              title="Gastos Mensuales"
              data={getMonthsExpenseChartData(dashboardData.timeAnalysis.monthlyTrends)}
              colors={getMonthsExpenseChartData(dashboardData.timeAnalysis.monthlyTrends).map((month, index) => ({ label:month.label, color:MONTHS_COLORS[index] }))}
            />
          }
            <div className="col-span-1 md:col-span-2 xl:col-span-1">
            {!dashboardData ?
              <span className="flex min-h-96">
                <Skeleton/>
              </span>
            :
              <CustomPieChart
                title="Balances Mensuales"
                data={getMonthsBalanceChartData(dashboardData.timeAnalysis.monthlyTrends)}
                colors={getMonthsBalanceChartData(dashboardData.timeAnalysis.monthlyTrends).map((month, index) => ({ label:month.label, color:MONTHS_COLORS[index] }))}
              />
            }
            </div>
          </div>
        </section>
      </article>

      <article className="flex flex-col gap-2">
        <h2 className="font-semibold text-3xl text-basic">Transacciones</h2>
        <section className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <div className="col-span-1 sm:col-span-3 lg:col-span-1">
          {!dashboardData ?
            <div className="flex min-h-24">
              <Skeleton/>
            </div>
          :
            <InfoCard
              icon={<LuRefreshCcwDot className="text-4xl text-blue-light dark:text-blue-dark"/>}
              label="Total"
              value={`${dashboardData?.insights.transactionsStatuses.total}`}
            />
          }
          </div>
        {!dashboardData ?
          <div className="flex min-h-24">
            <Skeleton/>
          </div>
        :
          <InfoCard
            icon={<LuCircleAlert className="text-4xl text-yellow-light dark:text-yellow-dark"/>}
            label="Pendiente"
            value={`${dashboardData?.insights.transactionsStatuses.pending}`}
          />
        }
        {!dashboardData ?
          <div className="flex min-h-24">
            <Skeleton/>
          </div>
        :
          <InfoCard
            icon={<LuCircleCheck className="text-4xl text-green-light dark:text-green-dark"/>}
            label="Finalizado"
            value={`${dashboardData?.insights.transactionsStatuses.completed}`}
          />
        }
        {!dashboardData ?
          <div className="flex min-h-24">
            <Skeleton/>
          </div>
        :
          <InfoCard
            icon={<LuCircleX className="text-4xl text-red-light dark:text-red-dark"/>}
            label="Cancelado"
            value={`${dashboardData?.insights.transactionsStatuses.canceled}`}
          />
        }
        </section>
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {!dashboardData ?
          <span className="flex min-h-96">
            <Skeleton/>
          </span>
        :
          <CustomPieChart
            title="Transacciones Mensuales"
            data={getMonthsTransactionsChartData(dashboardData.timeAnalysis.monthlyTrends)}
            colors={getMonthsTransactionsChartData(dashboardData.timeAnalysis.monthlyTrends).map((month, index) => ({ label:month.label, color:MONTHS_COLORS[index] }))}
          />
        }
        {!dashboardData ?
          <span className="flex min-h-96">
            <Skeleton/>
          </span>
        :
          <CustomPieChart
            title="Categorías"
            data={dashboardData.transactionsAnalysis.categoryDistribution}
            colors={dashboardData.transactionsAnalysis.categoryDistribution.map((month, index) => ({ label:month.label, color:MONTHS_COLORS[index] }))}
          />
        }
        </section>
        <section className="flex flex-wrap gap-2">
        {!dashboardData ?
          <span className="flex min-h-96 min-w-full">
            <Skeleton/>
          </span>
        :
          <HeaderListTable title="Transacciones Recientes" label="Ver cuentas" link="/accounts">
            {dashboardData.transactionsAnalysis.recentTransactions.length > 0 && <TransactionsListTable tableData={dashboardData.transactionsAnalysis.recentTransactions}/>}
          </HeaderListTable>
        }
        </section>
      </article>
    </div>
  );
};