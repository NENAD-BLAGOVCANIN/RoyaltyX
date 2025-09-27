import { 
  Card, 
  CardActionArea, 
  Grid, 
  Box, 
  Typography, 
  Avatar, 
  AvatarGroup,
  Stack
} from "@mui/material";
import { ReactComponent as FolderSVG } from "../../common/assets/img/vectors/folder.svg";
import { useAuth } from "../../common/contexts/AuthContext";

function ProjectCard({ project, handleSwitchProject }) {
  const { user } = useAuth();

  const canSeeOtherMembers = () => {
    if (getCurrentUserRole() === "owner") {
      return true;
    }
    return project.members_can_see_other_members;
  };

  const getCurrentUserRole = () => {
    const currentUserInProject = project?.users?.find(
      (projectUser) => projectUser.user_details?.id === user.id
    );

    return currentUserInProject?.role || null;
  };

  return (
    <Grid size={{ xs: 12, md: 4 }}>
      <Card
        sx={{
          height: "100%",
          cursor: "pointer",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: (theme) => 
              theme.palette.mode === "light" 
                ? "0px 4px 20px rgba(0, 0, 0, 0.08)" 
                : "0px 4px 20px rgba(0, 0, 0, 0.3)",
          },
        }}
        onClick={() => handleSwitchProject(project.id)}
      >
        <CardActionArea
          sx={{
            height: "100%",
            p: 3,
          }}
        >
          <Stack
            spacing={2}
            sx={{
              height: "100%",
              justifyContent: "space-between",
            }}
          >
            {/* Header with icon and title */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  backgroundColor: (theme) => 
                    theme.palette.mode === "light" 
                      ? "rgba(25, 118, 210, 0.08)" 
                      : "rgba(25, 118, 210, 0.16)",
                }}
              >
                <FolderSVG style={{ width: 24, height: 24 }} />
              </Box>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: 500,
                  fontSize: "1.1rem",
                  lineHeight: 1.3,
                  color: "text.primary",
                }}
              >
                {project.name}
              </Typography>
            </Box>

            {/* Description */}
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                lineHeight: 1.5,
                flex: 1,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {project.description}
            </Typography>

            {/* Members avatars */}
            {canSeeOtherMembers() && project?.users?.length > 0 && (
              <Box sx={{ mt: "auto" }}>
                <AvatarGroup
                  max={5}
                  sx={{
                    "& .MuiAvatar-root": {
                      width: 28,
                      height: 28,
                      fontSize: "0.75rem",
                      border: (theme) => `2px solid ${theme.palette.background.paper}`,
                    },
                    "& .MuiAvatarGroup-avatar": {
                      backgroundColor: (theme) => theme.palette.primary.main,
                      fontSize: "0.75rem",
                    },
                  }}
                >
                  {project.users.map((projectUser) => (
                    <Avatar
                      key={projectUser.id}
                      src={projectUser?.user_details?.avatar}
                      alt={projectUser?.user_details?.name || "User"}
                      sx={{
                        width: 28,
                        height: 28,
                      }}
                    >
                      {projectUser?.user_details?.name?.charAt(0)?.toUpperCase() || "U"}
                    </Avatar>
                  ))}
                </AvatarGroup>
              </Box>
            )}
          </Stack>
        </CardActionArea>
      </Card>
    </Grid>
  );
}

export default ProjectCard;
