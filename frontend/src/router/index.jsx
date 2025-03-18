/** @format */

import { useRoutes } from "react-router-dom";
import RedeemPoints from "../views/redeem-points/Main";
import EarnPoints from "../views/earn-points/Main";
import Home from "../views/home/Main";
import Donate from "../views/donate/Main";
import DonationCategories from "../views/donate/Categories";
import LeaderBoard from "../views/leaderboard/Main";
import AIHealth from "../views/ai-health/Main";
import AITutor from "../views/ai-tutor/Main";
import AiAudit from "../views/ai-audit/Main";
import AiPortfolioManager from "../views/ai-portfolio-manager/Main";
import Bridge from "../views/bridge/Main";
import Dao from "../views/dao/Main";
import CreateProposal from "../views/dao/create-proposal";
import NotFound from "../views/not-found/Main";
import AiTxAnalysis from "../views/ai-tx-analysis/Main";
import AITutorQuiz from "../views/ai-tutor/quiz";
import TermsAndCondition from "../views/terms-and-condition/Main";
import { io } from "socket.io-client";
import { SERVER_URL } from "../utils/constants";
import { toast } from "react-toastify";
function Router() {
  const socket = io(SERVER_URL);

  socket.on("charity:update", (data) => {
    const { message, shouldToast } = data;
    if (shouldToast) {
      toast.success(message, {
        closeButton: true,
      });
    } else {
      console.log(message);
    }
  });
  const routes = [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/earn-points",
      element: <EarnPoints />,
    },
    {
      path: "/redeem-points",
      element: <RedeemPoints />,
    },
    {
      path: "/donate",
      element: <Donate />,
    },
    {
      path: "/donate-categories",
      element: <DonationCategories />,
    },
    {
      path: "/leaderboard",
      element: <LeaderBoard />,
    },
    {
      path: "/ai-health",
      element: <AIHealth />,
    },
    {
      path: "/ai-tutor",
      element: <AITutor />,
    },

    {
      path: "/ai-tutor/quiz/:levelStr",
      element: <AITutorQuiz />,
    },
    {
      path: "/bridge",
      element: <Bridge />,
    },
    {
      path: "/ai-audit",
      element: <AiAudit />,
    },
    {
      path: "/ai-portfolio-manager",
      element: <AiPortfolioManager />,
    },
    {
      path: "/tx-analysis",
      element: <AiTxAnalysis />,
    },
    {
      path: "/terms-and-conditions",
      element: <TermsAndCondition />,
    },
    {
      path: "/dao",
      element: <Dao />,
    },
    {
      path: "/dao/create-proposal",
      element: <CreateProposal />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ];

  return useRoutes(routes);
}

export default Router;
