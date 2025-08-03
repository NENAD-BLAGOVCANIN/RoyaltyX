import Login from "./pages/Login/Login";
import Logout from "./pages/Logout";
import Register from "./pages/Register/Register";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import ThemeSelection from "./pages/ThemeSelection/ThemeSelection";
import VerifyEmail from "./pages/VerifyEmail";

const authRoutes = [
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "register",
    element: <Register />,
  },
  {
    path: "verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "reset-password",
    element: <ResetPassword />,
  },
  {
    path: "logout",
    element: <Logout />,
  },
  {
    path: "theme-selection",
    element: <ThemeSelection />,
  },
];

export default authRoutes;
