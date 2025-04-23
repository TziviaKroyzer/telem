import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopMenu from "./components/TopMenu";

import AboutUs from "./pages/AboutUs";
import Donate from "./pages/Donate";
import Employees from "./pages/Employees";
import Spaces from "./pages/Spaces";
import Events from "./pages/Events";

const App = () => {
  return (
    <Router>
      <TopMenu />
      <div className="p-6">
        <Routes>
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/spaces" element={<Spaces />} />
          <Route path="/events" element={<Events />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;




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
