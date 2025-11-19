import { ReactNode } from "react";

export default function InfoCard({ icon, label, value }:{ icon:ReactNode, label?:string, value:string, }) {
  return(
    <div className="card flex items-center gap-2 min-h-24">
      {icon}
      <div className="flex flex-col">
        <p className="font-semibold text-sm text-quaternary">{label}</p>
        <span className="font-semibold text-lg text-basic">{value}</span>
      </div>
    </div>
  );
};