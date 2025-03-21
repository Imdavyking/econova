import ScrollToTop from "@/base-components/scroll-to-top/Main";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Router from "./router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createContext, useContext, useEffect } from "react";
import { APP_NAME, CHARITY_UPDATE, SERVER_URL } from "./utils/constants";
import { io } from "socket.io-client";
import ChatBot from "@/components/chat-bot/Main";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
const AppContext = createContext();

function App() {
  const socket = io(SERVER_URL);

  useEffect(() => {
    document.title = `${APP_NAME} | Blockchain powered AI solution`;

    socket.on(CHARITY_UPDATE, (data) => {
      const { message, shouldToast } = data;
      if (shouldToast) {
        toast.success(message, {
          closeButton: true,
        });
      }
    });

    return () => {
      socket.off(CHARITY_UPDATE);
      socket.disconnect();
      console.log("unmounting");
    };
  }, []);
  return (
    <AppContext.Provider value={{}}>
      <RecoilRoot>
        <ToastContainer />
        <BrowserRouter>
          <ChatBot />
          <DarkModeSwitcher />
          <Router />
          <ScrollToTop />
        </BrowserRouter>
      </RecoilRoot>
    </AppContext.Provider>
  );
}

export const useWallet = () => {
  return useContext(AppContext);
};

export function getFirstAndLast4Chars(str) {
  if (!str) return null;

  if (str.length <= 8) {
    return str; // If the string is too short, return it as is
  }
  return `${str.slice(0, 4)}...${str.slice(-4)}`;
}

export default App;
