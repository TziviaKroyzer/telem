import React from "react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { HDate, HebrewCalendar, flags } from "@hebcal/core";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HEB_DAYS = [
  "",
  "א׳",
  "ב׳",
  "ג׳",
  "ד׳",
  "ה׳",
  "ו׳",
  "ז׳",
  "ח׳",
  "ט׳",
  "י׳",
  "י״א",
  "י״ב",
  "י״ג",
  "י״ד",
  "ט״ו",
  "ט״ז",
  "י״ז",
  "י״ח",
  "י״ט",
  "כ׳",
  "כ״א",
  "כ״ב",
  "כ״ג",
  "כ״ד",
  "כ״ה",
  "כ״ו",
  "כ״ז",
  "כ״ח",
  "כ״ט",
  "ל׳",
];

const WEEKDAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

function toKey(d) {
  return d.toLocaleDateString("sv-SE");
}

function stripNiqqud(s) {
  return String(s).replace(/[\u0591-\u05C7]/g, "");
}

function hebrewDay(dateObj) {
  try {
    return HEB_DAYS[new HDate(dateObj).getDate()] || "";
  } catch {
    return "";
  }
}

function hebrewMonthYear(dateObj) {
  try {
    const mid = new Date(dateObj.getFullYear(), dateObj.getMonth(), 15);
    const parts = stripNiqqud(new HDate(mid).render("he")).split(" ").filter(Boolean);
    if (parts.length >= 3) return `${parts[1]} ${parts[2]}`;
    return parts.slice(1).join(" ");
  } catch {
    return "";
  }
}

function hebrewFull(dateObj) {
  try {
    return stripNiqqud(new HDate(dateObj).render("he"));
  } catch {
    return "";
  }
}

const SHOW_FLAGS =
  flags.CHAG |
  flags.MAJOR_FAST |
  flags.ROSH_CHODESH |
  flags.MINOR_HOLIDAY |
  flags.CHANUKAH_CANDLES |
  flags.MODERN_HOLIDAY |
  flags.CHOL_HAMOED;

function shortHoliday(name) {
  const clean = stripNiqqud(name);
  if (clean.includes("למעשר") || clean.includes("סליחות")) return "";
  if (clean.includes("ראש חודש")) return "ר״ח";
  if (clean.includes("חול המועד")) return "חוה״מ";
  if (clean.startsWith("חנוכה")) return "חנוכה";
  if (clean.length > 10) return `${clean.slice(0, 9)}…`;
  return clean;
}

const holidayCache = new Map();

function holidayNames(dateObj) {
  const key = `v2:${toKey(dateObj)}`;
  if (holidayCache.has(key)) return holidayCache.get(key);
  try {
    const events = HebrewCalendar.getHolidaysOnDate(new HDate(dateObj), true) || [];
    const names = [
      ...new Set(
        events
          .filter((e) => {
            const f = e.getFlags();
            if (f & flags.EREV || f & flags.YOM_KIPPUR_KATAN || f & flags.SPECIAL_SHABBAT) {
              return false;
            }
            return (f & SHOW_FLAGS) !== 0;
          })
          .map((e) => shortHoliday(e.render("he")))
          .filter(Boolean)
      ),
    ];
    holidayCache.set(key, names);
    return names;
  } catch {
    holidayCache.set(key, []);
    return [];
  }
}

const JewishCalendar = ({
  date,
  setDate,
  markedDates,
  markLabel = "יש הערות",
}) => {
  const marked =
    markedDates instanceof Set ? markedDates : new Set(markedDates || []);
  const initial = date instanceof Date ? date : new Date();
  const [viewDate, setViewDate] = React.useState(initial);
  const inViewMonth = (tileDate) =>
    tileDate.getMonth() === viewDate.getMonth() &&
    tileDate.getFullYear() === viewDate.getFullYear();

  return (
    <div className="cal">
      <ReactCalendar
        className="cal-widget"
        onChange={setDate}
        value={date}
        locale="he-IL"
        calendarType="gregory"
        minDetail="month"
        showFixedNumberOfWeeks
        prev2Label={null}
        next2Label={null}
        prevLabel={<ChevronRight size={20} strokeWidth={2} />}
        nextLabel={<ChevronLeft size={20} strokeWidth={2} />}
        onActiveStartDateChange={({ activeStartDate }) => {
          if (activeStartDate) setViewDate(activeStartDate);
        }}
        formatShortWeekday={(_, d) => WEEKDAYS[d.getDay()]}
        navigationLabel={({ date: navDate }) => (
          <span className="cal-nav-title">
            <span className="cal-nav-greg">
              {navDate.toLocaleDateString("he-IL", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="cal-nav-heb">{hebrewMonthYear(navDate)}</span>
          </span>
        )}
        tileClassName={({ date: tileDate, view }) => {
          if (view !== "month") return null;
          const classes = [];
          if (tileDate.toDateString() === new Date().toDateString()) classes.push("is-today");
          if (tileDate.getDay() === 6) classes.push("is-shabbat");
          if (inViewMonth(tileDate) && holidayNames(tileDate).length) classes.push("is-holiday");
          if (marked.has(toKey(tileDate))) classes.push("is-marked");
          return classes.join(" ");
        }}
        tileContent={({ date: tileDate, view }) => {
          if (view !== "month") return null;
          const names = inViewMonth(tileDate) ? holidayNames(tileDate) : [];
          return (
            <div className="cal-tile">
              <span className="cal-day">{tileDate.getDate()}</span>
              <span className="cal-heb">{hebrewDay(tileDate)}</span>
              {names[0] ? <span className="cal-event">{names[0]}</span> : null}
            </div>
          );
        }}
      />

      <div className="cal-footer">
        {date instanceof Date && !Number.isNaN(date.getTime()) ? (
          <div className="cal-selected">
            <strong>
              {date.toLocaleDateString("he-IL", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </strong>
            <span>{hebrewFull(date)}</span>
          </div>
        ) : (
          <div className="cal-selected cal-selected--hint">בחרי תאריך ביומן</div>
        )}

        <div className="cal-legend">
          <span className="cal-legend-item">
            <i className="cal-legend-swatch cal-legend-today" />
            היום
          </span>
          <span className="cal-legend-item">
            <i className="cal-legend-swatch cal-legend-shabbat" />
            שבת
          </span>
          <span className="cal-legend-item">
            <i className="cal-legend-swatch cal-legend-holiday" />
            חג
          </span>
          <span className="cal-legend-item">
            <i className="cal-legend-swatch cal-legend-mark" />
            {markLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

export default JewishCalendar;
