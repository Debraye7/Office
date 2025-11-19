import { useState } from "react";
import { format, isBefore, isEqual, isWithinInterval, setHours, setMinutes, startOfHour } from "date-fns";
import { es } from "date-fns/locale";
import { TypeEvent } from "@shared/utils/types";
import Modal from "@shared/components/Modal";
import EventForm from "@events/components/EventForm";
import { LuCirclePlus } from "react-icons/lu";


export default function Day({
  isSameMonth,
  isToday,
  day,
  events,
  refresh,
}: {
  isSameMonth: boolean;
  isToday: boolean;
  day: Date;
  events: TypeEvent[];
  refresh: () => void;
}) {
  const [openModal, setOpenModal] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(day);

  const hours = Array.from({ length: 24 }, (_, i) =>
    setMinutes(setHours(day, i), 0)
  );

  const getEventsForHour = (hour: Date) => {
    return events.filter(
      (event) =>
        isWithinInterval(hour, { start: event.start, end: event.end }) ||
        isEqual(startOfHour(hour), startOfHour(event.start))
    );
  };

  const hasEvents = events.length > 0;
  const dayNumber = format(day, "d", { locale:es });
  const dayLabel = format(day, "EEEE, d 'de' MMMM yyyy", { locale: es });

  const handleDay = () => {
    setSelectedDate(day);
    setOpenForm(true);
  };

  const handleHour = (date:Date) => {
    setSelectedDate(date);
    setOpenForm(true);
  };

  return (
    <>
      <div
        role="gridcell"
        aria-selected={isToday}
        aria-label={`Día ${dayNumber}, ${dayLabel}${
          hasEvents ? ", contiene eventos" : ""
        }`}
        className="flex items-center justify-center w-full h-full"
      >
        <button
          type="button"
          onClick={hasEvents ? () => setOpenModal(true) : handleDay}
          aria-label={`Ver eventos para el ${dayLabel}`}
          className={`
            relative p-2 w-full h-full rounded-lg hover:bg-tertiary-light dark:hover:bg-tertiary-dark cursor-pointer duration-300 group border-2
            ${hasEvents ? "border-primary-dark dark:border-quaternary" : "border-transparent"}
            ${isSameMonth ? "text-primary-dark dark:text-primary-light" : "opacity-25"}
            ${isToday ? "font-semibold bg-secondary-light dark:bg-secondary-dark" : "font-medium"}
          `}
        >
          <span className="sr-only">{dayLabel}</span>
          <span className="w-full text-xs sm:text-sm">{dayNumber}</span>
          {hasEvents && <span className="absolute top-1 right-1 hidden sm:group-hover:flex items-center justify-center size-5 rounded-full font-semibold text-[10px] text-primary-light dark:text-primary-dark bg-primary-dark dark:bg-primary-light">{events.length < 10 ? events.length : "+9"}</span>}
        </button>
      </div>

      {openModal && (
        <Modal
          title={dayLabel}
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
        >
          <div className="border-t border-tertiary-light dark:border-tertiary-dark overflow-auto duration-300">
            <table
              className="w-full text-left border-collapse"
              aria-label={`Tabla de eventos por hora para el ${dayLabel}`}
            >
              <thead>
                <tr className="flex gap-5">
                  <th className="p-2 text-quaternary text-sm font-semibold w-1/10">
                    Hora
                  </th>
                  <th className="flex-1 p-2 text-quaternary text-sm font-semibold">
                    Eventos
                  </th>
                </tr>
              </thead>
              <tbody>
                {hours.map((hour, index) => {
                  const hourEvents = getEventsForHour(hour);
                  return (
                    <tr
                      key={index}
                      className={`flex gap-2 border-b border-tertiary-light dark:border-tertiary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark duration-300 group`}
                    >
                      <td className={`min-w-fit w-1/10 p-2 align-top whitespace-nowrap ${isBefore(hour, new Date()) ? "opacity-15 hover:opacity-75" : "opacity-100"} duration-300`}>
                        <button type="button" onClick={() => handleHour(hour)} className="flex flex-col size-full font-bold text-sm text-quaternary hover:text-primary-dark dark:hover:text-primary-light duration-300">
                          {format(hour, "hh:mm a", { locale: es })}
                          <span className="flex-1 flex items-center justify-center w-full">
                            <LuCirclePlus className="text-xl"/>
                          </span>
                        </button>
                      </td>
                      <td className="flex-1 p-2 min-h-28">
                        {hourEvents.length < 1 ? (
                          <span className="block text-quaternary/50 font-semibold py-2 px-4">
                            Sin eventos
                          </span>
                        ) : (
                          <ul className="flex flex-col sm:flex-row flex-wrap gap-2">
                            {hourEvents.map((event, i) => (
                              <li
                                key={i}
                                role="group"
                                aria-label={`Evento: ${event.title}`}
                                className={`flex-1 min-w-60 min-h-28 py-2 px-4 rounded-lg bg-secondary-light dark:bg-secondary-dark group-hover:bg-tertiary-light dark:group-hover:bg-tertiary-dark hover:bg-primary-light dark:hover:bg-primary-dark ${isBefore(hour, new Date()) ? "opacity-25 hover:opacity-75" : "opacity-100"} duration-300`}
                              >
                                <div className="flex justify-between text-xs font-semibold text-quaternary">
                                  <div>
                                    <div>
                                      {format(event.start, "dd/MM/yyyy", { locale:es })}
                                    </div>
                                    <div>
                                      {format(event.start, "hh:mm:ss", { locale:es })}
                                    </div>
                                  </div>
                                  <div>
                                    <div>
                                      {format(event.end, "dd/MM/yyyy", { locale:es })}
                                    </div>
                                    <div>
                                      {format(event.end, "hh:mm:ss", { locale:es })}
                                    </div>
                                  </div>
                                </div>
                                <p className="mt-1 font-medium text-xs sm:text-sm text-primary-dark dark:text-primary-light">
                                  {event.title}
                                </p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
      <Modal title="Crear Evento" isOpen={openForm} onClose={() => setOpenForm(false)}>
        {openForm && <EventForm defaultDate={selectedDate} closeForm={()=>setOpenForm(false)} refresh={refresh}/>}
      </Modal>
    </>
  );
};