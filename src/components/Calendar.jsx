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

     
    </div>
  );
};

export default Calendar;
