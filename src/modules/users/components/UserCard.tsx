import { useState } from "react";
import Image from "next/image";
import { TypeUser } from "@shared/utils/types";
import { PROFILE_PICTURE, ROLES_DATA } from "@shared/utils/data";
import Modal from "@shared/components/Modal";
import Sessions from "@sessions/components/SessionList";
import Reports from "@users/components/ReportList";
import TabCard from "@tasks/components/TabCard";

export default function UserCard({ info }:{ info:TypeUser }) {
  const [openReports, setOpenReports] = useState(false);
  const [openRecords, setOpenRecords] = useState(false);

  return(
    <>
      <li className="user-card flex overflow-hidden">
        <div  className="flex-1 flex flex-col gap-2 p-4">
          <section className="flex items-center justify-between">
            <div className="flex-1 flex flex-wrap items-center gap-2">
              <Image src={info.profileImageUrl || PROFILE_PICTURE} alt={info.name} width={100} height={100} className={`size-12 rounded-full border-2 border-quaternary`}/>
              <div className="flex-1 flex flex-wrap">
                <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-1 w-full">
                  <p className="text-start text-sm text-basic">{info.name}</p>
                  <p className="w-fit font-semibold text-[10px] px-2 py-0.5 rounded bg-blue-light dark:bg-blue-dark text-primary-light dark:text-primary-dark">{ROLES_DATA.find((role) => role.value === info.role)?.label}</p>
                </div>
                <p className="text-start text-xs text-quaternary">{info.email}</p>
              </div>
            </div>
          </section>
          <section className="flex flex-wrap gap-2">
            <TabCard label="Pendientes" count={info.pendingTasks || 0}/>
            <TabCard label="En curso" count={info.inProgressTasks || 0}/>
            <TabCard label="Finalizadas" count={info.completedTasks || 0}/>
          </section>
          <section className="flex flex-wrap gap-2">
            <button type="button" onClick={()=>setOpenReports(true)} className="flex-1 card-btn-fill">Reportes</button>
            <button type="button" onClick={() => setOpenRecords(true)} className="flex-1 card-btn-fill">Sesiones</button>
          </section>
        </div>
      </li>
      <Modal title={info.name} isOpen={openReports} onClose={() => setOpenReports(false)}>
        {openReports && <Reports userId={info._id}/>}
      </Modal>
      <Modal title={info.name} isOpen={openRecords} onClose={() => setOpenRecords(false)}>
        {openRecords && <Sessions userId={info._id}/>}
      </Modal>
    </>
  );
};