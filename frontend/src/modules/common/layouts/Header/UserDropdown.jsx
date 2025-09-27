import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  Box,
  ClickAwayListener,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { LogOut, Folder, User, Grid, HelpCircle, Flame } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

function UserDropdown() {
  const { name, email, avatar, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Box sx={{ position: "relative" }}>
      <ClickAwayListener onClickAway={handleClose}>
        <Box>
          <IconButton onClick={handleToggle} size="small" sx={{ p: 0 }}>
            <Avatar
              src={avatar}
              alt="Profile"
              sx={{
                width: 23,
                height: 23,
                cursor: "pointer",
              }}
            />
          </IconButton>

          {isOpen && (
            <Paper
              elevation={3}
              sx={{
                position: "absolute",
                top: "100%",
                right: 0,
                width: 290,
                mt: 1,
                borderRadius: 2,
                zIndex: 1300,
                backgroundColor: "background.paper",
              }}
            >
              {/* User Info Header */}
              <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
                <Avatar
                  src={avatar}
                  alt="Profile"
                  sx={{ width: 30, height: 30 }}
                />
                <Box sx={{ ml: 1.5, display: "flex", flexDirection: "column" }}>
                  <Typography
                    variant="bodySm"
                    sx={{
                      color: "text.primary",
                    }}
                  >
                    {name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {email}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Menu Items */}
              <List sx={{ py: 1 }}>
                {role === "admin" && (
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      to="/admin/dashboard"
                      onClick={handleClose}
                      sx={{
                        borderRadius: 1,
                        mx: 1,
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Grid size={18} color="var(--color-text-lighter)" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Admin Panel"
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
                    to="/account"
                    onClick={handleClose}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <User size={18} color="var(--color-text-lighter)" />
                    </ListItemIcon>
                    <ListItemText
                      primary="My Account"
                      primaryTypographyProps={{
                        variant: "bodySm",
                      }}
                    />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    to="/my-projects"
                    onClick={handleClose}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Folder size={18} color="var(--color-text-lighter)" />
                    </ListItemIcon>
                    <ListItemText
                      primary="My Projects"
                      primaryTypographyProps={{
                        variant: "bodySm",
                      }}
                    />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    to="/support"
                    onClick={handleClose}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <HelpCircle size={18} color="var(--color-text-lighter)" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Contact Support"
                      primaryTypographyProps={{
                        variant: "bodySm",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    to="/account/membership"
                    onClick={handleClose}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Flame size={18} color="var(--color-text-lighter)" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Explore Premium"
                      primaryTypographyProps={{
                        variant: "bodySm",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>

              <Divider />

              {/* Logout */}
              <List sx={{ py: 1 }}>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    to="/logout"
                    onClick={handleClose}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <LogOut size={18} color="#dc3545" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Logout"
                      primaryTypographyProps={{
                        variant: "bodySm",
                        color: "#dc3545",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Paper>
          )}
        </Box>
      </ClickAwayListener>
    </Box>
  );
}

export default UserDropdown;
