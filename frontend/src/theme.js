import { createTheme } from "@mui/material/styles";
import { colors } from "./constants";

export const getMuiTheme = (mode) => {
  return createTheme({
    palette: {
      mode: mode,
      primary: {
        main: colors[mode].primary,
        lighter: colors[mode].textLighter,
      },
      error: {
        main: colors[mode].danger,
      },
      background: {
        default: colors[mode].bodyBackground,
        paper: colors[mode].paper,
      },
      text: {
        primary: colors[mode].text,
        secondary: colors[mode].textLighter,
      },
    },
    typography: {
      h1: {
        fontSize: "2.5rem",
        fontWeight: 700,
      },
      h2: {
        fontSize: "2rem",
        fontWeight: 600,
      },
      h3: {
        fontSize: "1.75rem",
        fontWeight: 500,
      },
      h4: {
        fontSize: "1.5rem",
        fontWeight: 500,
        lineHeight: 1.8,
      },
      h5: {
        fontSize: "1.25rem",
        fontWeight: 400,
      },
      h6: {
        fontSize: "1rem",
        fontWeight: 400,
      },
    },
    components: {
      MuiTypography: {
        defaultProps: {
          variantMapping: {
            h1: "h1",
            h2: "h2",
            h3: "h3",
            h4: "h4",
            h5: "h5",
            h6: "h6",
            subtitle1: "h2",
            subtitle2: "h2",
            body1: "span",
            body2: "span",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: mode === "dark" ? "0 8px 32px rgba(0, 0, 0, 0.3)" : 3,
            background: mode === "dark" ? "rgba(24, 24, 27, 0.8)" : colors[mode].paper,
            backdropFilter: mode === "dark" ? "blur(10px)" : "none",
            border: mode === "dark" ? "1px solid rgba(70, 70, 73, 0.3)" : "none",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: "8px",
            fontWeight: 500,
          },
          contained: {
            boxShadow: mode === "dark" ? "0 4px 15px rgba(25, 118, 210, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.15)",
            "&:hover": {
              boxShadow: mode === "dark" ? "0 6px 20px rgba(25, 118, 210, 0.4)" : "0 4px 12px rgba(0, 0, 0, 0.2)",
              transform: "translateY(-1px)",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              background: mode === "dark" ? "rgba(31, 31, 35, 0.6)" : "transparent",
              backdropFilter: mode === "dark" ? "blur(5px)" : "none",
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: mode === "dark" ? colors[mode].primary : colors[mode].textLighter,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: colors[mode].primary,
                boxShadow: mode === "dark" ? `0 0 0 0.2rem ${colors[mode].primaryLighter}` : "none",
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            background: mode === "dark" ? "rgba(24, 24, 27, 0.95)" : colors[mode].paper,
            backdropFilter: mode === "dark" ? "blur(15px)" : "none",
            border: mode === "dark" ? "1px solid rgba(70, 70, 73, 0.3)" : "none",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: mode === "dark" ? "rgba(14, 14, 16, 0.95)" : colors[mode].primary,
            backdropFilter: mode === "dark" ? "blur(20px)" : "none",
            borderBottom: mode === "dark" ? "1px solid rgba(70, 70, 73, 0.3)" : "none",
          },
        },
      },
    },
  });
};
