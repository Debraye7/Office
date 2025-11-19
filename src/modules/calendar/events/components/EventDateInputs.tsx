import CheckboxInput from "@shared/inputs/components/Checkbox";
import DateInput from "@shared/inputs/components/Date";
import TimeInput from "@shared/inputs/components/Time";
import { format, isMatch, parse } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";

export default function EventDateInputs({ day, start, end, handleDates }:{ day:boolean, start:Date, end:Date, handleDates:(values:{ day:boolean, start:Date, end:Date })=>void } ) {
  const [allDay, setAllDay] = useState(day);
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  useEffect(() => {
    handleDates({ day:allDay, start:startDate, end:endDate });
    return () => {};
  },[allDay, startDate, endDate]);

  function mergeDate(value: string, base: Date): Date | null {
    // Determine whether the value received is a date or time and merge it with the base date
    if (isMatch(value, "yyyy-MM-dd")) {
      return parse(`${value} ${format(base, "HH:mm", { locale:es })}`, "yyyy-MM-dd HH:mm", base);
    } else if (isMatch(value, "HH:mm")) {
      return parse(`${format(base, "yyyy-MM-dd", { locale:es })} ${value}`, "yyyy-MM-dd HH:mm", base);
    };
    // If the value is not a valid date or time, return null
    return null;
  };

  const handleStart = (value: string) => {
    const newDate = mergeDate(value, startDate);
    // If the new start date is invalid, do not update
    if (!newDate || isNaN(newDate.getTime())) return;
    // If the start date is the same as the end date, update the end date to match the new start date
    if (format(startDate, "yyyy-MM-dd", { locale:es }) === format(endDate, "yyyy-MM-dd", { locale:es })) setEndDate(parse(`${format(newDate, "yyyy-MM-dd", { locale:es })} ${format(endDate, "HH:mm", { locale:es })}`, "yyyy-MM-dd HH:mm", newDate));
    // If the new start date is after the end date, update the end date to match the new start date
    if (newDate > endDate) setEndDate(newDate);
    // If there is a change update the start date
    if (newDate.getTime() !== new Date(startDate).getTime()) setStartDate(newDate);
  };

  const handleEnd = (value: string) => {
    const newDate = mergeDate(value, endDate);
    // If the new start date is invalid, do not update
    if (!newDate || isNaN(newDate.getTime())) return;
    // If the end date is before the start date, update the start date to match the new end date
    if(newDate < startDate) setStartDate(newDate);
    // If there is a change update the end date
    if (newDate.getTime() !== endDate.getTime()) setEndDate(newDate);
  };

  return(
    <div className="flex flex-col gap-2">
      <CheckboxInput 
        name="all-day"
        label="Todo el día"
        defaultValue={allDay}
        handle={(newValue:boolean)=>setAllDay(newValue)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor={"start"} className="font-medium text-start text-sm text-tertiary-dark dark:text-tertiary-light">Inicio</label>
          <div className="flex flex-col gap-1">
            <DateInput 
              name="start-date"
              label=""
              handle={(newDate:string)=>handleStart(newDate)}
              value={startDate}
            />
            <TimeInput 
              name="start-time"
              label=""
              handle={(newDate:string)=>handleStart(newDate)}
              value={startDate}
              disabled={allDay}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={"end"} className="font-medium text-start text-sm text-tertiary-dark dark:text-tertiary-light">Final</label>
          <div className="flex flex-col gap-1">
            <DateInput 
              name="end-date"
              label=""
              handle={(newDate:string)=>handleEnd(newDate)}
              value={endDate}
            />
            <TimeInput 
              name="end-time"
              label=""
              handle={(newDate:string)=>handleEnd(newDate)}
              value={endDate}
              disabled={allDay}
            />
          </div>
        </div>
      </div>
    </div>
  );
};