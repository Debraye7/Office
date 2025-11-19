import { useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

export default function Slider({ defaultOption, handleValue }:{ defaultOption?:number, handleValue:(value:number)=>void }) {
  const [value, setValue] = useState(defaultOption || 0);

  const handleSlide = (type:"+"|"-") => {
    let newValue = value;
    if(type === "+") newValue = value + 1;
    if(type === "-") newValue = value - 1;
    setValue(newValue);
    handleValue(newValue);
  };

  return(
    <div className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-nowrap font-semibold text-xs sm:text-sm text-basic bg-secondary-light dark:bg-secondary-dark border border-tertiary-light dark:border-tertiary-dark duration-300">
      <button type="button" onClick={() => handleSlide("-")} className="px-4 h-12 cursor-pointe hover:text-quaternary cursor-pointer duration-300">
        <LuChevronLeft className="text-xl"/>
      </button>
      <p className="flex-1 text-center min-w-20">{value}</p>
      <button type="button" onClick={() => handleSlide("+")} className="px-4 h-12 cursor-pointe hover:text-quaternary cursor-pointer duration-300">
        <LuChevronRight className="text-xl"/>
      </button>
    </div>
  );
};