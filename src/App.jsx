import {useState ,React} from "react";
import { BrowserRouter as Router, Navigate,Routes, Route } from "react-router-dom";
import TopMenu from "./components/TopMenu";

import AboutUs from "./pages/AboutUs";
import Donate from "./pages/Donate";
import Employees from "./pages/Employees";
import Spaces from "./pages/Spaces";
import Events from "./pages/Events";
import Login from "./components/Login";
import './App.css'; // Add necessary CSS for layout


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  return (
    <Router>
      {isAuthenticated && <TopMenu className="top-menu" />}
      <div className="p-6">
        <Routes>
           {/* Public Route */}
        {!isAuthenticated && (
          <Route
            path="/login"
            element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />}
          />
        )}
        {/* Protected Routes */}
        {isAuthenticated && (
          <>
            <Route path="/" element={<Home />} />

          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/spaces" element={<Spaces />} />
          <Route path="/events" element={<Events />} />
                       {/* You can add more authenticated routes here */}
          </>
        )} 
        {/* You can add more authenticated routes here */}
            {/* Redirect any unknown path */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
        />     
        </Routes>
      </div>
    </Router>
  );
};

export default App;
// Ensure the TopMenu component is styled to always stay at the top of the page

// Example CSS to include in App.css:
// .top-menu {
//   position: fixed;
//   top: 0;
//   width: 100%;
//   z-index: 1000;
// }
// .content {
//   margin-top: 60px; // Adjust based on the height of TopMenu
// }



// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import UsersList from './components/UsersList'
// import './App.css'
// import Login from './components/Login'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
        
//          {count % 2 == 0 && <UsersList /> }
        
//       </div>
//       <Login />
//     </>
//   )
// }

// export default App
