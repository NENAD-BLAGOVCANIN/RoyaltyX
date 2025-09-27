import { createTheme } from "@mui/material/styles";
import { TYPOGRAPHY } from "./modules/common/styles/typography";
import { THEME } from "./modules/common/styles/theme";

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: THEME[mode].primary,
      },
      background: {
        default: THEME[mode].page,
      },
      divider: THEME[mode].border.primary,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14,
      h1: {
        ...TYPOGRAPHY.H1,
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      },
      h2: {
        ...TYPOGRAPHY.H2,
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      },
      h3: {
        ...TYPOGRAPHY.H3,
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      },
      h4: {
        ...TYPOGRAPHY.H4,
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      },
      bodyLg: {
        ...TYPOGRAPHY.bodyLg,
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      },
      bodyMd: {
        ...TYPOGRAPHY.bodyMd,
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      },
      bodySm: {
        ...TYPOGRAPHY.bodySm,
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "4px",
            padding: "10px 16px",
            textTransform: "none",
            "&.MuiButton-containedPrimary": {
              boxShadow: "none",
              "&:hover": {
                boxShadow: "none",
              },
              "&:active": {
                boxShadow: "none",
              },
              "&:focus": {
                boxShadow: "none",
              },
            },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            borderRadius: "4px",
            padding: "10px 16px",
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            fontSize: "14px",
          },
          secondary: {
            fontSize: "12px",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderColor: mode === "light" ? "#e8e8e8" : "#303030",
            borderWidth: "1px",
            borderStyle: "solid",
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: THEME[mode].pageSecondary,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: THEME[mode].pageSecondary,
          },
          root: {
            borderLeft: "none",
            borderRight: "none",
            borderBottom: `1px solid ${THEME[mode].border.primary}`,
            borderTop: "none",
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            "& .MuiTableRow-root": {
              "& .MuiTableCell-root:first-of-type": {
                borderLeft: "none",
              },
              "& .MuiTableCell-root:last-of-type": {
                borderRight: "none",
              },
            },
            "& .MuiTableHead-root .MuiTableRow-root": {
              borderTop: "none",
            },
            "& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root":
              {
                borderBottom: "none",
              },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: "8px",
            boxShadow:
              mode === "light"
                ? "0px 4px 20px rgba(0, 0, 0, 0.08)"
                : "0px 4px 20px rgba(0, 0, 0, 0.3)",
            border: `1px solid ${mode === "light" ? "#e8e8e8" : "#303030"}`,
            minWidth: "200px",
            padding: "0",
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: 400,
            minHeight: "auto",
            "&:hover": {
              backgroundColor: mode === "light" ? "#f5f5f5" : "#2a2a2a",
            },
            "& .MuiListItemIcon-root": {
              minWidth: "32px",
              color: mode === "light" ? "#666" : "#ccc",
            },
            "& .MuiSvgIcon-root": {
              fontSize: "18px",
            },
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            borderRadius: "8px",
            boxShadow:
              mode === "light"
                ? "0px 4px 20px rgba(0, 0, 0, 0.08)"
                : "0px 4px 20px rgba(0, 0, 0, 0.3)",
            border: `1px solid ${mode === "light" ? "#e8e8e8" : "#303030"}`,
          },
        },
      },
    },
  });

export default getTheme;
