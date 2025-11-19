export default function CustomTooltipBar({ colors, active, payload }:{ colors:{ label:string, color:string }[], active?:boolean, payload?:{ payload:{ label:string, count:number } }[] }) {
  if(active && payload && payload.length) {
    const color = colors.find((item) => item.label === payload[0].payload.label)?.color;
    return(
      <div className="bg-primary-light dark:bg-primary-dark p-2 rounded-lg shadow-md border border-quaternary">
        <p className={`font-semibold text-xs`} style={{ color }}>{payload[0].payload.label}</p>
        <p className="font-medium text-sm text-quaternary">
          {`Cantidad: `}
          <span className="text-tertiary-dark dark:text-tertiary-light">{payload[0].payload.count}</span>
        </p>
      </div>
    );
  };
  return null;
};