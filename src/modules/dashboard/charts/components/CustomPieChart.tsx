import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import CustomTooltipPie from "@dashboard/charts/components/CustomTooltipPie";
import CustomLegendPie from "@dashboard/charts/components/CustomLegendPie";

export default function CustomPieChart({ title, data, colors }:{ title:string, data:{ label:string, count:number }[], colors:{ label:string, color:string }[] }) {
  return(
    <div className={`flex-1 min-h-full card`}>
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-lg md:text-xl text-basic">{title}</h5>
      </div>
    {data.length === 0 ?
      <div className="flex items-center justify-center min-h-96">
        <p className="font-semibold text-xl text-quaternary">No hay información</p>
      </div>
    :
      <ResponsiveContainer width="100%" height={375}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={"90%"}
            innerRadius={"50%"}
            labelLine={false}
          >
            {data && data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors.find(item => item.label === entry.label)?.color || "#79716b"} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltipPie colors={colors}/>}/>
          <Legend content={<CustomLegendPie/>}/>
        </PieChart>
      </ResponsiveContainer>
    }
    </div>
  );
};