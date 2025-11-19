export default function CustomLegendPie({ payload }:{ payload?:{ value:string, color:string }[] }) {
  return(
    <div className="flex flex-wrap gap-y-0.5 gap-x-5">
    {payload?.map((entry, index) => (
      <div key={`legend-${index}`} className="flex-1 flex items-center space-x-2">
        <div className="min-w-2.5 min-h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
        <span className="line-clamp-1 text-xs sm:text-sm font-medium text-quaternary">{entry.value?.slice(0, 1).toUpperCase()}{entry.value?.slice(1)}</span>
      </div>
    ))}
    </div>
  );
};