// src/components/HomeButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const HomeButton = ({ text, to }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full md:w-64 h-32 m-4 text-xl font-semibold rounded-lg shadow-md bg-blue-600 text-white hover:bg-blue-700 transition"
    >
      {text}
    </button>
  );
};

export default HomeButton;
