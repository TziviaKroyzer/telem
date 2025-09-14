import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { HDate, HebrewCalendar } from "@hebcal/core";

// ממיר מספר (1–30) לאותיות עבריות
function numberToHebrew(num) {
  const letters = [
    "",
    "א","ב","ג","ד","ה","ו","ז","ח","ט","י",
    "יא","יב","יג","יד","טו","טז","יז","יח","יט","כ",
    "כא","כב","כג","כד","כה","כו","כז","כח","כט","ל",
  ];
  return letters[num] || String(num);
}

// תאריך עברי (יום + חודש)
function renderHebrewDate(dateObj) {
  const hdate = new HDate(dateObj);
  const day = numberToHebrew(hdate.getDate());
  const month = hdate.render("he").split(" ")[1];
  return `${day} ${month}`;
}

// בודק אם יש חג/שבת
function getEventsForDate(dateObj) {
  const hdate = new HDate(dateObj);
  const events = HebrewCalendar.getHolidaysOnDate(hdate, true);
  return events || [];
}

const JewishCalendar = () => {
  const [date, setDate] = useState(new Date());

  return (
    <div className="calendar-container">
      <Calendar
        className="calendar--kz"
        onChange={setDate}
        value={date}
        locale="he-IL"
        tileClassName={({ date: tileDate, view }) => {
          if (view !== "month") return null;

          const events = getEventsForDate(tileDate);
          const isToday = tileDate.toDateString() === new Date().toDateString();
          const isHolidayOrShabbat = events.length > 0;

          return [
            isToday ? "is-today" : null,
            isHolidayOrShabbat ? "is-holiday" : null,
          ]
            .filter(Boolean)
            .join(" ");
        }}
        tileContent={({ date: tileDate, view }) => {
          if (view !== "month") return null;

          const events = getEventsForDate(tileDate);
          const names = events.map((e) => e.render("he"));

          return (
            <div className="tile-content">
              <span className="greg-day">{tileDate.getDate()}</span>
              <span className="heb-date">{renderHebrewDate(tileDate)}</span>
              {events.length > 0 && <span className="event-dot" />}
              {names.length > 0 && (
                <div className="events">{names.join(", ")}</div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default JewishCalendar;
