import React from "react";
import HomeButton from "../components/HomeButton";
import logo from "../assets/logo.webp";

const Home = () => {
  return (
    <div className="home-page">
      <style>{`
        .home-page {
          min-height: 100vh;
          background: linear-gradient(to bottom right, #f7fafd, #e6f3fa);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2em;
          text-align: center;
        }

        .home-title {
          font-size: 2em;
          font-weight: bold;
          color: #6ec8f1;
          margin-bottom: 1.2em;
        }

        .buttons-container {
          display: flex;
          flex-wrap: wrap;
          gap: 1em;
          justify-content: center;
          margin-bottom: 2em;
        }

        .logo-image {
          max-width: 130px;
          height: auto;
          margin-top: 1em;
        }

        /* עיצוב ברירת מחדל לכפתורים אם HomeButton לא כולל עיצוב */
        .buttons-container button,
        .buttons-container a {
          background: #6ec8f1;
          color: white;
          padding: 0.75em 1.5em;
          border: none;
          border-radius: 12px;
          font-size: 1em;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.3s ease;
        }

        .buttons-container button:hover,
        .buttons-container a:hover {
          background: #58bae4;
        }

        @media (max-width: 600px) {
          .buttons-container {
            flex-direction: column;
            gap: 0.8em;
          }

          .home-title {
            font-size: 1.4em;
          }
        }
      `}</style>

      <h1 className="home-title">home page</h1>

      <div className="buttons-container">
        <HomeButton text="add comment" to="/addComment" />
        <HomeButton text="halls" to="/halls" />
        <HomeButton text="fileSystem" to="/fileSystem" />
        <HomeButton text="SearchPage" to="/searchPage" />
      </div>

     
    </div>
  );
};

export default Home;
