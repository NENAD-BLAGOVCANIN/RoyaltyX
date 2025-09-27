import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Crown, Check, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

function SubscriptionSettings() {
  const { subscriptionPlan } = useAuth();
  const currentPlan = subscriptionPlan || "free";

  const planDetails = {
    free: {
      name: "Free",
      description: "Perfect for getting started",
      color: "default",
      features: [
        "Up to 3 projects",
        "5GB storage",
        "Basic analytics",
        "Email support",
      ],
    },
    basic: {
      name: "Basic",
      description: "Best for growing businesses",
      color: "secondary",
      features: [
        "Up to 15 projects",
        "50GB storage",
        "Advanced analytics",
        "Priority support",
        "API access",
      ],
    },
    premium: {
      name: "Premium",
      description: "For large organizations",
      color: "primary",
      features: [
        "Unlimited projects",
        "500GB storage",
        "Enterprise analytics",
        "24/7 phone support",
        "Custom integrations",
        "White-label options",
      ],
    },
  };

  const currentPlanDetails = planDetails[currentPlan] || planDetails.free;

  const handleManagePlans = () => {
    window.location.href = "/account/membership";
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Subscription Plan
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Crown size={24} style={{ marginRight: 12 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Current Plan: {currentPlanDetails.name}
              </Typography>
              <Typography variant="bodySm" color="text.secondary">
                {currentPlanDetails.description}
              </Typography>
            </Box>
            <Chip
              label={currentPlanDetails.name}
              color={currentPlanDetails.color}
              sx={{ fontWeight: 500 }}
            />
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
            What's included:
          </Typography>

          <List sx={{ p: 0, mb: 2 }}>
            {currentPlanDetails.features.map((feature, index) => (
              <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Check size={16} color="green" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="bodySm">{feature}</Typography>}
                />
              </ListItem>
            ))}
          </List>

          {currentPlan !== "premium" && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="bodySm">
                Upgrade your plan to unlock more features and increase your
                limits.
              </Typography>
            </Alert>
          )}

          <Button
            variant="contained"
            endIcon={<ArrowRight size={16} />}
            onClick={handleManagePlans}
            sx={{ mt: 1 }}
          >
            {currentPlan === "premium" ? "Manage Plan" : "Upgrade Plan"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Plan Comparison
          </Typography>
          <Typography variant="bodySm" color="text.secondary">
            Compare all available plans and choose the one that best fits your
            needs.
          </Typography>
          <Button
            sx={{ mt: 2 }}
            variant="outlined"
            onClick={handleManagePlans}
            endIcon={<ArrowRight size={16} />}
          >
            View All Plans
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default SubscriptionSettings;
