import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Card,
  Typography,
  Box,
  Paper,
  IconButton,
  Stack,
  Fade,
  Zoom,
} from "@mui/material";
import { LightMode, DarkMode, CheckCircle } from "@mui/icons-material";
import { useTheme } from "../../../common/contexts/ThemeContext";
import { useAuth } from "../../../common/contexts/AuthContext";
import Button from "../../../common/components/Button";
import icon from "../../../common/assets/img/brand/icon-3.png";
import styles from "./ThemeSelection.module.css";

export default function ThemeSelection() {
  const [selectedTheme, setSelectedTheme] = useState("light");
  const [loading, setLoading] = useState(false);
  const { setTheme } = useTheme();
  const { authenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authenticated) {
      navigate("/login");
    }
  }, [authenticated, navigate]);

  const handleThemeSelect = (themeMode) => {
    setSelectedTheme(themeMode);
  };

  const handleContinue = async () => {
    setLoading(true);

    try {
      setTheme(selectedTheme);
      // Clear the new user flag since they've completed theme selection
      localStorage.removeItem("newUserThemeSelection");
      navigate("/my-projects");
    } catch (error) {
      toast.error("Failed to apply theme. Please try again.");
    }

    setLoading(false);
  };

  const handleSkip = () => {
    // Clear the new user flag even if they skip theme selection
    localStorage.removeItem("newUserThemeSelection");
    navigate("/my-projects");
  };

  return (
    <div className={styles.themeSelectionWrapper}>
      {/* Animated background shapes */}
      <div className={styles.backgroundShapes}>
        <div className={`${styles.shape} ${styles.shape1}`}></div>
        <div className={`${styles.shape} ${styles.shape2}`}></div>
        <div className={`${styles.shape} ${styles.shape3}`}></div>
        <div className={`${styles.shape} ${styles.shape4}`}></div>
        <div className={`${styles.shape} ${styles.shape5}`}></div>
      </div>

      <Card
        style={{ maxWidth: 600 }}
        sx={{
          p: 5,
          boxShadow: 3,
          width: "100%",
          zIndex: 10,
          position: "relative",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <img
            src={icon}
            style={{ maxWidth: 70 }}
            className="mb-3 mx-auto d-block"
            alt="Brand Icon"
          />

          <Fade in timeout={800}>
            <Box>
              <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
                Choose Your Theme
              </Typography>
              <Typography
                variant="bodyMd"
                sx={{ color: "text.secondary", mb: 4 }}
              >
                Personalize your experience by selecting your preferred theme.
                You can always change this later in settings.
              </Typography>
            </Box>
          </Fade>
        </Box>

        {/* Theme Options */}
        <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
          {/* Light Theme Option */}
          <Zoom in timeout={600}>
            <Paper
              elevation={selectedTheme === "light" ? 8 : 2}
              sx={{
                flex: 1,
                p: 3,
                cursor: "pointer",
                border: selectedTheme === "light" ? 2 : 1,
                borderColor:
                  selectedTheme === "light" ? "primary.main" : "divider",
                transition: "all 0.3s ease",
                position: "relative",
                "&:hover": {
                  elevation: 6,
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => handleThemeSelect("light")}
            >
              {selectedTheme === "light" && (
                <CheckCircle
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    color: "primary.main",
                    fontSize: 24,
                  }}
                />
              )}

              <Box sx={{ textAlign: "center" }}>
                <IconButton
                  sx={{
                    mb: 2,
                    bgcolor: "rgba(255, 193, 7, 0.1)",
                    color: "#FFC107",
                    width: 64,
                    height: 64,
                    "&:hover": {
                      bgcolor: "rgba(255, 193, 7, 0.2)",
                    },
                  }}
                >
                  <LightMode sx={{ fontSize: 32 }} />
                </IconButton>

                <Typography variant="h5" sx={{ mb: 1, fontWeight: 500 }}>
                  Light Theme
                </Typography>
                <Typography variant="bodySm" sx={{ color: "text.secondary" }}>
                  Clean and bright interface perfect for daytime use
                </Typography>
              </Box>

              {/* Preview mockup */}
              <Box
                sx={{
                  mt: 3,
                  height: 80,
                  bgcolor: "#f5f5f5",
                  borderRadius: 1,
                  border: "1px solid #e0e0e0",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: 20,
                    bgcolor: "#fff",
                    borderBottom: "1px solid #e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    px: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      bgcolor: "#1976d2",
                      borderRadius: "50%",
                      mr: 0.5,
                    }}
                  />
                  <Box
                    sx={{
                      width: 40,
                      height: 4,
                      bgcolor: "#e0e0e0",
                      borderRadius: 1,
                    }}
                  />
                </Box>
                <Box sx={{ p: 1 }}>
                  <Box
                    sx={{
                      width: "60%",
                      height: 6,
                      bgcolor: "#333",
                      borderRadius: 1,
                      mb: 0.5,
                    }}
                  />
                  <Box
                    sx={{
                      width: "40%",
                      height: 4,
                      bgcolor: "#666",
                      borderRadius: 1,
                      mb: 0.5,
                    }}
                  />
                  <Box
                    sx={{
                      width: "80%",
                      height: 4,
                      bgcolor: "#999",
                      borderRadius: 1,
                    }}
                  />
                </Box>
              </Box>
            </Paper>
          </Zoom>

          {/* Dark Theme Option */}
          <Zoom in timeout={800}>
            <Paper
              elevation={selectedTheme === "dark" ? 8 : 2}
              sx={{
                flex: 1,
                p: 3,
                cursor: "pointer",
                border: selectedTheme === "dark" ? 2 : 1,
                borderColor:
                  selectedTheme === "dark" ? "primary.main" : "divider",
                transition: "all 0.3s ease",
                position: "relative",
                "&:hover": {
                  elevation: 6,
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => handleThemeSelect("dark")}
            >
              {selectedTheme === "dark" && (
                <CheckCircle
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    color: "primary.main",
                    fontSize: 24,
                  }}
                />
              )}

              <Box sx={{ textAlign: "center" }}>
                <IconButton
                  sx={{
                    mb: 2,
                    bgcolor: "rgba(121, 85, 72, 0.1)",
                    color: "#795548",
                    width: 64,
                    height: 64,
                    "&:hover": {
                      bgcolor: "rgba(121, 85, 72, 0.2)",
                    },
                  }}
                >
                  <DarkMode sx={{ fontSize: 32 }} />
                </IconButton>

                <Typography variant="h5" sx={{ mb: 1, fontWeight: 500 }}>
                  Dark Theme
                </Typography>
                <Typography variant="bodySm" sx={{ color: "text.secondary" }}>
                  Easy on the eyes with reduced strain for extended use
                </Typography>
              </Box>

              {/* Preview mockup */}
              <Box
                sx={{
                  mt: 3,
                  height: 80,
                  bgcolor: "#1e1e1e",
                  borderRadius: 1,
                  border: "1px solid #333",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: 20,
                    bgcolor: "#2d2d2d",
                    borderBottom: "1px solid #333",
                    display: "flex",
                    alignItems: "center",
                    px: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      bgcolor: "#1976d2",
                      borderRadius: "50%",
                      mr: 0.5,
                    }}
                  />
                  <Box
                    sx={{
                      width: 40,
                      height: 4,
                      bgcolor: "#555",
                      borderRadius: 1,
                    }}
                  />
                </Box>
                <Box sx={{ p: 1 }}>
                  <Box
                    sx={{
                      width: "60%",
                      height: 6,
                      bgcolor: "#fff",
                      borderRadius: 1,
                      mb: 0.5,
                    }}
                  />
                  <Box
                    sx={{
                      width: "40%",
                      height: 4,
                      bgcolor: "#ccc",
                      borderRadius: 1,
                      mb: 0.5,
                    }}
                  />
                  <Box
                    sx={{
                      width: "80%",
                      height: 4,
                      bgcolor: "#999",
                      borderRadius: 1,
                    }}
                  />
                </Box>
              </Box>
            </Paper>
          </Zoom>
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button
            variant="outlined"
            size="lg"
            onClick={handleSkip}
            disabled={loading}
            sx={{ flex: 1 }}
          >
            Skip for Now
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleContinue}
            loading={loading}
            sx={{ flex: 1 }}
          >
            Continue
          </Button>
        </Stack>

        {/* Additional Info */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="bodySm" sx={{ color: "text.secondary" }}>
            💡 You can change your theme preference anytime in your account
            settings
          </Typography>
        </Box>
      </Card>
    </div>
  );
}
