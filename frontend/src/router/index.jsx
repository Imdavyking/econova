/** @format */

import { useRoutes } from "react-router-dom";
import RedeemPoints from "../views/redeem-points/Main";
import EarnPoints from "../views/earn-points/Main";
import Home from "../views/home/Main";
import Donate from "../views/donate/Main";
import LeaderBoard from "../views/leaderboard/Main";

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
      path: "/leaderboard",
      element: <LeaderBoard />,
    },
  ];

  return useRoutes(routes);
}

export default Router;
