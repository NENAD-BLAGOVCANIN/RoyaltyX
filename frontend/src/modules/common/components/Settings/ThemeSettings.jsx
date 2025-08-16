import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const ThemeSettings = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
        Theme Settings
      </Typography>

      <Typography variant="body1" sx={{color: "text.secondary" }}>
        Choose your preferred theme for the application
      </Typography>

      <FormControl fullWidth sx={{ maxWidth: 300, mt: 5 }}>
        <InputLabel id="theme-select-label">Theme</InputLabel>
        <Select
          labelId="theme-select-label"
          id="theme-select"
          value={theme || "light"}
          label="Theme"
          onChange={handleThemeChange}
          sx={{
            "& .MuiSelect-select": {
              display: "flex",
              alignItems: "center",
              gap: 1,
            },
          }}
        >
          <MenuItem value="light">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Sun size={18} color="#f59e0b" />
              <Typography>Light Theme</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="dark">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Moon size={18} color="#6366f1" />
              <Typography>Dark Theme</Typography>
            </Box>
          </MenuItem>
        </Select>
      </FormControl>

      <Typography
        variant="caption"
        sx={{ mt: 2, display: "block", color: "text.secondary" }}
      >
        The theme will be applied immediately and saved to your preferences.
      </Typography>
    </Box>
  );
};

export default ThemeSettings;
