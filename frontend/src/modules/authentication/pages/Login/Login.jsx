import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../common/contexts/AuthContext";
import styles from "./Login.module.css";
import icon from "../../../common/assets/img/brand/icon-3.png";
import TextField from "@mui/material/TextField";
import Button from "../../../common/components/Button";
import { Card, Typography, Divider, Box } from "@mui/material";
import { GoogleLoginButton } from "../../components";

export default function Login() {
  const [error, setError] = useState("");
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setEmailVerificationRequired(false);
    setUserEmail("");

    const data = new FormData(e.target);
    const user = Object.fromEntries(data.entries());

    const response = await login(user);
    if (response.success) {
      toast.success("Successfully logged in!");
    } else {
      setError(response.message);
      if (response.email_verification_required) {
        setEmailVerificationRequired(true);
        setUserEmail(response.email || user.email);
      }
    }

    setLoading(false);
  };

  return (
    <div className={styles.loginPageWrapper}>
      {/* Animated background shapes */}
      <div className={styles.backgroundShapes}>
        <div className={`${styles.shape} ${styles.shape1}`}></div>
        <div className={`${styles.shape} ${styles.shape2}`}></div>
        <div className={`${styles.shape} ${styles.shape3}`}></div>
        <div className={`${styles.shape} ${styles.shape4}`}></div>
        <div className={`${styles.shape} ${styles.shape5}`}></div>
      </div>

      <Card 
        style={{ maxWidth: 520 }} 
        sx={{ 
          p: 4, 
          boxShadow: 3,
          width: "100%", 
          zIndex: 10,
          position: "relative",
        }}
      >
        <img
          src={icon}
          style={{ maxWidth: 70 }}
          className="mb-3 mx-auto d-block"
          alt="Brand Icon"
        />
        <Typography variant="h3" sx={{ mb: 5, textAlign: "center", fontWeight: 600 }}>
          Sign in to your account
        </Typography>
        
        {/* Google Login Button */}
        <Box sx={{ mb: 3 }}>
          <GoogleLoginButton disabled={loading} />
        </Box>

        {/* Divider */}
        <Box sx={{ display: "flex", alignItems: "center", my: 3 }}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="body2" sx={{ px: 2, color: "text.secondary" }}>
            or
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>

        {error && (
          <div className="mb-3">
            <span className="text-danger small">{error}</span>
            {emailVerificationRequired && (
              <div className="mt-2">
                <Link 
                  to={`/verify-email${userEmail ? `?email=${encodeURIComponent(userEmail)}` : ''}`}
                  className="text-decoration-none"
                >
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                    Click here to verify your email
                  </Typography>
                </Link>
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="py-2">
            <TextField
              label="Email"
              name="email"
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="Enter your email"
            />
          </div>
          <div className="py-2">
            <TextField
              label="Password"
              name="password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="••••••••"
            />
          </div>

          <div className="py-2 mt-3">
            <Button variant="primary" size="lg" type="submit" loading={loading}>
              Log In
            </Button>
          </div>
        </form>

        {/* Sign up link */}
        <div className="d-flex justify-content-center align-items-center py-4">
          <Typography variant="body1" className="px-1 txt-lighter">
            Don't have an account?
          </Typography>
          <Link to="/register" className="px-1 fw-500 text-decoration-none">
            <Typography variant="body1" color="primary">
              Sign Up
            </Typography>
          </Link>
        </div>
      </Card>
    </div>
  );
}
