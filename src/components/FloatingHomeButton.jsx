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
          width: 52px;
          height: 52px;
          border-radius: 16px;
          border: none;
          background: #12203A;
          color: #fff;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(18, 32, 58, 0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform .15s ease, box-shadow .2s ease, background .2s ease;
        }
        .fab-home:hover {
          background: #1D3358;
          box-shadow: 0 14px 28px rgba(18, 32, 58, 0.34);
          transform: translateY(-2px);
        }
        .fab-home:active {
          transform: translateY(0);
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
