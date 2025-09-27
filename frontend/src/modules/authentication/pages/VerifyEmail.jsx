import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Email, CheckCircle } from "@mui/icons-material";
import { verifyEmail, resendVerification } from "../api/auth";
import { useAuth } from "../../common/contexts/AuthContext";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Auto-verify if both email and code are in URL params
  useEffect(() => {
    if (email && code) {
      handleVerification();
    }
  }, []);

  const handleVerification = async () => {
    if (!email) {
      setError("Email address is missing. Please try registering again.");
      return;
    }

    if (!code) {
      setError("Please enter the verification code.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await verifyEmail(email, code);

      if (response.success) {
        setSuccess(true);
        setMessage(response.message);

        // Store tokens and set up authentication state
        if (response.access && response.refresh) {
          // Set flag to indicate this is a new user who should see theme selection
          localStorage.setItem("newUserThemeSelection", "true");
          
          // Store tokens first
          localStorage.setItem("accessToken", response.access);
          localStorage.setItem("refresh_token", response.refresh);
          
          // Use AuthContext login method to properly set authentication state
          const loginResult = await login({
            auto_login: true,
            access_token: response.access,
            is_new_user: true
          });

          if (loginResult.success) {
            // Redirect to theme selection for new users after 2 seconds
            setTimeout(() => {
              navigate("/theme-selection");
            }, 2000);
          } else {
            // Fallback: redirect anyway since tokens are stored
            setTimeout(() => {
              navigate("/theme-selection");
            }, 2000);
          }
        }
      } else {
        setError(response.message || "Verification failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await resendVerification(email);

      if (response.success) {
        setMessage(response.message);
      } else {
        setError(response.message || "Failed to resend verification email.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Card sx={{ maxWidth: 500, width: "100%", mx: 2 }}>
          <CardContent sx={{ textAlign: "center", p: 4 }}>
            <CheckCircle sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom color="success.main">
              Email Verified!
            </Typography>
            <Typography variant="bodyMd" color="text.secondary" mb={3}>
              {message} Redirecting you to theme selection...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Card sx={{ maxWidth: 500, width: "100%", mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={3}>
            <Email sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Verify Your Email
            </Typography>
            <Typography variant="bodyMd" color="text.secondary" mb={1}>
              We've sent a verification code to{" "}
              <Typography
                variant="bodyMd"
                color="primary.main"
                fontWeight="medium"
              >
                {email}
              </Typography>
            </Typography>
            <br />
            <Typography variant="bodySm" color="text.secondary" mt={1}>
              Enter the 6-digit code below to verify your account.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleVerification();
            }}
          >
            <TextField
              fullWidth
              label="Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              inputProps={{ maxLength: 6 }}
              placeholder="Enter 6-digit code"
              autoFocus
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 1, mb: 2 }}
              disabled={loading || !code}
            >
              {loading ? <CircularProgress size={24} /> : "Verify Email"}
            </Button>

            <Box textAlign="center">
              <Typography variant="bodySm" color="text.secondary" mb={1}>
                Didn't receive the code?
              </Typography>
              <Button
                variant="text"
                onClick={handleResendVerification}
                disabled={loading}
              >
                Resend Verification Email
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VerifyEmail;
