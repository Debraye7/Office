export default function TabCard({ label, count, style }:{ label?:string, count:string|number, style?:string }) {
  const getStatusTagColor = () => {
    switch (label) {
      case "Todas":
        return "text-blue-light dark:text-blue-dark bg-blue-light/10 dark:bg-blue-dark/10";
      case "Pendientes":
        return "text-red-light dark:text-red-dark bg-red-light/10 dark:bg-red-dark/10";
      case "En curso":
        return "text-yellow-light dark:text-yellow-dark bg-yellow-light/10 dark:bg-yellow-dark/10";
      case "Finalizadas":
        return "text-green-light dark:text-green-dark bg-green-light/10 dark:bg-green-dark/10";
      case "Aprobadas":
        return "text-blue-light dark:text-blue-dark bg-blue-light/10 dark:bg-blue-dark/10";
      default:
        return "text-quaternary bg-quaternary/10";
    }
  };
  return(
    <p className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-y-0.5 gap-x-1 h-10 px-1 sm:px-2 rounded text-nowrap font-semibold text-xs sm:text-sm ${style || getStatusTagColor()}`}>
      <span className="text-nowrap">{label}</span> {`${count} `} 
    </p>
  );
};