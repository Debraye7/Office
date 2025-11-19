import { TypeAttachment } from "@/src/shared/utils/types";
import Link from "next/link";
import { LuExternalLink } from "react-icons/lu";

export default function AttachmentItem({ attachment }:{ attachment:TypeAttachment }) {
  return(
    <Link href={attachment.link || ""} target="_blank" className="flex justify-between items-center gap-2 px-4 py-2 rounded-md text-xs bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark duration-300 overflow-hidden">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="min-w-5">
          <LuExternalLink className="text-2xl text-blue-light dark:text-blue-dark"/>
        </span>
        <div className="flex flex-col justify-center">
          <p className="line-clamp-1 font-semibold text-sm text-basic">{attachment.text}</p>
          <span className="line-clamp-1 text-xs text-quaternary">{attachment.link}</span>
        </div>
      </div>
    </Link>
  );
};