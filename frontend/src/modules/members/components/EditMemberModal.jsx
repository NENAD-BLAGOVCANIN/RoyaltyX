import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Close as CloseIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { getProjectProducts, updateProjectMember } from "../api/members";
import { toast } from "react-toastify";

function EditMemberModal({
  project,
  setProject,
  showEditMemberModal,
  setShowEditMemberModal,
  selectedMember,
}) {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductSelection, setShowProductSelection] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedMember) return;

      try {
        const fetchedProducts = await getProjectProducts();
        setProducts(fetchedProducts);
        setSelectedRole(selectedMember.role || "producer");
        setSelectedProducts(selectedMember.accessible_products || []);
        setShowProductSelection(selectedMember.role === "producer");
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error loading data");
      }
    };

    if (showEditMemberModal && selectedMember) {
      fetchData();
    }
  }, [showEditMemberModal, selectedMember]);

  const handleCloseModal = () => {
    setShowEditMemberModal(false);
    setSelectedRole("");
    setSelectedProducts([]);
    setShowProductSelection(false);
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);

    if (role === "producer") {
      setShowProductSelection(true);
    } else {
      setShowProductSelection(false);
      setSelectedProducts([]);
    }
  };


  const handleSave = async () => {
    if (!selectedMember) return;

    // If producer role and no products selected, show error
    if (selectedRole === "producer" && selectedProducts.length === 0) {
      toast.error("Please select at least one product for the producer to access.");
      return;
    }

    const data = {
      role: selectedRole,
      product_ids: selectedRole === "producer" ? selectedProducts : [],
    };

    setLoading(true);
    try {
      const updatedProjectUser = await updateProjectMember(selectedMember.id, data);

      // Update the project state
      setProject({
        ...project,
        users: project.users.map(user => 
          user.id === selectedMember.id ? updatedProjectUser : user
        ),
      });

      handleCloseModal();
      toast.success("Successfully updated member access!");
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error("Error while trying to update member access!");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedMember) return null;

  return (
    <Dialog
      open={showEditMemberModal}
      onClose={handleCloseModal}
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
            Edit Member Access
          </Typography>
          <IconButton
            onClick={handleCloseModal}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Member Info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar
            src={selectedMember?.user_details?.avatar}
            sx={{
              width: 50,
              height: 50,
            }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {selectedMember?.user_details?.name || "Unknown User"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedMember?.user_details?.email}
            </Typography>
          </Box>
        </Box>

        {/* Role and Product Selection - Inline */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={selectedRole}
              label="Role"
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              <MenuItem value="producer">Producer</MenuItem>
              <MenuItem value="owner">Owner</MenuItem>
            </Select>
          </FormControl>

          {/* Product Selection for Producers - Inline */}
          {showProductSelection && (
            <FormControl sx={{ minWidth: 200, flex: 1 }}>
              <InputLabel>Products *</InputLabel>
              <Select
                multiple
                value={selectedProducts}
                onChange={(e) => setSelectedProducts(e.target.value)}
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
                          checked={selectedProducts.includes(product.id)}
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
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleCloseModal} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={loading}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditMemberModal;
