import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomeButton({ text, to, icon: Icon }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="btn btn--pill home-btn"
      style={{ width: "100%", minHeight: 60 }}
    >
      {Icon && <Icon size={22} strokeWidth={1.8} style={{ flexShrink: 0 }} />}
      <span className="home-btn-text">{text}</span>
    </button>
  );
}
