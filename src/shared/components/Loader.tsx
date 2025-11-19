import { RiLoader4Line } from "react-icons/ri";

export default function Loader() {
  return(
    <main className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/25 dark:bg-primary-light/25">
      <RiLoader4Line className="animate-spin text-stone-950 dark:text-stone-100 text-[50px] md:text-[100px]" />
    </main>
  );
};

// loader-circle