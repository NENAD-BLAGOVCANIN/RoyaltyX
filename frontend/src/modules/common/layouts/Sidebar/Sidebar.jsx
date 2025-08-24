import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Gauge,
  FileText,
  Database,
  Package2,
  LayoutDashboard,
  Users,
  Settings,
  Receipt,
} from "lucide-react";
import { UpgradePlanButton } from "../../components/UpgradePlanButton";
import { ProjectSelector } from "../../../global/components/ProjectSelector";
import SidebarProductList from "../../components/SidebarProductList";

const SIDEBAR_WIDTH = 242;

function Sidebar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 855) {
        setSidebarOpen(false);
        document.documentElement.style.setProperty("--sidebar-width", "0");
      } else {
        setSidebarOpen(true);
        document.documentElement.style.setProperty(
          "--sidebar-width",
          `${SIDEBAR_WIDTH}px`
        );
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (!sidebarOpen) {
      document.documentElement.style.setProperty(
        "--sidebar-width",
        `${SIDEBAR_WIDTH}px`
      );
    } else {
      document.documentElement.style.setProperty("--sidebar-width", "0");
    }
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  const SidebarContent = () => (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <ProjectSelector />
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          overflowX: "hidden",
        }}
      >
        <List
          sx={{
            px: 2,
            width: "100%",
            boxSizing: "border-box",
          }}
        >

          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              px: 2,
              pt: 2,
              pb: 1,
              display: "block",
            }}
          >
            Project
          </Typography>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/"
              selected={isActivePage("/")}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  backgroundColor: "action.selected",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LayoutDashboard size={18} color="var(--color-text-lighter)" />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                primaryTypographyProps={{
                  variant: "body2",
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/sources"
              selected={isActivePage("/sources")}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  backgroundColor: "action.selected",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Database size={18} color="var(--color-text-lighter)" />
              </ListItemIcon>
              <ListItemText
                primary="Sources"
                primaryTypographyProps={{
                  variant: "body2",
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/members"
              selected={isActivePage("/members")}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  backgroundColor: "action.selected",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Users size={18} color="var(--color-text-lighter)" />
              </ListItemIcon>
              <ListItemText
                primary="Members"
                primaryTypographyProps={{
                  variant: "body2",
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/products"
              selected={isActivePage("/products")}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  backgroundColor: "action.selected",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Package2 size={18} color="var(--color-text-lighter)" />
              </ListItemIcon>
              <ListItemText
                primary="Products"
                primaryTypographyProps={{
                  variant: "body2",
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/analytics"
              selected={isActivePage("/analytics")}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  backgroundColor: "action.selected",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Gauge size={18} color="var(--color-text-lighter)" />
              </ListItemIcon>
              <ListItemText
                primary="Analytics"
                primaryTypographyProps={{
                  variant: "body2",
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/reports"
              selected={isActivePage("/reports")}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  backgroundColor: "action.selected",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <FileText size={18} color="var(--color-text-lighter)" />
              </ListItemIcon>
              <ListItemText
                primary="Reports"
                primaryTypographyProps={{
                  variant: "body2",
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/expenses"
              selected={isActivePage("/expenses")}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  backgroundColor: "action.selected",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Receipt size={18} color="var(--color-text-lighter)" />
              </ListItemIcon>
              <ListItemText
                primary="Expenses"
                primaryTypographyProps={{
                  variant: "body2",
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/settings"
              selected={isActivePage("/settings")}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  backgroundColor: "action.selected",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Settings size={18} color="var(--color-text-lighter)" />
              </ListItemIcon>
              <ListItemText
                primary="Settings"
                primaryTypographyProps={{
                  variant: "body2",
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <UpgradePlanButton />
          </ListItem>
        </List>
        
        <SidebarProductList />
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={toggleSidebar}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: SIDEBAR_WIDTH,
            pb: 0,
            backgroundColor: theme.palette.background.default,
          },
        }}
      >
        <SidebarContent />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={sidebarOpen}
      sx={{
        width: sidebarOpen ? SIDEBAR_WIDTH : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: SIDEBAR_WIDTH,
          minWidth: SIDEBAR_WIDTH,
          maxWidth: SIDEBAR_WIDTH,
          boxSizing: "border-box",
          backgroundColor: theme.palette.background.default,
          overflow: "hidden",
          overflowY: "auto",
        },
      }}
    >
      <SidebarContent />
    </Drawer>
  );
}

export default Sidebar;
