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

const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      toast.info(
        "MetaMask is not installed. Please install it to use this feature."
      );
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setWalletAddress(address);
  } catch (error) {
    console.error("Error connecting wallet:", error);
  }
};

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  useEffect(() => {
    document.title = `${APP_NAME} | Blockchain powered recycling solution`;
  }, []);
  return (
    <WalletContext.Provider
      value={{ walletAddress, connectWallet, setWalletAddress }}
    >
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
