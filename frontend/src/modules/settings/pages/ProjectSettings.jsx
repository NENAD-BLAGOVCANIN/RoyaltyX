import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Container,
  Grid,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Trash2, Save } from "lucide-react";
import {
  getProjectInfo,
  updateProjectInfo,
  deleteProject,
} from "../../projects/api/project";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "../../common/components/PageHeader";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `settings-tab-${index}`,
    "aria-controls": `settings-tabpanel-${index}`,
  };
}

function ProjectSettings() {
  const [project, setProject] = useState({
    name: "",
    description: "",
    members_can_see_other_members: true,
  });
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for tab parameter in URL
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setTabValue(parseInt(tabParam, 10));
    }
  }, [location.search]);

  useEffect(() => {
    fetchProjectInfo();
  }, []);

  const fetchProjectInfo = async () => {
    try {
      setLoading(true);
      const projectData = await getProjectInfo();
      setProject({
        name: projectData.name || "",
        description: projectData.description || "",
        members_can_see_other_members:
          projectData.members_can_see_other_members ?? true,
      });

      // Get current user's role in the project
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const currentUserInProject = projectData.users?.find(
        (user) => user.user_details.id === currentUser?.id
      );
      setUserRole(currentUserInProject?.role || "");
    } catch (error) {
      setError("Failed to load project information");
      console.error("Error fetching project info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProject((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSave = async () => {
    if (!project.name.trim()) {
      setError("Project name is required");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await updateProjectInfo({
        name: project.name.trim(),
        description: project.description.trim(),
        members_can_see_other_members: project.members_can_see_other_members,
      });

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess("Project settings updated successfully");
      }
    } catch (error) {
      setError("Failed to update project settings");
      console.error("Error updating project:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (confirmDeleteText !== project.name) {
      setError("Project name doesn't match");
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const response = await deleteProject();

      if (response.error) {
        setError(response.error);
      } else {
        // Redirect to projects list after successful deletion
        navigate("/my-projects");
        window.location.reload(); // Refresh to update the project context
      }
    } catch (error) {
      setError("Failed to delete project");
      console.error("Error deleting project:", error);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setConfirmDeleteText("");
    }
  };

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
    setConfirmDeleteText("");
    setError("");
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setConfirmDeleteText("");
    setError("");
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const isOwner = userRole === "owner";

  if (loading) {
    return (
      <Container sx={{ pt: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <Typography>Loading project settings...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Project Settings"
        description="Manage your project information and settings"
      />

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="project settings tabs"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "14px",
              fontWeight: 500,
              minWidth: "auto",
              px: 0,
              mr: 4,
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#1976d2",
              height: 3,
            },
          }}
        >
          <Tab label="General" {...a11yProps(0)} />
          <Tab label="View Management" {...a11yProps(1)} />
          {isOwner && <Tab label="Danger Zone" {...a11yProps(2)} />}
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item size={{ xs: 12 }}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3 }} gutterBottom>
                  General Information
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                  </Alert>
                )}

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Project Name"
                    value={project.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    variant="outlined"
                    required
                    helperText="Enter a descriptive name for your project"
                  />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={project.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    variant="outlined"
                    multiline
                    rows={4}
                    helperText="Provide a brief description of your project (optional)"
                  />
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={<Save size={18} />}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3 }} gutterBottom>
                  Member Visibility Settings
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                  </Alert>
                )}

                <Box sx={{ mb: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={project.members_can_see_other_members}
                        onChange={(e) =>
                          handleInputChange(
                            "members_can_see_other_members",
                            e.target.checked
                          )
                        }
                        color="primary"
                      />
                    }
                    label="Allow project members to see other members' information"
                  />
                  <Typography
                    variant="body2"
                    component="p"
                    color="text.secondary"
                    sx={{ mt: 1, ml: 6 }}
                  >
                    When enabled, project members can see names and email
                    addresses of other project members. When disabled, only
                    project owners can see this information.
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={<Save size={18} />}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {isOwner && (
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" gutterBottom color="error">
                    Danger Zone
                  </Typography>

                  <Divider sx={{ mb: 3 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ mb: 3 }} gutterBottom>
                      Delete Project
                    </Typography>
                    <br />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ pb: 3 }}
                    >
                      Once you delete a project, there is no going back. This
                      action cannot be undone. All data associated with this
                      project will be permanently deleted.
                    </Typography>
                    <br />
                    <br />
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={openDeleteDialog}
                      startIcon={<Trash2 size={18} />}
                    >
                      Delete Project
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Delete Project
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This action cannot be undone. This will permanently delete the
            project
            <strong> "{project.name}" </strong>
            and all of its data.
          </Typography>
          <br /> <br />
          <Typography variant="body2">
            Please type <strong>{project.name}</strong> to confirm:
          </Typography>
          <br />
          <TextField
            fullWidth
            value={confirmDeleteText}
            onChange={(e) => setConfirmDeleteText(e.target.value)}
            placeholder={project.name}
            variant="outlined"
            error={
              confirmDeleteText !== "" && confirmDeleteText !== project.name
            }
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteProject}
            color="error"
            variant="contained"
            disabled={deleting || confirmDeleteText !== project.name}
          >
            {deleting ? "Deleting..." : "Delete Project"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProjectSettings;
