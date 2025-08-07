import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Avatar,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { getInviteDetails, acceptInvite } from "../api/invites";
import { useAuth } from "../../common/contexts/AuthContext";

function InviteAcceptPage() {
  const { inviteId } = useParams();
  const navigate = useNavigate();
  const { authenticated, user } = useAuth();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInviteDetails = async () => {
      try {
        const inviteData = await getInviteDetails(inviteId);
        setInvite(inviteData);
        
        // Check if invite is expired
        if (inviteData.is_expired) {
          setError("This invite has expired.");
        }
      } catch (error) {
        console.error("Error fetching invite details:", error);
        setError("Invite not found or invalid.");
      } finally {
        setLoading(false);
      }
    };

    if (inviteId) {
      fetchInviteDetails();
    }
  }, [inviteId]);

  const handleAcceptInvite = async () => {
    if (!authenticated) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/invite/${inviteId}`);
      return;
    }

    if (user?.email !== invite?.email) {
      toast.error("You must be logged in with the invited email address to accept this invite.");
      return;
    }

    setAccepting(true);
    try {
      await acceptInvite(inviteId);
      toast.success("Invite accepted successfully! Welcome to the project!");
      
      navigate("/");
    } catch (error) {
      console.error("Error accepting invite:", error);
      
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to accept invite. Please try again.");
      }
    } finally {
      setAccepting(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate(`/login?redirect=/invite/${inviteId}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "grey.50",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "grey.50",
          p: 3,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: "center" }}>
          <ErrorIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Invalid Invite
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: "100%" }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <BusinessIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            You're Invited!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You've been invited to join a project on RoyaltyX
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Invitation Details
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Project:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {invite?.project_name}
            </Typography>
            {invite?.project_description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {invite.project_description}
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Invited by:
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ width: 32, height: 32 }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="body1" component="p" sx={{ fontWeight: 500 }}>
                  {invite?.invited_by_name}
                </Typography>
                <Typography variant="body2" component="p" color="text.secondary">
                  {invite?.invited_by_email}
                </Typography>
              </Box>
            </Box>
          </Box>

          {invite?.product_access && invite.product_access.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Product Access:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {invite.product_access.map((productAccess) => (
                  <Chip
                    key={productAccess.product_id}
                    label={productAccess.product_title}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Invited Email:
            </Typography>
            <Typography variant="body1" component="p" sx={{ fontWeight: 500 }}>
              {invite?.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {!authenticated ? (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              You need to be logged in to accept this invite. Please log in with the email address that received this invitation.
            </Alert>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleLoginRedirect}
            >
              Login to Accept Invite
            </Button>
          </Box>
        ) : user?.email !== invite?.email ? (
          <Box>
            <Alert severity="warning" sx={{ mb: 3 }}>
              You are currently logged in as <strong>{user?.email}</strong>, but this invite was sent to <strong>{invite?.email}</strong>. 
              Please log in with the correct email address to accept this invite.
            </Alert>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={handleLoginRedirect}
            >
              Login with Correct Email
            </Button>
          </Box>
        ) : (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                You're logged in as <strong>{user?.email}</strong> - ready to accept this invite!
              </Typography>
            </Alert>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleAcceptInvite}
              disabled={accepting}
              startIcon={accepting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            >
              {accepting ? "Accepting..." : "Accept Invite"}
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            This invite expires on {new Date(invite?.expires_at).toLocaleDateString()}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default InviteAcceptPage;
