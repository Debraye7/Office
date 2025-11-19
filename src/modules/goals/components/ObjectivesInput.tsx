import { useState } from "react";
import { TypeObjective } from "@shared/utils/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LuCircleCheck, LuGrip, LuPlus, LuTrash2 } from "react-icons/lu";
import { ObjectId } from "bson"; // Para generar ids compatibles con MongoDB
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";

type Props = {
  list: TypeObjective[];
  setList: (list: TypeObjective[]) => void;
};

function SortableItem({
  id,
  objective,
  onDelete,
  onEdit,
}: {
  id: string;
  objective: TypeObjective;
  onDelete: () => void;
  onEdit: (newText: string, newDeadline:Date) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    animateLayoutChanges: (args) =>
      defaultAnimateLayoutChanges({
        ...args,
        wasDragging: true,
      }),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(objective.text);
  const [editDate, setEditDate] = useState(objective.deadline || new Date());

  const handleSaveEdit = () => {
    if (editText.trim() && editDate) {
      onEdit(editText.trim(), editDate);
      setIsEditing(false);
    };
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center justify-between gap-3 ${!isEditing ? "h-16" : "h-24"} px-3 py-2 my-0.5 rounded-md bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark border border-tertiary-light dark:border-tertiary-dark transition-all duration-300 ${
        isDragging
          ? "opacity-80 scale-[1.03] shadow-lg dark:shadow-black/50 z-50"
          : ""
      }`}
    >
      <div className="flex-1 flex items-center gap-2">
        <span
          {...listeners}
          className="h-full cursor-grab active:cursor-grabbing select-none"
        >
          <LuGrip className="text-xl text-quaternary" />
        </span>

        {isEditing ? (
          <div className="flex flex-col flex-1 gap-0.5">
            <input
              type="date"
              value={format(editDate, "yyyy-MM-dd", { locale:es })}
              onChange={(e) => setEditDate(parse(e.target.value, "yyyy-MM-dd", new Date()))}
              onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
              placeholder="Fecha objetivo"
              className="w-full p-2 outline-none rounded-md font-medium text-sm text-basic bg-secondary-light dark:bg-secondary-dark focus-within:bg-primary-light dark:focus-within:bg-primary-dark border border-tertiary-light dark:border-tertiary-dark placeholder:text-quaternary/50 duration-300"
            />
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
              placeholder="Objetivo"
              className="w-full p-2 outline-none rounded-md font-medium text-sm text-basic bg-secondary-light dark:bg-secondary-dark focus-within:bg-primary-light dark:focus-within:bg-primary-dark border border-tertiary-light dark:border-tertiary-dark placeholder:text-quaternary/50 duration-300"
            />
          </div>
        ) : (
          <span className="flex flex-col justify-center w-full" onDoubleClick={() => setIsEditing(true)}>
            <span className="line-clamp-1 text-xs">{objective.deadline ? format(objective.deadline, "dd/MM/yyyy", { locale:es }) : "Sin fecha objetivo"}</span>
            <p className="line-clamp-1 font-semibold text-sm text-basic">{objective.text}</p>
          </span>
        )}
      </div>
      {!isEditing ?
        <button type="button" onClick={onDelete} className="cursor-pointer">
          <LuTrash2 className="text-lg text-quaternary hover:text-red-light dark:hover:text-red-dark duration-300" />
        </button>
      :
        <button type="button" onClick={() => handleSaveEdit()} className="">
          <LuCircleCheck className="text-xl text-quaternary hover:text-blue-light dark:hover:text-blue-dark duration-300"/>
        </button>
      }
    </li>
  );
}

export default function ObjectiveListInput({
  list,
  setList,
}: Props) {
  const [objective, setObjective] = useState("");
  const [deadline, setDeadline] = useState<Date|undefined>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddObjective = () => {
    if (objective.trim() && deadline)
      setList([
        ...list,
        { _id: new ObjectId().toString(), text: objective.trim(), deadline, completed: false },
      ]);
    setObjective("");
    setDeadline(undefined);
  };

  const handleDeleteObj = (_id: string) => {
    setList(list.filter((o) => o._id !== _id));
  };

  const handleEditObj = (_id: string, newText: string, newDate:Date) => {
    setList(list.map((o) => (o._id === _id ? { ...o, text: newText, deadline:newDate } : o)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = list.findIndex((o) => o._id === active.id);
      const newIndex = list.findIndex((o) => o._id === over.id);
      setList(arrayMove(list, oldIndex, newIndex));
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-sm text-tertiary-dark dark:text-tertiary-light">Objetivos</label>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={list.map((o) => o._id)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col">
            {list.map((obj) => (
              <SortableItem
                key={obj._id}
                id={obj._id}
                objective={obj}
                onDelete={() => handleDeleteObj(obj._id)}
                onEdit={(newText, newDeadline) => handleEditObj(obj._id, newText, newDeadline)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <div className="flex flex-wrap items-center gap-1">
        <input
          id="objective-text-input"
          type="text"
          placeholder="Título"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          className="w-full p-3 outline-none rounded-md font-medium text-sm text-basic bg-secondary-light dark:bg-secondary-dark focus-within:bg-primary-light dark:focus-within:bg-primary-dark border border-tertiary-light dark:border-tertiary-dark placeholder:text-quaternary/50 duration-300"
        />
        <input
          id="objective-deadline-input"
          type="date"
          placeholder="Enlace"
          defaultValue={deadline && format(deadline, "yyyy-MM-dd", { locale:es })}
          onChange={(e) => setDeadline(parse(e.target.value, "yyyy-MM-dd", new Date()))}
          className="flex-1 p-3 outline-none rounded-md font-medium text-sm text-basic bg-secondary-light dark:bg-secondary-dark focus-within:bg-primary-light dark:focus-within:bg-primary-dark border border-tertiary-light dark:border-tertiary-dark placeholder:text-quaternary/50 duration-300"
        />
        <button type="button" onClick={handleAddObjective} className="card-btn text-nowrap max-w-1/4">
          <LuPlus className="text-xl" />
          <span className="hidden sm:inline font-semibold text-sm">Agregar</span>
        </button>
      </div>
    </div>
  );
}