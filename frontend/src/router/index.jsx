/** @format */

import { useRoutes } from "react-router-dom";
import RedeemPoints from "../views/redeem-points/Main";
import EarnPoints from "../views/earn-points/Main";
import Home from "../views/home/Main";
import Donate from "../views/donate/Main";
import DonationCategories from "../views/donate/Categories";
import LeaderBoard from "../views/leaderboard/Main";
import BMICalculator from "../views/bmi-calculator/Main";

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
      path: "/bmi-calculator",
      element: <BMICalculator />,
    },
  ];

  return useRoutes(routes);
}

export default Router;
