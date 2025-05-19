import React from "react";
import ReactCalendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";

const Calendar = ({ value, onChange }) => {
  return (
    <div className="calendar-wrapper">
      <ReactCalendar
        onChange={onChange}
        value={value}
        locale="he-IL"
      />
      {/* <p className="selected-date">
        התאריך שנבחר: {value?.toLocaleDateString("he-IL")}
      </p> */}

      <style>{`
        .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
          background-color: #fff;
          border-radius: 0.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .react-calendar__tile--active {
          background: #2563eb;
          color: white;
          border-radius: 0.5rem;
        }

        .react-calendar__navigation button {
          color: #2563eb;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default Calendar;
