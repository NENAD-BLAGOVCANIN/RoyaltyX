import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Shield,
  CreditCard,
  Mail,
  Calendar,
  CheckCircle,
  User,
  Crown,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../common/contexts/AuthContext";

function Overview() {
  const navigate = useNavigate();
  const { subscriptionPlan, user } = useAuth();


  const accountMenuItems = [
    {
      title: "Security",
      description: "Manage your password and security settings",
      icon: <Shield size={20} color="currentColor" />,
      path: "/account/security",
    },
    {
      title: "Membership",
      description: "View and manage your subscription plan",
      icon: <CreditCard size={20} color="currentColor" />,
      path: "/account/membership",
    },
    {
      title: "Delete Account",
      description: "Permanently delete your account and all data",
      icon: <Trash2 size={20} color="currentColor" />,
      path: "/account/delete",
      danger: true,
    },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 600 }}>
        Account Overview
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Avatar
                src={user?.avatar}
                sx={{
                  width: 80,
                  height: 80,
                  mx: "auto",
                  mb: 2,
                  fontSize: "2rem",
                }}
              />
              <Typography variant="h5" sx={{ mb: 1, fontWeight: 500 }}>
                {user?.name || "User"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {user?.email || "user@example.com"}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip
                  icon={<Mail size={16} />}
                  label={user?.is_email_verified ? "Verified" : "Not Verified"}
                  color={user?.is_email_verified ? "success" : "error"}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                Account Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: "background.default",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <User
                        size={16}
                        color="currentColor"
                        style={{ marginRight: 8, color: "text.secondary" }}
                      />
                      <Typography variant="subtitle2" color="text.secondary">
                        Full Name
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user?.name || "Not provided"}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: "background.default",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Mail
                        size={16}
                        color="currentColor"
                        style={{ marginRight: 8, color: "text.secondary" }}
                      />
                      <Typography variant="subtitle2" color="text.secondary">
                        Email Address
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user?.email || "Not provided"}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: "background.default",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Calendar
                        size={16}
                        color="currentColor"
                        style={{ marginRight: 8, color: "text.secondary" }}
                      />
                      <Typography variant="subtitle2" color="text.secondary">
                        Member Since
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(user?.created_at)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: "background.default",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CheckCircle
                        size={16}
                        color="currentColor"
                        style={{ marginRight: 8, color: "text.secondary" }}
                      />
                      <Typography variant="subtitle2" color="text.secondary">
                        Account Status
                      </Typography>
                    </Box>
                    <Chip
                      label="Active"
                      color="success"
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: "background.default",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Crown
                        size={16}
                        color="currentColor"
                        style={{ marginRight: 8, color: "text.secondary" }}
                      />
                      <Typography variant="subtitle2" color="text.secondary">
                        Subscription Plan
                      </Typography>
                    </Box>
                    <Chip
                      label={
                        subscriptionPlan
                          ? subscriptionPlan.charAt(0).toUpperCase() +
                            subscriptionPlan.slice(1)
                          : "Free"
                      }
                      color={
                        subscriptionPlan === "premium"
                          ? "primary"
                          : subscriptionPlan === "basic"
                            ? "secondary"
                            : "default"
                      }
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                Account Settings
              </Typography>
              <List sx={{ p: 0 }}>
                {accountMenuItems.map((item, index) => (
                  <Box key={item.title}>
                    <ListItem
                      sx={{
                        px: 0,
                        py: 2,
                        borderRadius: 1,
                      }}
                    >
                      <ListItemIcon sx={{ 
                        minWidth: 40,
                        color: item.danger ? "error.main" : "inherit"
                      }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography 
                            variant="subtitle1"
                            sx={{ color: item.danger ? "error.main" : "inherit" }}
                          >
                            {item.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {item.description}
                          </Typography>
                        }
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        color={item.danger ? "error" : "primary"}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(item.path);
                        }}
                      >
                        {item.danger ? "Delete" : "Manage"}
                      </Button>
                    </ListItem>
                    {index < accountMenuItems.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Overview;
