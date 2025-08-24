// src/App.jsx
import { useState } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route,
} from "react-router-dom";

import TopMenu from "./components/TopMenu";

import Authentication from "./pages/Authentication";
import Home from "./pages/Home";
import AddComment from "./pages/AddComment";
import Halls from "./pages/Halls";
import Login from "./components/Login";
import HallReservation from "./pages/HallReservation";
import FileSystem from "./pages/FileSystem";
import SearchPage from "./pages/SearchPage";
import AdminPanel from "./pages/AdminPanel";

import FloatingHomeButton from "./components/FloatingHomeButton";
import logo from "./assets/logo.webp";
import "./App.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      <img src={logo} alt="Logo" className="logo" />

      <Router>
        {isAuthenticated && <TopMenu className="top-menu" />}

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
              </>
            )}

            {/* Fallback */}
            <Route
              path="*"
              element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
            />
          </Routes>
        </div>

        {/* כפתור חזרה גלובלי (מוסתר אוטומטית ב-/ ו-/login) */}
        <FloatingHomeButton side="left" />
      </Router>
    </>
  );
};

export default App;
