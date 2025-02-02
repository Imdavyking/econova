/** @format */

import React, { useEffect, useState } from "react";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import ChatBot from "@/components/chat-bot/Main";
import { Link } from "react-router-dom";
import Footer from "@/base-components/footer";
import logoUrl from "@/assets/images/logo.png";
import EVM_LOGO from "@/assets/images/creative_eth.png";
import { APP_NAME, SERVER_URL_TWITTER_LOGIN } from "../../utils/constants";
import ConnectWallet from "../../components/ConnectWallet";
import { getUserTwitterInfo } from "../../services/user.twitter.services";

const Home = () => {
  const [twitterHandle, setTwitterHandle] = useState("");
  useEffect(() => {
    getUserTwitterInfo()
      .then((data) => {
        setTwitterHandle(data.screen_name);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  return (
    <>
      <div>
        <DarkModeSwitcher />
        <ChatBot />

        <div className="w-full px-4 md:px-8 lg:px-16">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-center w-full py-5">
            {/* Logo */}
            <a href="/" className="flex items-center">
              <img alt={APP_NAME} className="w-10 md:w-12" src={logoUrl} />
              <span className="text-white text-lg md:text-xl ml-3">
                {APP_NAME}
              </span>
            </a>

            {/* Twitter Login Button */}
            <a
              href={twitterHandle ? "#" : SERVER_URL_TWITTER_LOGIN}
              className={`mt-3 md:mt-0 flex items-center ${
                twitterHandle ? "cursor-not-allowed opacity-50" : ""
              }`}
              onClick={(e) => twitterHandle && e.preventDefault()}
            >
              <button
                className={`flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform ${
                  twitterHandle ? "" : "hover:scale-105"
                }`}
                disabled={twitterHandle}
              >
                {twitterHandle ? (
                  twitterHandle
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M23 3a10.9 10.9 0 0 1-3.157.869A5.45 5.45 0 0 0 22.4 2.006a10.908 10.908 0 0 1-3.464 1.318A5.448 5.448 0 0 0 16.3 1a5.44 5.44 0 0 0-5.442 5.442c0 .426.045.841.132 1.237A15.415 15.415 0 0 1 1.671 3.149a5.43 5.43 0 0 0-.734 2.74c0 1.89.961 3.558 2.418 4.526A5.428 5.428 0 0 1 .639 9.57v.068c0 2.633 1.868 4.834 4.354 5.327a5.478 5.478 0 0 1-2.425.092c.678 2.108 2.654 3.637 5.003 3.675a10.906 10.906 0 0 1-6.74 2.328c-.438 0-.869-.026-1.296-.077a15.429 15.429 0 0 0 8.314 2.442c9.976 0 15.46-8.271 15.46-15.461 0-.236-.005-.472-.015-.707A11.295 11.295 0 0 0 23 3z" />
                  </svg>
                )}
              </button>
            </a>

            {/* Action Buttons */}
            <div className="flex mt-3 md:mt-0">
              <ConnectWallet accountStatus="address" />
              <Link to="/add-points">
                <button
                  className="btn btn-outline-secondary bg-white py-2 md:py-3 px-3 md:px-4 text-primary w-40 md:w-48 mt-3 xl:mt-0 mr-2 md:mr-3"
                  style={{ color: "black" }}
                >
                  Get Started
                </button>
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col items-center justify-center w-full my-12 md:my-24 px-4">
            <h2 className="text-white font-extrabold text-3xl md:text-5xl my-2 text-center">
              {APP_NAME}
            </h2>
            <p className="text-white font-extrabold text-lg md:text-2xl my-2 text-center max-w-[90%] md:max-w-[60%]">
              This is a solution that rewards users with tokens for recycling
              and helps uphold the SDG goals through a
              <span className="text-[#c54dfc] px-1">blockchain-powered</span>
              recycling solution....
            </p>
            <Link to="/redeem-points">
              <button
                className="btn btn-outline-secondary bg-white py-2 md:py-3 px-3 md:px-4 w-48 md:w-64 mt-3 xl:mt-0"
                style={{ color: "black" }}
              >
                Redeem Points
              </button>
            </Link>
          </div>

          {/* Sponsors Section */}
          <div className="bg-white w-full px-4 md:px-7 rounded-sm py-8 md:py-12">
            <h2 className="text-black font-extrabold text-xl md:text-2xl my-2">
              SPONSORS
            </h2>
            <div className="flex items-center gap-3">
              <img alt={APP_NAME} className="w-24 md:w-32" src={EVM_LOGO} />
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default Home;
