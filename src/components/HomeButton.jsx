// src/components/HomeButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomeButton({ text, to }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="btn btn--pill"
      style={{ minWidth: 160, height: 48, fontSize: 18 }}
    >
      {text}
    </button>
  );
}
