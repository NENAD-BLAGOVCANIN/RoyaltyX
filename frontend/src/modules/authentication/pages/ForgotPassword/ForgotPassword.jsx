import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { forgotPassword } from "../../api/auth";
import styles from "../Login/Login.module.css";
import icon from "../../../common/assets/img/brand/icon-3.png";
import TextField from "@mui/material/TextField";
import Button from "../../../common/components/Button";
import { Card, Typography, Box } from "@mui/material";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email) {
      setError("Email is required.");
      setLoading(false);
      return;
    }

    const response = await forgotPassword(email);
    
    if (response.success) {
      setEmailSent(true);
      toast.success("Password reset email sent successfully!");
    } else {
      setError(response.message);
    }

    setLoading(false);
  };

  if (emailSent) {
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
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📧</div>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: "success.main" }}>
              Email Sent!
            </Typography>
            <Typography variant="bodyMd" sx={{ mb: 3, color: "text.secondary" }}>
              We've sent a password reset link to <strong>{email}</strong>
            </Typography>
            <Typography variant="bodySm" sx={{ mb: 3, color: "text.secondary" }}>
              Please check your email and click the link to reset your password. 
              The link will expire in 1 hour for security reasons.
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Link to="/login" className="text-decoration-none">
              <Button variant="outline" size="lg">
                Back to Login
              </Button>
            </Link>
          </Box>

          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="bodySm" sx={{ color: "text.secondary" }}>
              Didn't receive the email? Check your spam folder or{" "}
              <button
                type="button"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#1976d2",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                  font: "inherit"
                }}
              >
                try again
              </button>
            </Typography>
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
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔐</div>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
            Forgot Password?
          </Typography>
          <Typography variant="bodyMd" sx={{ color: "text.secondary" }}>
            No worries! Enter your email address and we'll send you a link to reset your password.
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
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="Enter your email address"
              disabled={loading}
            />
          </div>

          <div className="py-2 mt-3">
            <Button variant="primary" size="lg" type="submit" loading={loading}>
              Send Reset Link
            </Button>
          </div>
        </form>

        {/* Back to login link */}
        <div className="d-flex justify-content-center align-items-center py-4">
          <Typography variant="bodyMd" className="px-1 txt-lighter">
            Remember your password?
          </Typography>
          <Link to="/login" className="px-1 fw-500 text-decoration-none">
            <Typography variant="bodyMd" color="primary">
              Back to Login
            </Typography>
          </Link>
        </div>
      </Card>
    </div>
  );
}
