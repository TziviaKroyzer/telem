// src/App.jsx
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

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
  // undefined = בודק (טעינה), null = לא מחובר, object = מחובר
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  if (user === undefined) {
    return (
      <div className="app-loading">
        <span>טוען...</span>
      </div>
    );
  }

  const isAuthenticated = !!user;

  return (
    <Router>
      <div className="app-wrapper">
        <header className="header">
          <Link to="/">
            <img src={logo} alt="Logo" className="logo" />
          </Link>
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
          text-align: center;
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
          padding: 8px 16px;
          background-color: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (min-width: 520px) {
          .header { padding: 12px 24px; }
        }

        .logo {
          height: clamp(44px, 8vw, 60px);
          cursor: pointer;
          display: block;
        }

        .app-container {
          padding: 12px;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        @media (min-width: 520px) {
          .app-container { padding: 16px; }
        }
      `}
      </style>
    </Router>
  );
};

export default App;
