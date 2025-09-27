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
  useTheme as useMuiTheme,
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
  Landmark,
} from "lucide-react";
import { UpgradePlanButton } from "../../components/UpgradePlanButton";
import { ProjectSelector } from "../../../global/components/ProjectSelector";
import SidebarProductList from "../../components/SidebarProductList";
import { useProject } from "../../contexts/ProjectContext";
import { useTheme } from "../../contexts/ThemeContext";

const SIDEBAR_WIDTH = 275;

function Sidebar() {
  const { colors } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const location = useLocation();
  const { project, currentUserRole } = useProject();

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Check if Members menu should be shown
  const shouldShowMembersMenu = () => {
    // Always show for owners
    if (currentUserRole === "owner") return true;

    // For non-owners, show only if members_can_see_other_members is true (default)
    return project?.members_can_see_other_members !== false;
  };

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
                <LayoutDashboard size={18} />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                primaryTypographyProps={{
                  variant: "bodySm",
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
                <Database size={18} />
              </ListItemIcon>
              <ListItemText
                primary="Sources"
                primaryTypographyProps={{
                  variant: "bodySm",
                }}
              />
            </ListItemButton>
          </ListItem>

          {shouldShowMembersMenu() && (
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
                  <Users size={18} />
                </ListItemIcon>
                <ListItemText
                  primary="Members"
                  primaryTypographyProps={{
                    variant: "bodySm",
                  }}
                />
              </ListItemButton>
            </ListItem>
          )}

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
                <Package2 size={18} />
              </ListItemIcon>
              <ListItemText
                primary="Products"
                primaryTypographyProps={{
                  variant: "bodySm",
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
                <Gauge size={18} />
              </ListItemIcon>
              <ListItemText
                primary="Analytics"
                primaryTypographyProps={{
                  variant: "bodySm",
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
                <FileText size={18} />
              </ListItemIcon>
              <ListItemText
                primary="Reports"
                primaryTypographyProps={{
                  variant: "bodySm",
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
                <Landmark size={18} />
              </ListItemIcon>
              <ListItemText
                primary="Expenses"
                primaryTypographyProps={{
                  variant: "bodySm",
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
                <Settings size={18} />
              </ListItemIcon>
              <ListItemText
                primary="Settings"
                primaryTypographyProps={{
                  variant: "bodySm",
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
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: SIDEBAR_WIDTH,
            backgroundColor: colors.pageSecondary,
            border: "none",
            borderRight: "none",
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
          overflow: "hidden",
          overflowY: "auto",
          backgroundColor: colors.pageSecondary,
          border: "none",
          borderRight: "none",
        },
      }}
    >
      <SidebarContent />
    </Drawer>
  );
}

export default Sidebar;
