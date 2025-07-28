import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Avatar,
  AvatarGroup,
  Tooltip,
} from "@mui/material";
import { Settings } from "lucide-react";
import UserDropdown from "./UserDropdown";
import SettingsModal from "../../components/Settings/SettingsModal";
import NotificationsDropdown from "./NotificationsDropdown";
import Breadcrumbs from "../../components/Breadcrumbs";
import { useProject } from "../../contexts/ProjectContext";

function Header() {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { project } = useProject();

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "background.default",
          borderBottom: "1px solid",
          borderColor: "divider",
          color: "text.primary",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 4 }, py: 1, height: 66.77 }}>
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            <Breadcrumbs />
          </Box>

          {project?.users && project.users.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", mr: 4 }}>
              <AvatarGroup
                max={5}
                sx={{
                  "& .MuiAvatar-root": {
                    width: 23,
                    height: 23,
                    fontSize: "0.875rem",
                    border: "2px solid",
                    borderColor: "divider",
                  },
                }}
              >
                {project.users.map((user) => (
                  <Tooltip
                    key={user.id}
                    title={`${user?.user_details?.name || "Unknown"} (${user?.role || "Member"})`}
                    arrow
                  >
                    <Avatar
                      src={user?.user_details?.avatar}
                      sx={{
                        cursor: "pointer",
                      }}
                    />
                  </Tooltip>
                ))}
              </AvatarGroup>
            </Box>
          )}

          {/* Right side - Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Settings Icon */}
            <IconButton
              onClick={() => setShowSettingsModal(true)}
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <Settings size={20} strokeWidth={1.5} />
            </IconButton>

            <NotificationsDropdown />
            <UserDropdown />
          </Box>
        </Toolbar>
      </AppBar>

      <SettingsModal
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
      />
    </>
  );
}

export default Header;
