import { useEffect, useState } from "react";
import { LuCircleMinus, LuCirclePlus, LuFilter } from "react-icons/lu";
import { format, isToday, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { TypeCategory, TypeMovement, TypeProduct } from "@shared/utils/types";
import { TRANSACTIONS_STATUS_DATA } from "@shared/utils/data";
import Modal from "@shared/components/Modal";
import ModalB from "@shared/components/ModalB";
import Shadow from "@shared/components/Shadow";
import ModalButtons from "@shared/components/ModalButtons";
import CategorySelect from "@shared/inputs/components/CategorySelect";
import DropdownSelect from "@shared/inputs/components/Dropdown";
import MovementForm from "@movements/components/MovementForm";
import Movement from "@movements/components/MovementItem";

export default function Movements({ isOpen, onClose, product, refresh }:{ isOpen:boolean, onClose:()=>void, product:TypeProduct, refresh:()=>void }) {
  const { title, movements } = product;

  const [filteredMovements, setFilteredMovements] = useState<TypeMovement[]>(movements || []);
  const [filterCategory, setFilterCategory] = useState<TypeCategory|undefined>();
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [openForm, setOpenForm] = useState<"inflow"|"outflow"|"">("");

  useEffect(() => {
    let collection = movements || [];
    if(filterCategory) collection = collection.filter(movement => movement.category?._id === filterCategory._id);
    if(filterType) collection = collection.filter(movement => movement.type === filterType);
    if(filterStatus) collection = collection.filter(movement => movement.status === filterStatus);
    setFilteredMovements(collection);
  },[movements, filterCategory, filterType, filterStatus]);

  const groupedByDate:{ date:Date, group:TypeMovement[] }[] = [];
  filteredMovements.forEach((movement) => {
    const key = startOfDay(movement.date);
    const index = groupedByDate.findIndex(item => startOfDay(item.date).getTime() === key.getTime());
    if(index < 0) return groupedByDate.push({ date:key, group:[movement] });
    groupedByDate[index >= 0 ? index : groupedByDate.length - 1].group.push(movement);
  });

  const onRefresh = () => {
    refresh();
    setOpenForm("");
    setFilterCategory(undefined);
  };

  return(
    <Shadow isOpen={isOpen}>
      <ModalB title={title} onClose={onClose}>
        <div className="flex-1 flex flex-col gap-2 rounded-md">
          {groupedByDate.length === 0 &&
            <p className="flex-1 flex items-center justify-center font-semibold text-xl text-quaternary">No hay movimientos</p>
          }
          {groupedByDate.map(({ date, group }, index) => (
            <div key={index} className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold px-4 py-2 rounded-md bg-secondary-light dark:bg-primary-dark">
                {isToday(date) ? "Hoy" : format(date, "dd 'de' MMMM", { locale:es })}
              </h2>
              <ul className="flex flex-col ">
                {group.map((movement) => (
                  <Movement key={movement._id} movement={movement} refresh={refresh}/>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ModalB>
      <ModalButtons>
        <div className="flex flex-col gap-2 h-full">
          <div className="flex-1 flex flex-wrap sm:flex-col gap-2">
            <DropdownSelect disabled={!filteredMovements ? true : false} options={[{ label:"Todos", value:"" }, ...TRANSACTIONS_STATUS_DATA]} defaultValue="" icon={<LuFilter className="text-lg"/>} placeholder="Estado" handleValue={(value:string)=>setFilterStatus(value)}/>
            <DropdownSelect disabled={!filteredMovements ? true : false} options={[{ label:"Todos", value:"" }, { label:"Entrada", value:"inflow" }, { label:"Salida", value:"outflow" },]} defaultValue="" icon={<LuFilter className="text-lg"/>} placeholder="Tipo" handleValue={(value:string)=>setFilterType(value)}/>
            <div className="flex-1 min-w-full sm:min-w-fit">
              <CategorySelect type="movement" currentCategory={filterCategory} setCategory={setFilterCategory}/>
            </div>
          </div>
          <div className="flex flex-wrap-reverse sm:flex-col-reverse items-center gap-2">
            <button type="button" onClick={()=>setOpenForm("outflow")} className="flex-1 card-btn-red sm:w-full">
              <LuCircleMinus className="text-xl"/>
              Salida
            </button>
            <button type="button" onClick={()=>setOpenForm("inflow")} className="flex-1 card-btn-fill sm:w-full">
              <LuCirclePlus className="text-xl"/>
              Entrada
            </button>
          </div>
        </div>
      </ModalButtons>
      <Modal title={openForm === "inflow" ? "Registrar Entrada" : "Registrar Salida"} isOpen={openForm ? true : false} onClose={()=>setOpenForm("")}>
        {openForm && <MovementForm product={product._id} type={openForm} refresh={onRefresh}/>}
      </Modal>
    </Shadow>
  );
};