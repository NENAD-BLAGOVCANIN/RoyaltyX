import Overview from "./pages/Overview";
import Security from "./pages/Security";
import Membership from "./pages/Membership";
import DeleteAccount from "./pages/DeleteAccount";

const accountRoutes = [
  {
    path: "account",
    element: <Overview />,
  },
  {
    path: "account/security",
    element: <Security />,
  },
  {
    path: "account/membership",
    element: <Membership />,
  },
  {
    path: "account/delete",
    element: <DeleteAccount />,
  }
];

export default accountRoutes;
