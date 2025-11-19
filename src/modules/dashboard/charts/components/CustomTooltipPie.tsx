export default function CustomTooltipPie({ colors, active, payload }:{ colors:{ label:string, color:string }[], active?:boolean, payload?:{ name:string, value:number }[] }) {
  if(active && payload && payload.length) {
    const color = colors.find((item) => item.label === payload[0].name)?.color;
    return(
      <div className="bg-primary-light dark:bg-primary-dark shadow-md rounded-lg p-2 border border-quaternary">
        <p className={`mb-1 text-xs font-semibold`} style={{ color }}>{payload[0].name}</p>
        <p className="font-medium text-sm text-quaternary">
          {`Cantidad: `}
          <span className="font-medium text-tertiary-dark dark:text-tertiary-light">{payload[0].value}</span>
        </p>
      </div>
    );
  };
  return null;
};