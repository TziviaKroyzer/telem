import React from "react";
import { Link, NavLink } from "react-router-dom";

const navLinks = [
  { path: "/addComment", label: "הערה חדשה" },
  { path: "/halls", label: "אולמות" },
  { path: "/fileSystem", label: "קבצים" },
  { path: "/searchPage", label: "חיפוש" },
  { path: "/admin", label: "ניהול מערכת", cta: true },
];

export default function TopMenu(){
  return (
    <header className="site-header">
      <nav className="site-nav">
        <Link to="/" className="nav-link">דף הבית</Link>
        <div className="nav-links">
          {navLinks.map(({ path, label, cta }) => (
            <NavLink
              key={path}
              to={path}
              className={({isActive}) =>
                "nav-link" + (cta ? " nav-link--cta" : "") + (isActive ? " active" : "")
              }
              end
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
