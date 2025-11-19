import { TypeAssignedStatus } from "@/src/shared/utils/types";
import Image from "next/image";

export default function AvatarGroup({ avatars, maxVisible }:{ avatars:{ name:string, status?:TypeAssignedStatus, img:string }[], maxVisible:number }) {

  const getBorderColor = (status?:TypeAssignedStatus) => {
    if(!status) return "border-secondary-light dark:border-secondary-dark";
    if(status === "pending") return "border-yellow-light dark:border-yellow-dark";
    if(status === "accepted") return "border-green-light dark:border-green-dark";
    if(status === "declined") return "border-red-light dark:border-red-dark";
  }; 

  return(
    <ul className="flex items-center">
    {avatars.slice(0, maxVisible).map((avatar, index)=>(
      <li key={`avatar-${index}`} className="size-10 rounded-full -ml-3 first:ml-0 group">
        <Image
          src={avatar.img}
          alt={`Avatar ${index}`}
          width={50} height={50}
          className={`size-10 rounded-full border-2 ${getBorderColor(avatar.status)} object-cover`}
        />
        <span className="absolute z-20 hidden group-hover:inline px-2 py-1 rounded text-nowrap font-medium text-xs text-primary-light dark:text-primary-dark bg-primary-dark dark:bg-primary-light">{avatar.name}</span>
      </li>
    ))}
    {avatars.length > maxVisible &&
      <li className="flex items-center justify-center size-9 -ml-4 rounded-full font-medium text-sm text-primary-light dark:text-primary-dark bg-primary-dark dark:bg-primary-light border-2 border-secondary-light dark:border-secondary-dark">
        +{avatars.length - maxVisible}
      </li>
    }
    </ul>
  );
};