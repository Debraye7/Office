import { ChangeEvent, useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { TypeCategory, TypeItem } from "@shared/utils/types";
import Modal from "@shared/components/Modal";
import CategorySelect from "@shared/inputs/components/CategorySelect";
import ItemForm from "@items/components/ItemForm";
import Item from "@items/components/Item";

export default function Items({ inventory, items, refresh }:{ inventory:string, items:TypeItem[], refresh:()=>void }) {
  const [category, setCategory] = useState<TypeCategory|undefined>();
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [filteredItems, setFilteredItems] = useState<TypeItem[]>(items);

  useEffect(() => {
    let filtered = items;
    if(category) filtered = filtered.filter(item => item.category?._id === category._id);
    if(search) filtered = filtered.filter(item => item.title.toLowerCase().includes(search.toLowerCase()));
    setFilteredItems(filtered);
  }, [items, category, search]);

  const onRefresh = () => {
    refresh();
    setOpenForm(false);
  };

  const handleSearch = (e:ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return(
    <div className="flex-1 flex flex-col gap-4 max-h-full">
      <section className="flex gap-2">
        <input type="text" onChange={handleSearch} className="flex-1 py-2 px-4 rounded-md outline-none bg-secondary-light dark:bg-secondary-dark focus-within:bg-transparent border border-tertiary-light dark:border-tertiary-dark duration-300"/>
        <CategorySelect type="item" currentCategory={category} setCategory={(value:TypeCategory|undefined)=>setCategory(value)}/>
      </section>
      <section className="flex-1 flex flex-col overflow-y-auto">
      {filteredItems.map((item) => (
        <Item key={item._id} item={item} refresh={refresh} />
      ))}
      </section>
      <section className="flex justify-end items-center">
        <button type="button" onClick={()=>setOpenForm(true)} className="card-btn-fill">
          <LuPlus className=""/>
          Artículo
        </button>
      </section>
      <Modal title="Crear Artículo" isOpen={openForm} onClose={()=>setOpenForm(false)}>
        {openForm && <ItemForm inventory={inventory} refresh={onRefresh}/>}
      </Modal>
    </div>
  );
};