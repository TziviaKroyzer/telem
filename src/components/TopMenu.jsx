import React from "react";
import { Link, NavLink } from "react-router-dom";

const navLinks = [
  { path: "/addComment", label: "AddComment" },
  { path: "/hallReservation", label: "HallReservation" },
  { path: "/halls", label: "Halls" },
  { path: "/fileSystem", label: "FileSystem" },
  { path: "/home", label: "Home" },
  { path: "/searchPage", label: "SearchPage" },
  { path: "/admin", label: "ניהול מערכת" },
 

];
const headerStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  backgroundColor: "#fff",
  zIndex: 1000,
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};
const TopMenu = () => {
  return (
    <header>
      <nav>
        <Link to="/" >
          {/* Replace this with an <img src="/logo.png" alt="Logo" /> if you have a logo */}
           </Link>
        <div>
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              style={{
                margin: "0 8px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default TopMenu;
