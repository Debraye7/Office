export default function Progress({ progress, color }:{ progress:string, color:string }) {
  const getColor = () => {
    switch (color) {
      case "red":
        return "bg-red-light dark:bg-red-dark";
      case "orange":
        return "bg-orange-600 dark:bg-orange-500";
      case "yellow":
        return "bg-yellow-light dark:bg-yellow-dark";
      case "green":
        return "bg-green-light dark:bg-green-dark";
      default:
        return "bg-quaternary";
    }
  };

  return(
    <div className="w-full bg-tertiary-light dark:bg-tertiary-dark rounded-full h-1.5">
      <div className={`h-1.5 rounded-full text-center font-medium text-xs ${getColor()}`} style={{ width:progress }}/>
    </div>
  );
};