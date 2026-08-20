// src/App.jsx
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

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
import BrandLogo from "./components/BrandLogo";

const App = () => {
  // undefined = בודק (טעינה), null = לא מחובר, object = מחובר
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  const isAuthenticated = Boolean(user);

  return (
    <Router>
      <div className="app-wrapper">
        <header className="header">
          <BrandLogo />
        </header>

        <div className="app-container">
          <Routes>
            {/* Public */}
            {!isAuthenticated && (
              <Route path="/login" element={<Login />} />
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

        <FloatingHomeButton side="left" />
      </div>

      <style>
        {`
        .app-wrapper {
          text-align: right;
          direction: rtl;
          min-height: 100vh;
        }

        .app-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-size: 1.1rem;
          color: #637186;
          direction: rtl;
        }

        .header {
          padding: 12px 20px 6px;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (min-width: 520px) {
          .header { padding: 16px 28px 8px; }
        }

        .app-container {
          padding: 8px 16px 32px;
          overflow-x: visible;
          box-sizing: border-box;
          width: 100%;
          max-width: 1360px;
          margin-inline: auto;
        }

        @media (min-width: 520px) {
          .app-container { padding: 8px 32px 40px; }
        }

        @media (min-width: 1100px) {
          .app-container { padding: 8px 48px 48px; }
        }
      `}
      </style>
    </Router>
  );
};

export default App;
