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
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemIcon,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { getUsers } from "../../admin_panel/api/user";
import { addProjectMember, getProjectProducts, updateProjectMember } from "../api/members";
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
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [showProductSelection, setShowProductSelection] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedUsers, fetchedProducts] = await Promise.all([
          getUsers(),
          getProjectProducts()
        ]);

        // Debug logging
        console.log("Project users:", project?.users);
        console.log("Fetched users:", fetchedUsers);
        console.log("Fetched products:", fetchedProducts);

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
        setProducts(fetchedProducts);

        // Initialize product selection state for producer role (default)
        const initialProductSelection = {};
        const initialSelectedProducts = {};
        availableUsers.forEach(user => {
          initialProductSelection[user.id] = true; // Show product selection by default since default role is producer
          initialSelectedProducts[user.id] = [];
        });
        setShowProductSelection(initialProductSelection);
        setSelectedProducts(initialSelectedProducts);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error loading data");
      }
    };

    if (showAddMemberModal) {
      fetchData();
    }
  }, [showAddMemberModal, project?.users]);

  const handleCloseAddMemberModal = () => {
    setShowAddMemberModal(false);
    // Reset all states when modal closes
    setSelectedRoles({});
    setSelectedProducts({});
    setShowProductSelection({});
    setUsers([]);
    setProducts([]);
  };

  const handleRoleChange = (userId, role) => {
    setSelectedRoles({
      ...selectedRoles,
      [userId]: role,
    });

    if (role === "producer") {
      setShowProductSelection({
        ...showProductSelection,
        [userId]: true,
      });
    } else {
      setShowProductSelection({
        ...showProductSelection,
        [userId]: false,
      });
      // Clear selected products for non-producers
      setSelectedProducts({
        ...selectedProducts,
        [userId]: [],
      });
    }
  };


  const handleAddMember = async (user) => {
    const selectedRole = selectedRoles[user.id] || "producer";
    
    // If producer role and no products selected, show error
    if (selectedRole === "producer" && (!selectedProducts[user.id] || selectedProducts[user.id].length === 0)) {
      toast.error("Please select at least one product for the producer to access.");
      return;
    }

    const data = {
      user: user.id,
      role: selectedRole,
      product_ids: selectedRole === "producer" ? selectedProducts[user.id] : [],
    };

    setLoading(true);
    try {
      const createdProjectUser = await addProjectMember(data);

      // If producer, also set product access
      if (selectedRole === "producer" && selectedProducts[user.id]) {
        await updateProjectMember(createdProjectUser.id, {
          role: selectedRole,
          product_ids: selectedProducts[user.id],
        });
      }

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
      maxWidth="md"
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
                    />
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
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        >
                          <MenuItem value="producer">Producer</MenuItem>
                          <MenuItem value="owner">Owner</MenuItem>
                        </Select>
                      </FormControl>
                      
                      {/* Product Selection for Producers - Inline */}
                      {showProductSelection[user.id] && (
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <InputLabel>Products *</InputLabel>
                          <Select
                            multiple
                            value={selectedProducts[user.id] || []}
                            onChange={(e) => {
                              setSelectedProducts({
                                ...selectedProducts,
                                [user.id]: e.target.value,
                              });
                            }}
                            input={<OutlinedInput label="Products *" />}
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((productId) => {
                                  const product = products.find(p => p.id === productId);
                                  return (
                                    <Chip
                                      key={productId}
                                      label={product?.title || `Product ${productId}`}
                                      size="small"
                                    />
                                  );
                                })}
                              </Box>
                            )}
                          >
                            {products.length > 0 ? (
                              products.map((product) => (
                                <MenuItem key={product.id} value={product.id}>
                                  <ListItemIcon>
                                    <Checkbox
                                      checked={(selectedProducts[user.id] || []).includes(product.id)}
                                      size="small"
                                    />
                                  </ListItemIcon>
                                  <ListItemText primary={product.title} />
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled>
                                <ListItemText primary="No products available" />
                              </MenuItem>
                            )}
                          </Select>
                        </FormControl>
                      )}
                      
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
