import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemIcon,
  ListItemText,
  Alert,
  Paper,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  Email as EmailIcon,
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { createInvite } from "../api/invites";
import { getProjectProducts } from "../api/members";

function InviteUserModal({ showInviteModal, setShowInviteModal }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("producer");
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteCreated, setInviteCreated] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (showInviteModal) {
        try {
          const fetchedProducts = await getProjectProducts();
          setProducts(fetchedProducts);
        } catch (error) {
          console.error("Error fetching products:", error);
          toast.error("Error loading products");
        }
      }
    };

    fetchProducts();
  }, [showInviteModal]);

  const handleCloseModal = () => {
    setShowInviteModal(false);
    // Reset all states when modal closes
    setEmail("");
    setRole("producer");
    setSelectedProducts([]);
    setInviteCreated(false);
    setInviteData(null);
    setCopySuccess(false);
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === "owner") {
      setSelectedProducts([]);
    }
  };

  const handleSendInvite = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    if (role === "producer" && selectedProducts.length === 0) {
      toast.error(
        "Please select at least one product for the producer to access"
      );
      return;
    }

    const invitePayload = {
      email,
      role,
      product_ids: role === "producer" ? selectedProducts : [],
    };

    setLoading(true);
    try {
      const createdInvite = await createInvite(invitePayload);
      setInviteData(createdInvite);
      setInviteCreated(true);
      toast.success("Invite sent successfully!");
    } catch (error) {
      console.error("Error creating invite:", error);

      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Error while trying to send invite!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (inviteData?.invite_link) {
      try {
        await navigator.clipboard.writeText(inviteData.invite_link);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = inviteData.invite_link;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch (fallbackErr) {
          toast.error("Failed to copy link");
        }
        document.body.removeChild(textArea);
      }
    }
  };

  const handleSendAnother = () => {
    setEmail("");
    setRole("producer");
    setSelectedProducts([]);
    setInviteCreated(false);
    setInviteData(null);
    setCopySuccess(false);
  };

  return (
    <Dialog
      open={showInviteModal}
      onClose={handleCloseModal}
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
            {inviteCreated ? "Invite Sent!" : "Invite User to Project"}
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

      <DialogContent sx={{ px: 3, pb: 3 }}>
        {!inviteCreated ? (
          // Invite Form
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address to invite"
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                label="Role"
                onChange={(e) => handleRoleChange(e.target.value)}
              >
                <MenuItem value="producer">Producer</MenuItem>
                <MenuItem value="owner">Owner</MenuItem>
              </Select>
            </FormControl>

            {role === "producer" && (
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Products Access *</InputLabel>
                <Select
                  multiple
                  value={selectedProducts}
                  onChange={(e) => setSelectedProducts(e.target.value)}
                  input={<OutlinedInput label="Products Access *" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((productId) => {
                        const product = products.find(
                          (p) => p.id === productId
                        );
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

            <Alert severity="info" sx={{ mb: 3 }}>
              An email will be automatically sent to the invited user with the
              invite link. You'll also be able to copy the link to share it
              manually.
            </Alert>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={handleCloseModal}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSendInvite}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Invite"}
              </Button>
            </Box>
          </Box>
        ) : (
          // Success State
          <Box sx={{ mt: 2 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography
                variant="bodyMd"
                component="p"
                sx={{ fontWeight: 500 }}
              >
                Invite sent successfully!
              </Typography>
              <Typography variant="bodySm" sx={{ mt: 1 }}>
                An email has been sent to <strong>{inviteData?.email}</strong>{" "}
                with the invite link.
              </Typography>
            </Alert>

            <Paper
              elevation={1}
              sx={{ p: 3, mb: 3 }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 2, display: "flex", alignItems: "center" }}
              >
                <CheckCircleIcon sx={{ mr: 1, color: "success.main" }} />
                Invite Details
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="bodySm" color="text.secondary">
                  Email:{" "}
                </Typography>
                <Typography variant="bodySm" sx={{ fontWeight: 500 }}>
                  {inviteData?.email}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="bodySm" color="text.secondary">
                  Role:{" "}
                </Typography>
                <Typography
                  variant="bodySm"
                  sx={{ fontWeight: 500, textTransform: "capitalize" }}
                >
                  {inviteData?.role}
                </Typography>
              </Box>

              {inviteData?.product_access &&
                inviteData.product_access.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="bodySm"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Product Access:
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {inviteData.product_access.map((productAccess) => (
                        <Chip
                          key={productAccess.product_id}
                          label={productAccess.product_title}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="bodySm" color="text.secondary" sx={{ mb: 1 }}>
                Invite Link:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <TextField
                  fullWidth
                  value={inviteData?.invite_link || ""}
                  InputProps={{
                    readOnly: true,
                    sx: { fontSize: "0.875rem" },
                  }}
                  size="small"
                />
                <Button
                  variant="outlined"
                  onClick={handleCopyLink}
                  startIcon={
                    copySuccess ? <CheckCircleIcon /> : <ContentCopyIcon />
                  }
                  color={copySuccess ? "success" : "primary"}
                  sx={{ minWidth: "120px" }}
                >
                  {copySuccess ? "Copied!" : "Copy Link"}
                </Button>
              </Box>
            </Paper>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={handleSendAnother}>
                Send Another Invite
              </Button>
              <Button variant="contained" onClick={handleCloseModal}>
                Done
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default InviteUserModal;
