import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPasswordWithToken } from "../../api/auth";
import styles from "../Login/Login.module.css";
import icon from "../../../common/assets/img/brand/icon-3.png";
import TextField from "@mui/material/TextField";
import Button from "../../../common/components/Button";
import { Card, Typography, Box, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");
    
    if (!emailParam || !tokenParam) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }
    
    setEmail(emailParam);
    setToken(tokenParam);
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { newPassword, confirmPassword } = formData;

    if (!newPassword || !confirmPassword) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const response = await resetPasswordWithToken(email, token, newPassword, confirmPassword);
    
    if (response.success) {
      setResetSuccess(true);
      toast.success("Password reset successfully!");
    } else {
      setError(response.message);
    }

    setLoading(false);
  };

  if (resetSuccess) {
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
          
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: "success.main" }}>
              Password Reset Successfully!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
              Your password has been updated successfully. You can now log in with your new password.
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Link to="/login" className="text-decoration-none">
              <Button variant="primary" size="lg">
                Continue to Login
              </Button>
            </Link>
          </Box>
        </Card>
      </div>
    );
  }

  if (!email || !token) {
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
          
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: "error.main" }}>
              Invalid Reset Link
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
              This password reset link is invalid or has expired. Please request a new password reset.
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Link to="/forgot-password" className="text-decoration-none">
              <Button variant="primary" size="lg">
                Request New Reset
              </Button>
            </Link>
          </Box>

          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Link to="/login" className="text-decoration-none">
              <Typography variant="body2" color="primary">
                Back to Login
              </Typography>
            </Link>
          </Box>
        </Card>
      </div>
    );
  }

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
        
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔑</div>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
            Reset Your Password
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Enter your new password below. Make sure it's strong and secure.
          </Typography>
        </Box>

        {error && (
          <div className="mb-3">
            <span className="text-danger small">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="py-2">
            <TextField
              label="New Password"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="Enter your new password"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="py-2">
            <TextField
              label="Confirm New Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="Confirm your new password"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
              Password requirements:
            </Typography>
            <ul style={{ margin: "8px 0", paddingLeft: "20px", color: "#666", fontSize: "0.875rem" }}>
              <li>At least 8 characters long</li>
              <li>Should contain a mix of letters, numbers, and symbols</li>
            </ul>
          </Box>

          <div className="py-2 mt-3">
            <Button variant="primary" size="lg" type="submit" loading={loading}>
              Reset Password
            </Button>
          </div>
        </form>

        {/* Back to login link */}
        <div className="d-flex justify-content-center align-items-center py-4">
          <Typography variant="body1" className="px-1 txt-lighter">
            Remember your password?
          </Typography>
          <Link to="/login" className="px-1 fw-500 text-decoration-none">
            <Typography variant="body1" color="primary">
              Back to Login
            </Typography>
          </Link>
        </div>
      </Card>
    </div>
  );
}
