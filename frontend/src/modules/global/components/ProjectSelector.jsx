import { Box, Divider, Menu, MenuItem, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { ChevronDown, Folder } from "lucide-react";
import { getMyProjects, switchProject } from "../../projects/api/project";
import { useNavigate } from "react-router";
import { useAuth } from "../../common/contexts/AuthContext";

export const ProjectSelector = () => {
  const [projectMenuAnchor, setProjectMenuAnchor] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const handleProjectMenuOpen = (event) => {
    setProjectMenuAnchor(event.currentTarget);
  };
  const handleSwitchProject = async (project_id) => {
    try {
      await switchProject(project_id);
      window.location.reload();
    } catch (error) {
      console.error("Error switching project:", error);
    }
    handleProjectMenuClose();
  };

  const handleProjectMenuClose = () => {
    setProjectMenuAnchor(null);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const fetchedMyProjects = await getMyProjects();
        setMyProjects(fetchedMyProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <Box sx={{ p: 2, width: "100%", boxSizing: "border-box" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Paper
          elevation={0}
          data-testid="project-selector"
          sx={{
            p: 1,
            py: 0.95,
            pr: 2,
            backgroundColor: "action.hover",
            borderRadius: 2,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            width: "100%",
            maxWidth: "100%",
            overflow: "hidden",
            "&:hover": {
              backgroundColor: "action.selected",
            },
          }}
          onClick={handleProjectMenuOpen}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1,
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <Folder
              size={18}
              style={{ marginRight: 8, flexShrink: 0 }}
            />
            <Typography
              variant="bodySm"
              sx={{
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.project?.name ||
                user?.currently_selected_project?.name}
            </Typography>
          </Box>
          <ChevronDown size={18} style={{ flexShrink: 0 }} />
        </Paper>
      </Box>

      <Menu
        anchorEl={projectMenuAnchor}
        open={Boolean(projectMenuAnchor)}
        onClose={handleProjectMenuClose}
        PaperProps={{
          sx: { width: 230, mt: 1 },
        }}
      >
        {myProjects.map((myProject) => (
          <MenuItem
            key={myProject.id}
            onClick={() => handleSwitchProject(myProject.id)}
            sx={{ py: 1 }}
          >
            {myProject?.name}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          onClick={() => {
            navigate("/my-projects");
            handleProjectMenuClose();
          }}
          sx={{ color: "primary.main", fontWeight: 500 }}
        >
          View all
        </MenuItem>
      </Menu>
    </Box>
  );
};
