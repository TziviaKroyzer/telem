import React from "react";
import HomeButton from "../components/HomeButton";
import logo from "../assets/logo.webp";

const Home = () => {
  return (
    <div className="home-page">
      <h1 className="home-title">home page</h1>

      <div className="buttons-container">
        <HomeButton text="add comment" to="/addComment" />
        <HomeButton text="halls" to="/halls" />
        <HomeButton text="fileSystem" to="/fileSystem" />
        <HomeButton text="SearchPage" to="/searchPage" />
      </div>
      <img src={logo} alt="לוגו" className="logo-image" />
      <style>
        {`
          .home-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding-top: 100px;
           
            text-align: center;
          }

          .home-title {
            font-size: 2.5rem;
            margin-bottom: 2rem;
            color: #1e293b;
          }

          .buttons-container {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          @media (min-width: 768px) {
            .buttons-container {
              flex-direction: row;
              justify-content: center;
              flex-wrap: wrap;
              gap: 1rem;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Home;
