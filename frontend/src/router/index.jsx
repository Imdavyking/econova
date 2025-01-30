/** @format */

import { useRoutes, Navigate } from "react-router-dom";
import RedeemPoints from "../views/redeem-points/Main";
import AddPoint from "../views/add-points/Main";
import Home from "../views/home/Main";
import Donate from "../views/donate/Main";
// import Dashboard from "../views/dashboard/Main";

// import Settings from "../views/settings/Main";

function Router() {
  const routes = [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/add-points",
      element: <AddPoint />,
    },
    {
      path: "/redeem-points",
      element: <RedeemPoints />,
    },
    {
      path: "/donate",
      element: <Donate />,
    },
  ];

  return useRoutes(routes);
}

export default Router;
