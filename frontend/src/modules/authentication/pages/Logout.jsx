import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../common/contexts/AuthContext";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  return null;
};

export default Logout;
