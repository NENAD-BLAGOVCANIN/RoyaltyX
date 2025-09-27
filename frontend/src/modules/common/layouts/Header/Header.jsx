import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Avatar,
  AvatarGroup,
  Tooltip,
  Container,
} from "@mui/material";
import { Settings } from "lucide-react";
import UserDropdown from "./UserDropdown";
import SettingsModal from "../../components/Settings/SettingsModal";
import NotificationsDropdown from "./NotificationsDropdown";
import { useProject } from "../../contexts/ProjectContext";
import SearchBar from "./SearchBar";

function Header() {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { project, currentUserRole } = useProject();

  // Check if current user can see other members
  const canSeeOtherMembers = () => {
    if (currentUserRole === "owner") return true;
    return project?.members_can_see_other_members ?? true;
  };

  // Filter users based on visibility settings
  const getVisibleUsers = () => {
    if (!project?.users) return [];

    if (canSeeOtherMembers()) {
      return project.users;
    } else {
      // Only show current user
      const currentUser = JSON.parse(localStorage.getItem("user"));
      return project.users.filter(
        (user) => user.user_details.id === currentUser?.id
      );
    }
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "background.default",
          borderBottom: "1px solid",
          borderLeft: "none",
          borderColor: "divider",
          color: "text.primary",
        }}
      >
        <Container
          sx={{
            px: { xs: 2, sm: 4, md: 8 },
            maxWidth: "none !important",
          }}
        >
          <Toolbar
            sx={{
              py: 1,
              height: 66.77,
              display: "flex",
              justifyContent: "space-between",
            }}
            style={{ paddingLeft: 0, paddingRight: 0 }}
          >
            <Box
              sx={{
                flexGrow: 1,
                maxWidth: 400,
                display: { xs: "none", sm: "block" },
              }}
            >
              <SearchBar placeholder="Search" />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              {(() => {
                const visibleUsers = getVisibleUsers();
                return (
                  visibleUsers.length > 0 && (
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
                        {visibleUsers.map((user) => (
                          <Tooltip
                            key={user.id}
                            title={
                              canSeeOtherMembers()
                                ? `${user?.user_details?.name || "Unknown"} (${user?.role || "Member"})`
                                : `${user?.user_details?.name || "Unknown"}`
                            }
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
                  )
                );
              })()}
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
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <SettingsModal
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
      />
    </>
  );
}

export default Header;
