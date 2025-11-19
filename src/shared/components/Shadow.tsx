import { ReactNode } from "react";

export default function Shadow({ children, isOpen }:{ children:ReactNode, isOpen:boolean }) {
  return(
    <div className={`${isOpen ? "fixed" : "hidden"} top-0 left-0 right-0 z-50 flex flex-col-reverse sm:flex-row justify-center sm:items-center gap-2 p-2 w-full max-w-full h-screen max-h-full bg-primary-dark/50 dark:bg-tertiary-dark/75 overflow-hidden`}>
      {children}
    </div>
  );
};