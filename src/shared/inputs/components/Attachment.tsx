import { useState } from "react";
import { TypeAttachment } from "../../utils/types";
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
import { LuExternalLink, LuPlus, LuTrash2, LuGrip, LuCheck, LuCircleCheck } from "react-icons/lu";
import { ObjectId } from "bson";

function SortableAttachment({
  id,
  attachment,
  onDelete,
  onEdit,
}: {
  id: string;
  attachment: TypeAttachment;
  onDelete: () => void;
  onEdit: (newText: string, newLink: string) => void;
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
  const [editText, setEditText] = useState(attachment.text);
  const [editLink, setEditLink] = useState(attachment.link);

  const handleSaveEdit = () => {
    if (editLink.trim() && editText.trim()) {
      onEdit(editText.trim(), editLink.trim());
      setIsEditing(false);
    }
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center justify-between gap-3 ${!isEditing ? "h-16" : "h-24"} px-5 py-2.5 my-0.5 rounded-md bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark border border-tertiary-light dark:border-tertiary-dark transition-all duration-300 ${
        isDragging ? "opacity-80 scale-[1.03] shadow-lg dark:shadow-black/50 z-50" : ""
      }`}
    >
      <div className="flex-1 flex items-center gap-4">
        <span {...listeners} className="cursor-grab active:cursor-grabbing select-none">
          <LuGrip className="text-xl text-quaternary" />
        </span>

        {isEditing ? (
          <div className="flex flex-col flex-1 gap-0.5">
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
              placeholder="Título"
              className="w-full p-2 outline-none rounded-md font-medium text-sm text-basic bg-secondary-light dark:bg-secondary-dark focus-within:bg-primary-light dark:focus-within:bg-primary-dark border border-tertiary-light dark:border-tertiary-dark placeholder:text-quaternary/50 duration-300"
            />
            <input
              value={editLink}
              onChange={(e) => setEditLink(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
              placeholder="Enlace"
              className="w-full p-2 outline-none rounded-md font-medium text-sm text-basic bg-secondary-light dark:bg-secondary-dark focus-within:bg-primary-light dark:focus-within:bg-primary-dark border border-tertiary-light dark:border-tertiary-dark placeholder:text-quaternary/50 duration-300"
            />
          </div>
        ) : (
          <span className="flex flex-col justify-center w-full" onDoubleClick={() => setIsEditing(true)}>
            <p className="line-clamp-1 font-semibold text-sm text-basic">{attachment.text}</p>
            <span className="line-clamp-1 text-xs">{attachment.link}</span>
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

export default function AttachmentInput({
  label,
  attachments,
  setAttachments,
}: {
  label?: string;
  attachments: TypeAttachment[];
  setAttachments: (attachments: TypeAttachment[]) => void;
}) {
  const [text, setText] = useState("");
  const [link, setLink] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddOption = () => {
    if (link.trim() && text.trim())
      setAttachments([
        ...attachments,
        { _id: new ObjectId().toString(), text: text.trim(), link: link.trim() },
      ]);
    setLink("");
    setText("");
  };

  const handleDeleteOption = (_id: string) => {
    setAttachments(attachments.filter((a) => a._id !== _id));
  };

  const handleEditOption = (_id: string, newText: string, newLink: string) => {
    setAttachments(
      attachments.map((a) => (a._id === _id ? { ...a, text: newText, link: newLink } : a))
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = attachments.findIndex((a) => a._id === active.id);
      const newIndex = attachments.findIndex((a) => a._id === over.id);
      setAttachments(arrayMove(attachments, oldIndex, newIndex));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="flex font-medium text-sm text-tertiary-dark dark:text-tertiary-light">
        {label}
      </label>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={attachments.map((a) => a._id)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col">
            {attachments.map((attachment) => (
              <SortableAttachment
                key={attachment._id}
                id={attachment._id}
                attachment={attachment}
                onDelete={() => handleDeleteOption(attachment._id)}
                onEdit={(newText, newLink) => handleEditOption(attachment._id, newText, newLink)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <div className="flex flex-wrap items-center gap-1">
        <input
          id="attachment-text-input"
          type="text"
          placeholder="Título"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-3 outline-none rounded-md font-medium text-sm text-basic bg-secondary-light dark:bg-secondary-dark focus-within:bg-primary-light dark:focus-within:bg-primary-dark border border-tertiary-light dark:border-tertiary-dark placeholder:text-quaternary/50 duration-300"
        />
        <input
          id="attachment-link-input"
          type="text"
          placeholder="Enlace"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="flex-1 p-3 outline-none rounded-md font-medium text-sm text-basic bg-secondary-light dark:bg-secondary-dark focus-within:bg-primary-light dark:focus-within:bg-primary-dark border border-tertiary-light dark:border-tertiary-dark placeholder:text-quaternary/50 duration-300"
        />
        <button type="button" onClick={handleAddOption} className="card-btn text-nowrap max-w-1/4">
          <LuPlus className="text-xl" />
          <span className="hidden sm:inline font-semibold text-sm">Agregar</span>
        </button>
      </div>
    </div>
  );
}
