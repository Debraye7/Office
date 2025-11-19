import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import CustomTooltipBar from "@dashboard/charts/components/CustomTooltipBar";

export default function CustomBarChart({ colors, title, data }: { colors:{ label:string, color:string }[], title:string, data:{ label:string, count:number }[] }) {
  return(
    <div className={`flex-1 card flex flex-col min-h-full`}>
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-lg md:text-xl text-basic">{title}</h5>
      </div>
      <div className="flex-1 mt-6 min-h-fit">
      {data.length === 0 ?
        <div className="flex items-center justify-center min-h-96">
          <p className="font-semibold text-xl text-quaternary">No hay información</p>
        </div>
      :
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeWidth={0.5} strokeOpacity={0.25} strokeDasharray={10} strokeDashoffset={10}/>
            <XAxis dataKey="label" className="font-semibold text-xs"/>
            <YAxis className="font-semibold text-xs"/>
            <Tooltip content={<CustomTooltipBar colors={colors}/>} cursor={{ fill:"transparent" }}/>
            <Bar
              dataKey="count"
              name="label"
              fill="#000"
              radius={[10, 10, 0, 0]}
            >
              {data && data.map((entry, index) => (
                <Cell key={index} fill={colors.find(item => item.label === entry.label)?.color || "#79716b"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      }
      </div>
    </div>
  );
};