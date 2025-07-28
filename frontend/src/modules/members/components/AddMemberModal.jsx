import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Typography,
  Box,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { getUsers } from "../../admin_panel/api/user";
import { addProjectMember } from "../api/members";
import { toast } from "react-toastify";

function AddMemberModal({
  project,
  setProject,
  showAddMemberModal,
  setShowAddMemberModal,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers();

        // Debug logging
        console.log("Project users:", project?.users);
        console.log("Fetched users:", fetchedUsers);

        // Filter out users who are already project members
        // Try multiple possible ID mappings to be safe
        const projectMemberIds =
          project?.users
            ?.map((user) => {
              // Check both user.user_details.id and user.user_details.user_id
              return (
                user.user_details?.id ||
                user.user_details?.user_id ||
                user.user_id
              );
            })
            .filter(Boolean) || [];

        console.log("Project member IDs:", projectMemberIds);

        const availableUsers = fetchedUsers.filter(
          (user) => !projectMemberIds.includes(user.id)
        );

        console.log("Available users after filtering:", availableUsers);
        setUsers(availableUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Error loading users");
      }
    };

    if (showAddMemberModal) {
      fetchUsers();
    }
  }, [showAddMemberModal, project?.users]);

  const handleCloseAddMemberModal = () => {
    setShowAddMemberModal(false);
  };

  const handleAddMember = async (user) => {
    const selectedRole = selectedRoles[user.id] || "producer";
    const data = {
      user: user.id,
      role: selectedRole,
    };

    setLoading(true);
    try {
      const createdProjectUser = await addProjectMember(data);

      setProject({
        ...project,
        users: [...project.users, createdProjectUser],
      });

      setShowAddMemberModal(false);
      toast.success("Successfully added a new project member!");
    } catch (error) {
      console.error("Error adding member:", error);

      // Handle specific error messages
      if (error.response?.data?.non_field_errors) {
        const errorMessage = error.response.data.non_field_errors[0];
        if (errorMessage.includes("unique set")) {
          toast.error("This user is already a member of the project!");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Error while trying to add a member!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={showAddMemberModal}
      onClose={handleCloseAddMemberModal}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Add Project Member
          </Typography>
          <IconButton
            onClick={handleCloseAddMemberModal}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 0 }}>
        {users.length > 0 ? (
          <List sx={{ width: "100%" }}>
            {users.map((user, index) => (
              <Box key={user.id}>
                <ListItem
                  sx={{
                    px: 3,
                    py: 2,
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={user.avatar}
                      sx={{
                        width: 40,
                        height: 40,
                      }}
                    >
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    sx={{ flexDirection: "column", display: "flex" }}
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {user.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    }
                  />

                  <ListItemSecondaryAction>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={selectedRoles[user.id] || "producer"}
                          label="Role"
                          onChange={(e) =>
                            setSelectedRoles({
                              ...selectedRoles,
                              [user.id]: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="producer">Producer</MenuItem>
                          <MenuItem value="owner">Owner</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PersonAddIcon />}
                        onClick={() => handleAddMember(user)}
                        disabled={loading}
                      >
                        Add
                      </Button>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < users.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: "center", py: 6, px: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No available users
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All users are already members of this project or no users exist in
              the system.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AddMemberModal;
