import ScrollToTop from "@/base-components/scroll-to-top/Main";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Router from "./router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ethers } from "ethers";
import { createContext, useContext, useEffect, useState } from "react";
import { APP_NAME } from "./utils/constants";

const WalletContext = createContext();

function App() {
  useEffect(() => {
    document.title = `${APP_NAME} | Blockchain powered AI solution`;
  }, []);
  return (
    <WalletContext.Provider value={{}}>
      <RecoilRoot>
        <ToastContainer />
        <BrowserRouter>
          <Router />
          <ScrollToTop />
        </BrowserRouter>
      </RecoilRoot>
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  return useContext(WalletContext);
};

export function getFirstAndLast4Chars(str) {
  if (!str) return null;

  if (str.length <= 8) {
    return str; // If the string is too short, return it as is
  }
  return `${str.slice(0, 4)}...${str.slice(-4)}`;
}

export default App;
