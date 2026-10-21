"use client";

import { useState } from "react";
import EventCalendar from "./EventCalendar";
import UpcomingEventList from "./UpcomingEventList";

function tomorrow(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Owns the selected-day state shared between the calendar and the event list beside it, so clicking a day updates which events the list shows. */
export default function EventCalendarSection() {
  const [selectedDate, setSelectedDate] = useState<Date>(tomorrow);

  return (
    <>
      <EventCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      <UpcomingEventList date={selectedDate} />
    </>
  );
}
