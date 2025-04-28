import React from "react";
import { Link, NavLink } from "react-router-dom";

const navLinks = [
  { path: "/about-us", label: "About Us" },
  { path: "/donate", label: "Donate" },
  { path: "/employees", label: "Employees" },
  { path: "/spaces", label: "Spaces" },
  { path: "/events", label: "Events" },
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
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          {/* Replace this with an <img src="/logo.png" alt="Logo" /> if you have a logo */}
          <h1 style={{ margin: 0, padding: "16px", fontSize: "24px" }}>MyLogo</h1>
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
