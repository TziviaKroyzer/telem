import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

export default function FloatingHomeButton({
  side = "left",
  bottom = 24,
  offset = 20,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const hidden = location.pathname === "/" || location.pathname === "/login";
  if (hidden) return null;

  const sideStyle =
    side === "right"
      ? { right: `${offset}px`, left: "auto" }
      : { left: `${offset}px`, right: "auto" };

  return (
    <>
      <style>{`
        .fab-home {
          position: fixed;
          bottom: ${bottom}px;
          z-index: 9999;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          border: none;
          background: #ffffff;
          color: #0288d1;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(2, 136, 209, 0.22), 0 1px 4px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform .15s ease, box-shadow .2s ease, background .2s ease;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .fab-home:hover {
          background: #e8f4fd;
          box-shadow: 0 6px 22px rgba(2, 136, 209, 0.32);
          transform: translateY(-2px);
        }
        .fab-home:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(2, 136, 209, 0.18);
        }
      `}</style>
      <button
        className="fab-home"
        onClick={() => navigate("/")}
        aria-label="חזרה לדף הבית"
        title="חזרה לדף הבית"
        style={sideStyle}
      >
        <Home size={22} strokeWidth={1.8} />
      </button>
    </>
  );
}
