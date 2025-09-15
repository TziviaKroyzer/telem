// src/App.jsx
import { useState } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

import Authentication from "./pages/Authentication";
import Home from "./pages/Home";
import AddComment from "./pages/AddComment";
import Halls from "./pages/Halls";
import Login from "./components/Login";
import HallReservation from "./pages/HallReservation";
import FileSystem from "./pages/FileSystem";
import SearchPage from "./pages/SearchPage";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";

import FloatingHomeButton from "./components/FloatingHomeButton";
import logo from "./assets/logo.webp";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <div className="app-wrapper">
        {/* ✅ לוגו תמידי עם קישור לבית */}
        <header className="header">
          <Link to="/">
            <img src={logo} alt="Logo" className="logo" />
          </Link>
        </header>

        <div className="app-container">
          <Routes>
            {/* Public */}
            {!isAuthenticated && (
              <Route
                path="/login"
                element={
                  <Login onLoginSuccess={() => setIsAuthenticated(true)} />
                }
              />
            )}

            {/* Protected */}
            {isAuthenticated && (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/addComment" element={<AddComment />} />
                <Route path="/halls" element={<Halls />} />
                <Route path="/hallReservation" element={<HallReservation />} />
                <Route path="/fileSystem" element={<FileSystem />} />
                <Route path="/searchPage" element={<SearchPage />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/profile" element={<Profile />} />
              </>
            )}

            {/* Fallback */}
            <Route
              path="*"
              element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
            />
          </Routes>
        </div>

        {/* כפתור חזרה גלובלי */}
        <FloatingHomeButton side="left" />
      </div>

      {/* ✅ עיצוב הלוגו */}
      <style>
        {`
        .app-wrapper {
          text-align: center;
          direction: rtl;
        }

        .header {
          padding: 12px 0;
          background-color: transparent;
        }

        .logo {
          height: 60px;
          cursor: pointer;
        }

        .app-container {
          padding: 16px;
        }
      `}
      </style>
    </Router>
  );
};

export default App;
