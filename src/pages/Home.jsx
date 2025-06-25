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
     
    </div>
  );
};

export default Home;
