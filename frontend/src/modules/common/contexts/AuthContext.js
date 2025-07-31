import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { login } from "../../authentication/api/auth";

const AuthContext = createContext();

// Custom hook for accessing the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider component to wrap your app and provide the auth state
export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [role, setRole] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] = useState("free");

  const [currentlySelectedProjectId, setCurrentlySelectedProjectId] =
    useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to log in
  const handleLogin = async (user) => {
    // Check if this is a new user who should see theme selection
    const isNewUser = localStorage.getItem("newUserThemeSelection") === "true";
    
    // Handle auto-login from registration (don't navigate automatically)
    if (user.auto_login && user.access_token) {
      try {
        const decodedToken = jwtDecode(user.access_token);

        setAuthenticated(true);
        setId(decodedToken.id);
        setEmail(decodedToken.email);
        setName(decodedToken.name);
        setAvatar(decodedToken.avatar);
        setRole(decodedToken.role);
        setSubscriptionPlan(decodedToken.subscription_plan || "free");
        setCurrentlySelectedProjectId(decodedToken.currently_selected_project_id);
        setToken(user.access_token);

        // Don't navigate - let the calling component handle navigation
        return { success: true };
      } catch (error) {
        return { success: false, message: "Invalid token" };
      }
    }
    
    // Handle Google authentication differently
    if (user.google_auth && user.access_token) {
      try {
        const decodedToken = jwtDecode(user.access_token);

        setAuthenticated(true);
        setId(decodedToken.id);
        setEmail(decodedToken.email);
        setName(decodedToken.name);
        setAvatar(decodedToken.avatar);
        setRole(decodedToken.role);
        setSubscriptionPlan(decodedToken.subscription_plan || "free");
        setCurrentlySelectedProjectId(decodedToken.currently_selected_project_id);
        setToken(user.access_token);

        // Check if this is a new user from Google OAuth or from regular registration
        const shouldShowThemeSelection = isNewUser || user.is_new_user;
        
        // Redirect appropriately (flag will be cleared by ThemeSelection component)
        if (shouldShowThemeSelection) {
          navigate("/theme-selection");
        } else {
          navigate("/my-projects");
        }
        return { success: true };
      } catch (error) {
        return { success: false, message: "Invalid token" };
      }
    }

    // Regular email/password login
    const response = await login(user);
    if (response.access) {
      const decodedToken = jwtDecode(response.access);

      setAuthenticated(true);
      setId(decodedToken.id);
      setEmail(decodedToken.email);
      setName(decodedToken.name);
      setAvatar(decodedToken.avatar);
      setRole(decodedToken.role);
      setSubscriptionPlan(decodedToken.subscription_plan || "free");
      setCurrentlySelectedProjectId(decodedToken.currently_selected_project_id);
      setToken(response.access);

      localStorage.setItem("accessToken", response.access);
      
      // Redirect appropriately (flag will be cleared by ThemeSelection component)
      if (isNewUser) {
        navigate("/theme-selection");
      } else {
        navigate("/my-projects");
      }
      return { success: true };
    } else {
      return { success: false, message: response.message || "Login failed" };
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setId("");
    setEmail("");
    setName("");
    setAvatar("");
    setRole("");
    setSubscriptionPlan("free");
    setCurrentlySelectedProjectId(null);
    setToken("");
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  const checkTokenExpiration = (token) => {
    const decodedToken = jwtDecode(token);
    if (decodedToken.exp * 1000 < Date.now()) {
      handleLogout();
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      try {
        checkTokenExpiration(storedToken);
        const decodedToken = jwtDecode(storedToken);

        setAuthenticated(true);
        setToken(storedToken);
        setId(decodedToken.id);
        setEmail(decodedToken.email);
        setName(decodedToken.name);
        setAvatar(decodedToken.avatar);
        setRole(decodedToken.role);
        setSubscriptionPlan(decodedToken.subscription_plan || "free");
        setCurrentlySelectedProjectId(decodedToken.currently_selected_project_id);
      } catch (error) {
        // If token is invalid, clear it
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refresh_token");
      }
    }
    setLoading(false);
  }, []);

  const value = {
    authenticated,
    id,
    email,
    name,
    avatar,
    role,
    subscriptionPlan,
    setSubscriptionPlan,
    currentlySelectedProjectId,
    token,
    login: handleLogin,
    logout: handleLogout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
