import Link from "next/link";
import { ReactNode } from "react";
import { LuArrowRight } from "react-icons/lu";

export default function LatestList({ title, label, link, children }:{ title:string, label:string, link:string, children?:ReactNode }) {
  return(
    <div className="md:col-span-2 min-w-full">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <h5 className="font-medium text-lg md:text-xl text-basic">{title}</h5>
          <Link href={link} className="card-btn-fill">
            {label}
            <LuArrowRight className="text-base"/>
          </Link>
        </div>
        {!children ?
          <div className="flex items-center justify-center min-h-96">
            <p className="font-semibold text-xl text-quaternary">No hay información</p>
          </div>
        :
          children
        }
      </div>
    </div>
  );
};