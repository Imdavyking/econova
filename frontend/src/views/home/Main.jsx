/** @format */

import React, { useEffect, useState } from "react";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import ChatBot from "@/components/chat-bot/Main";
import { Link } from "react-router-dom";
import Footer from "@/base-components/footer";
import logoUrl from "@/assets/images/logo.png";
import EVM_LOGO from "@/assets/images/sonic_s.svg";
import { APP_NAME, SERVER_URL_TWITTER_LOGIN } from "../../utils/constants";
import ConnectWallet from "../../components/ConnectWallet";
import {
  getUserTwitterInfo,
  userLogout,
} from "../../services/user.twitter.services";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { FaUserCircle, FaCrown, FaCoins } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { saveTwitterAuth } from "../../services/twitter.auth.services";
import { wrapSonicService } from "../../services/blockchain.services";

const Home = () => {
  const [twitterHandle, setTwitterHandle] = useState("");
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const handleLogout = () => {
    console.log("User logged out");
    setTwitterHandle("");
    setShowLogoutPopup(false);
    userLogout();
  };

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = location.hash.replace("#", "");

    if (authToken) {
      saveTwitterAuth(authToken);
      window.history.replaceState(null, "", window.location.pathname);
    }
    getUserTwitterInfo()
      .then((data) => {
        setTwitterHandle(data.screen_name);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [location, navigate]);

  useEffect(() => {
    dom("body").removeClass("error-page").removeClass("login").addClass("main");
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

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 mt-3 md:mt-0">
              <ConnectWallet accountStatus="address" />
              <Menu as="div" className="relative">
                <MenuButton className="focus:outline-none">
                  <FaUserCircle className="text-white text-2xl cursor-pointer" />
                </MenuButton>
                <MenuItems className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2">
                  {twitterHandle ? (
                    <MenuItem>
                      {({ isactive }) => (
                        <button
                          onClick={() => setShowLogoutPopup(true)}
                          className={`block px-4 py-2 text-gray-700 w-full text-left ${
                            isactive ? "bg-gray-200" : ""
                          }`}
                        >
                          Logout ({twitterHandle})
                        </button>
                      )}
                    </MenuItem>
                  ) : (
                    <MenuItem>
                      {({ isactive }) => (
                        <a
                          href={SERVER_URL_TWITTER_LOGIN}
                          className={`block px-4 py-2 text-gray-700 ${
                            isactive ? "bg-gray-200" : ""
                          }`}
                        >
                          Login with Twitter
                        </a>
                      )}
                    </MenuItem>
                  )}

                  {twitterHandle ? (
                    <MenuItem>
                      {({ isactive }) => (
                        <Link
                          to="/earn-points"
                          className={`flex items-center  px-4 py-2 text-gray-700 w-full text-left ${
                            isactive ? "bg-gray-200" : ""
                          }`}
                        >
                          Earn Points
                          <FaCoins
                            className="ml-2 text-xl cursor-pointer"
                            style={{ color: "gold" }}
                          />
                        </Link>
                      )}
                    </MenuItem>
                  ) : (
                    <></>
                  )}
                  <MenuItem>
                    {({ isactive }) => (
                      <Link
                        to="/leaderboard"
                        className={`flex items-center px-4 py-2 text-gray-700 w-full text-left ${
                          isactive ? "bg-gray-200" : ""
                        }`}
                      >
                        Leaderboard
                        <FaCrown
                          className="ml-2 text-xl cursor-pointer"
                          style={{ color: "gold" }}
                        />
                      </Link>
                    )}
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col items-center justify-center w-full my-12 md:my-24 px-4">
            <h2 className="text-white font-extrabold text-3xl md:text-5xl my-2 text-center">
              {APP_NAME}
            </h2>
            <p className="text-white font-extrabold text-lg md:text-2xl my-2 text-center max-w-[90%] md:max-w-[60%]">
              A decentralized platform leveraging blockchain, AI, and ZKPs for
              private health verification, automated donations, AI tutoring, and
              cross-chain transactions, ensuring trustless, efficient charitable
              giving with privacy and security.
              <span className="text-[#c54dfc] px-1">
                and connects with Twitter
              </span>
              for updates.
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

          {showLogoutPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center text-black">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <h3 className="text-lg font-semibold">Logout</h3>
                <p className="my-4">Are you sure you want to log out?</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowLogoutPopup(false)}
                    className="bg-gray-300 px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          <Footer />
        </div>
      </div>
    </>
  );
};

export default Home;
