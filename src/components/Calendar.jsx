import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { HDate, HebrewCalendar } from "@hebcal/core";

// ממיר מספר (1-30) לאותיות עבריות
function numberToHebrew(num) {
  const letters = [
    "",
    "א",
    "ב",
    "ג",
    "ד",
    "ה",
    "ו",
    "ז",
    "ח",
    "ט",
    "י",
    "יא",
    "יב",
    "יג",
    "יד",
    "טו",
    "טז",
    "יז",
    "יח",
    "יט",
    "כ",
    "כא",
    "כב",
    "כג",
    "כד",
    "כה",
    "כו",
    "כז",
    "כח",
    "כט",
    "ל",
  ];
  return letters[num] || num;
}

const JewishCalendar = () => {
  const [date, setDate] = useState(new Date());

  // יום + חודש עברי באותיות
  const renderHebrewDate = (dateObj) => {
    const hdate = new HDate(dateObj);
    const day = numberToHebrew(hdate.getDate());
    const month = hdate.render("he").split(" ")[1];
    return `${day} ${month}`;
  };

  // בודק אם יש חג או שבת בתאריך מסוים
  // const getEventsForDate = (dateObj) => {
  //   const hdate = new HDate(dateObj);
  //   const events = HebrewCalendar.getHolidaysOnDate(hdate, true); // כולל שבתות
  //   return events;
  // };
  // בודק אם יש חג או שבת בתאריך מסוים
  const getEventsForDate = (dateObj) => {
    const hdate = new HDate(dateObj);
    const events = HebrewCalendar.getHolidaysOnDate(hdate, true);
    // אם undefined, נחזיר מערך ריק
    return events || [];
  };

  return (
    <div style={{ direction: "rtl", textAlign: "center" }}>
      <Calendar
        onChange={setDate}
        value={date}
        locale="he-IL"
        tileContent={({ date: tileDate, view }) => {
          if (view !== "month") return null;

          const events = getEventsForDate(tileDate);
          const isHolidayOrShabbat = events.length > 0;

          return (
            <div
              style={{
                fontSize: "10px",
                color: isHolidayOrShabbat ? "red" : "purple",
                fontWeight: isHolidayOrShabbat ? "bold" : "normal",
              }}
            >
              {renderHebrewDate(tileDate)}
              {isHolidayOrShabbat && (
                <div style={{ fontSize: "8px" }}>
                  {events.map((e) => e.render("he")).join(", ")}
                </div>
              )}
            </div>
          );
        }}
      />

      {/* <div style={{ marginTop: "15px", fontSize: "18px" }}>
        <p>תאריך לועזי נבחר: {date.toLocaleDateString("he-IL")}</p>
        <p>תאריך עברי נבחר: {renderHebrewDate(date)}</p>
        <p>
          {getEventsForDate(date).length > 0
            ? `חג/שבת: ${getEventsForDate(date)
                .map((e) => e.render("he"))
                .join(", ")}`
            : "אין חג/שבת"}
        </p>
      </div> */}
    </div>
  );
};

export default JewishCalendar;
