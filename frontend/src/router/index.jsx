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
import AiInvestment from "../views/ai-investment/Main";
import Bridge from "../views/bridge/Main";
import NotFound from "../views/not-found/Main";
import AiTxAnalysis from "../views/ai-tx-analysis/Main";
import AITutorQuiz from "../views/ai-tutor/quiz";

function Router() {
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
      path: "/ai-investment",
      element: <AiInvestment />,
    },
    {
      path: "/ai-tx-analysis",
      element: <AiTxAnalysis />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ];

  return useRoutes(routes);
}

export default Router;
