import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function FloatingHomeButton({
  side = "left",      // אפשר "left" או "right"
  bottom = 16,        // מרחק מהתחתית בפיקסלים
  offset = 16         // מרחק מהצד בפיקסלים
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // לא להציג בדף הבית או בדף ההתחברות
  const hidden = location.pathname === "/" || location.pathname === "/login";
  if (hidden) return null;

  const posStyle =
    side === "right"
      ? { right: `${offset}px`, left: "auto" }
      : { left: `${offset}px`, right: "auto" };

  return (
    <>
      <style>{`
        .fab-home {
          position: fixed;
          bottom: ${bottom}px;
          ${side === "right" ? "right" : "left"}: ${offset}px;
          z-index: 9999;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: none;
          background: #6ec8f1;
          color: #fff;
          font-size: 22px;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(0,0,0,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform .15s ease, background .2s ease;
        }
        .fab-home:hover { background: #58bae4; transform: translateY(-2px); }
        .fab-home:active { transform: translateY(0); }
      `}</style>
      <button
        className="fab-home"
        onClick={() => navigate("/")}
        aria-label="חזרה לדף הבית"
        title="חזרה לדף הבית"
        style={posStyle}
      >
        🏠
      </button>
    </>
  );
}
