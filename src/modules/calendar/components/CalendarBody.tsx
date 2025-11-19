import { startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isToday, format, endOfWeek, startOfDay, endOfDay } from "date-fns";
import { WEEK_DAYS_DATA } from "@shared/utils/data";
import { TypeEvent } from "@shared/utils/types";
import Day from "@calendar/components/CalendarDay";
import { useMemo } from "react";
import { es } from "date-fns/locale";

export default function Calendar({ date, events, refresh }:{ date:Date, events:TypeEvent[], refresh:()=>void }) {
  const firstMonthDay = startOfMonth(date);
  const lastMonthDay = endOfMonth(firstMonthDay);
  const startCalendar = startOfWeek(firstMonthDay, { weekStartsOn:1 });
  const endCalendar = endOfWeek(lastMonthDay, { weekStartsOn: 1 });

  // Generar matriz de semanas
  const weeks = [];
  let current = startCalendar;

  while (current <= endCalendar) {
    const week = [];

    for (let i = 0; i < 7; i++) {
      week.push(current);
      current = addDays(current, 1);
    }

    weeks.push(week);
  }

  // Agrupar eventos por fecha
  const eventsByDate = useMemo(() => {
    const map = new Map<string, TypeEvent[]>();

    for (const event of events) {
      let current = startOfDay(event.start);
      const end = endOfDay(event.end);

      while (current <= end) {
        const key = format(current, "yyyy-MM-dd", { locale: es });
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(event);
        current = addDays(current, 1);
      }
    }

    return map;
  }, [events]);

  const getDayEvents = (day: Date) => {
    const key = format(day, "yyyy-MM-dd", { locale:es });
    return eventsByDate.get(key) || [];
  };

  return (
    <div className="flex-1 overflow-x-auto max-w-full">
      <table className="flex flex-col w-full h-full text-center border-collapse" role="table" aria-label="Calendario mensual">
        <thead role="rowgroup" className="w-full">
          <tr role="row" className="flex">
            {WEEK_DAYS_DATA.map((day) => (
              <th
                key={day.value}
                scope="col"
                className="flex-1 flex items-center justify-center min-w-1/7 sm:w-14 h-10 sm:h-14 font-bold text-xs sm:text-sm text-quaternary"
              >
                {day.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup" className="flex-1 flex flex-col gap-0.5 sm:gap-1 w-full pb-2 px-2">
          {weeks.map((week, wIdx) => (
            <tr key={wIdx} role="row" className="flex-1 flex gap-0.5 sm:gap-1">
              {week.map((day) => (
                <td key={day.toISOString()} role="gridcell" className="max-w-1/7 min-w-10 min-h-16 w-1/7 align-top">
                  <Day
                    day={day}
                    isToday={isToday(day)}
                    isSameMonth={isSameMonth(day, firstMonthDay)}
                    events={getDayEvents(day)}
                    refresh={refresh}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

