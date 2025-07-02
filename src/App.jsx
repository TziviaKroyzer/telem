import { useState, React } from "react";
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
import logo from "./assets/logo.webp";

import "./App.css"; // Add necessary CSS for layout

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      <img src={logo} alt="Logo" className="logo" />
   
    <Router>
      {isAuthenticated && <TopMenu className="top-menu" />}
      <div className="p-6">
        <Routes>
          {/* Public Route */}
          {!isAuthenticated && (
            <Route
              path="/login"
              element={
                <Login onLoginSuccess={() => setIsAuthenticated(true)} />
              }
            />
          )}

          {/* Protected Routes */}
          {isAuthenticated && (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/addComment" element={<AddComment />} />
              <Route path="/halls" element={<Halls />} />
              <Route path="/hallReservation" element={<HallReservation />} />
              <Route path="/fileSystem" element={<FileSystem />} />
              <Route path="/searchPage" element={<SearchPage />} />
              <Route path="/admin" element={<AdminPanel />} />

              {/* You can add more authenticated routes here */}
            </>
          )}

          {/* Redirect any unknown path */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
          />
        </Routes>
        
      </div>
    
    </Router>
     </>
  );
};

export default App;
