import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  CircleAlert,
  CreditCard,
  Database,
  Users,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../common/contexts/AuthContext";
import { deleteAccount } from "../api/user";

function DeleteAccount() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError("");

    try {
      await deleteAccount();      
      logout();
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to delete account. Please try again.");
    } finally {
      setLoading(false);
      setConfirmationOpen(false);
    }
  };

  const dataLossItems = [
    {
      icon: <Database size={20} />,
      title: "All your projects and data",
      description: "Including analytics, reports, and uploaded content",
    },
    {
      icon: <Users size={20} />,
      title: "Team memberships",
      description: "You'll be removed from all shared projects",
    },
    {
      icon: <FileText size={20} />,
      title: "Generated reports",
      description: "All custom reports and templates will be lost",
    },
    {
      icon: <CreditCard size={20} />,
      title: "Subscription and billing history",
      description: "Your subscription will be cancelled immediately",
    },
  ];

  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 600 }}>
        Delete Account
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 500 }}>
              Permanent Account Deletion
            </Typography>
          </Box>

          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body1" component="p"  sx={{ fontWeight: 500, mb: 1 }}>
              This action cannot be undone!
            </Typography>
            <Typography variant="body2">
              Once you delete your account, all your data will be permanently removed
              from our servers. Please make sure you have backed up any important
              information before proceeding.
            </Typography>
          </Alert>

          <Typography variant="h6" sx={{ mt: 4, fontWeight: 500 }}>
            What will be deleted:
          </Typography>

          <List sx={{ mb: 3 }}>
            {dataLossItems.map((item, index) => (
              <Box key={index}>
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40, color: "error.main" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < dataLossItems.length - 1 && <Divider />}
              </Box>
            ))}
          </List>

          {user?.subscription_plan !== "free" && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Subscription Notice:</strong> Your {user?.subscription_plan} subscription
                will be cancelled immediately. You will not be charged for future billing cycles.
              </Typography>
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2">{error}</Typography>
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/account")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => setConfirmationOpen(true)}
              disabled={loading}
            >
              Delete Account
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          <CircleAlert size={24} color="#f44336" style={{ marginRight: 12 }} />
          Final Confirmation
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" component="p" sx={{ mb: 2 }}>
            Are you absolutely sure you want to delete your account?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will permanently delete your account for{" "}
            <strong>{user?.email}</strong> and all associated data. This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setConfirmationOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Yes, Delete My Account"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DeleteAccount;
