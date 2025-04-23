import React from "react";
import { Link, NavLink } from "react-router-dom";

const navLinks = [
  { path: "/about-us", label: "About Us" },
  { path: "/donate", label: "Donate" },
  { path: "/employees", label: "Employees" },
  { path: "/spaces", label: "Spaces" },
  { path: "/events", label: "Events" },
];

const TopMenu = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 shadow-md bg-white">
      <Link to="/" className="text-xl font-bold text-blue-600">
        {/* Replace this with an <img src="/logo.png" /> if you have a logo */}
        MyLogo
      </Link>
      <nav className="space-x-4">
        {navLinks.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-blue-600"
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default TopMenu;
