import { ReactNode } from "react";

export default function ModalButtons({ children }:{ children:ReactNode }) {
  return(
    <div className="sm:flex-1 flex flex-col gap-4 p-4 sm:h-full sm:max-w-1/3 min-w-1/5 bg-primary-light dark:bg-primary-dark rounded-lg">
      {children}
    </div>
  );
};