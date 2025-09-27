import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Container,
  Snackbar,
} from "@mui/material";
import { X, ArrowUp, ArrowDown, Check } from "lucide-react";
import { useAuth } from "../../common/contexts/AuthContext";
import { changeSubscriptionPlan } from "../api/subscription";
import { createCheckoutSession } from "../api/payments";
import { verifySession } from "../api/payments";
import PageHeader from "../../common/components/PageHeader";

function MembershipPage() {
  const { subscriptionPlan, setSubscriptionPlan } = useAuth();
  const [upgradeDialog, setUpgradeDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [currentPlan, setCurrentPlan] = useState(subscriptionPlan || "free");

  // Helper function to determine plan hierarchy level
  const getPlanLevel = (planName) => {
    const levels = {
      free: 0,
      discovery: 1,
      professional: 2,
      premium: 3,
      enterprise: 4,
    };
    return levels[planName] || 0;
  };

  const plans = [
    {
      name: "free",
      displayName: "Free",
      price: "$0",
      period: "forever",
      description: "Get started with basic features",
      features: [
        "Limited platform sync",
        "Basic dashboard access",
        "Community support",
      ],
      limitations: [
        "Very limited features",
        "No data sync",
        "Community support only",
      ],
      popular: false,
    },
    {
      name: "discovery",
      displayName: "Discovery",
      price: "$19",
      period: "per month ($199/yr)",
      description: "Free Trial (30 Days), then $19/mo",
      features: [
        "Sync data from max of 3 platforms",
        "Previous month data sync",
        "Core content upload",
        "Basic revenue dashboard",
        "Essential analytics",
      ],
      limitations: [
        "Limited to 3 platforms",
        "Only previous month data",
        "Basic analytics only",
      ],
      popular: false,
    },
    {
      name: "professional",
      displayName: "Professional",
      price: "$49",
      period: "per month ($499/yr)",
      description: "Best for growing businesses",
      features: [
        "Sync data from max of 7 platforms",
        "Previous month data sync",
        "Weekly updates",
        "Deeper revenue breakdowns",
        "Enhanced analytics",
      ],
      limitations: [],
      popular: true,
    },
    {
      name: "premium",
      displayName: "Premium",
      price: "$99",
      period: "per month ($999/yr)",
      description: "For advanced users and teams",
      features: [
        "Sync data from over 12 platforms",
        "Previous year data sync",
        "Daily insights",
        "AI forecasting",
        "Full analytics suite",
        "Trend & pricing tools",
      ],
      limitations: [],
      popular: false,
    },
    {
      name: "enterprise",
      displayName: "Enterprise",
      price: "Contact",
      period: "for pricing",
      description: "Tailored for large organizations",
      features: [
        "Sync data from all available platforms",
        "Custom platform integrations",
        "Previous year data sync",
        "Tailored packaged pricing",
        "Dedicated account manager",
        "Priority support",
      ],
      limitations: [],
      popular: false,
    },
  ];

  useEffect(() => {
    setCurrentPlan(subscriptionPlan || "free");
  }, [subscriptionPlan]);

  // Handle return from Stripe checkout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const status = urlParams.get('status');

    if (sessionId && status === 'success') {
      // Verify the session and show success message
      verifySession(sessionId)
        .then((response) => {
          if (response.status === 'success') {
            setSnackbar({
              open: true,
              message: response.message || 'Payment successful! Your subscription has been activated.',
              severity: 'success'
            });
            // Refresh user data to get updated subscription plan
            window.location.reload();
          }
        })
        .catch((error) => {
          setSnackbar({
            open: true,
            message: error.message || 'Payment completed but verification failed. Please contact support.',
            severity: 'warning'
          });
        });
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'cancelled') {
      setSnackbar({
        open: true,
        message: 'Payment was cancelled. You can try again anytime.',
        severity: 'info'
      });
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    setUpgradeDialog(true);
  };

  const confirmUpgrade = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      // For paid plans, create checkout session and redirect to Stripe
      if (selectedPlan.name !== "free") {
        const response = await createCheckoutSession(selectedPlan.name);
        
        // Redirect to Stripe checkout
        window.location.href = response.checkout_url;
        return;
      }
      
      // For free plan (downgrade), handle directly
      const response = await changeSubscriptionPlan(selectedPlan.name);
      setCurrentPlan(selectedPlan.name);
      setSubscriptionPlan(selectedPlan.name);
      setSnackbar({
        open: true,
        message:
          response.message ||
          `Successfully changed to ${selectedPlan.displayName}!`,
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to process plan change",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setUpgradeDialog(false);
      setSelectedPlan(null);
    }
  };

  const handleDowngrade = (plan) => {
    setSelectedPlan(plan);
    setCancelDialog(true);
  };

  const confirmDowngrade = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      const response = await changeSubscriptionPlan(selectedPlan.name);
      setCurrentPlan(selectedPlan.name);
      setSubscriptionPlan(selectedPlan.name);
      setSnackbar({
        open: true,
        message:
          response.message ||
          `Successfully changed to ${selectedPlan.displayName}!`,
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to change plan",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setCancelDialog(false);
      setSelectedPlan(null);
    }
  };

  return (
    <Container>
      <Box>
        <PageHeader title="Available Plans" />
        <Grid container spacing={3} sx={{ mt: 3 }}>
          {plans.map((plan) => (
            <Grid size={{ xs: 12, md: 4 }} key={plan.name}>
              <Card
                sx={{
                  height: "100%",
                  position: "relative",
                  overflow: "visible",
                  border: plan.current ? 2 : 1,
                  borderColor: plan.current ? "primary.main" : "divider",
                  ...(plan.popular && {
                    zIndex: 1,
                  }),
                }}
              >
                {plan.popular && (
                  <Chip
                    label="Most Popular"
                    color="primary"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 9,
                    }}
                  />
                )}
                <CardContent
                  sx={{
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      {plan.displayName}
                      {currentPlan === plan.name && (
                        <Chip
                          label="Current Plan"
                          color="primary"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                    <Typography
                      variant="bodySm"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {plan.description}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                      {plan.price}
                    </Typography>
                    <Typography variant="bodySm" color="text.secondary">
                      {plan.period}
                    </Typography>
                  </Box>

                  <List sx={{ flexGrow: 1, p: 0 }}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Check color="#0bb050" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="bodySm">{feature}</Typography>
                          }
                        />
                      </ListItem>
                    ))}
                    {plan.limitations.map((limitation, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <X size={16} color="red" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="bodySm" color="text.secondary">
                              {limitation}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Box sx={{ mt: 2 }}>
                    {currentPlan === plan.name ? (
                      <Button variant="outlined" fullWidth disabled>
                        Current Plan
                      </Button>
                    ) : currentPlan === "free" && plan.name !== "free" ? (
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<ArrowUp size={16} />}
                        onClick={() => handleUpgrade(plan)}
                        disabled={loading}
                      >
                        {plan.name === "enterprise" ? "Contact Sales" : "Upgrade"}
                      </Button>
                    ) : currentPlan !== "free" && plan.name === "free" ? (
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        startIcon={<ArrowDown size={16} />}
                        onClick={() => handleDowngrade(plan)}
                        disabled={loading}
                      >
                        Downgrade to Free
                      </Button>
                    ) : currentPlan !== "free" &&
                      plan.name !== "free" &&
                      plan.name !== currentPlan ? (
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={
                          getPlanLevel(plan.name) > getPlanLevel(currentPlan) ? (
                            <ArrowUp size={16} />
                          ) : (
                            <ArrowDown size={16} />
                          )
                        }
                        onClick={() => handleUpgrade(plan)}
                        disabled={loading}
                      >
                        {getPlanLevel(plan.name) > getPlanLevel(currentPlan) ? "Upgrade" : "Change Plan"}
                      </Button>
                    ) : null}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Upgrade Dialog */}
      <Dialog
        open={upgradeDialog}
        onClose={() => setUpgradeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle variant="h4">
          {selectedPlan && `Change to ${selectedPlan.displayName}`}
        </DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box>
              <Typography variant="bodyMd">
                You're about to change to the {selectedPlan.displayName} plan
                for <strong>{selectedPlan.price}</strong> {selectedPlan.period}.
              </Typography>
              <Alert severity="info" sx={{ my: 2 }}>
                <Typography variant="bodySm">
                  Your new plan will be active immediately, and you'll be
                  charged a prorated amount for the remainder of your current
                  billing cycle.
                </Typography>
              </Alert>
              <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
                What you'll get:
              </Typography>
              <List sx={{ p: 0 }}>
                {selectedPlan.features.slice(0, 4).map((feature, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Check color="#0bb050" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="bodyMd">{feature}</Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialog(false)}>Cancel</Button>
          <Button
            onClick={confirmUpgrade}
            variant="contained"
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm Change"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Downgrade Dialog */}
      <Dialog
        open={cancelDialog}
        onClose={() => setCancelDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change to Free Plan</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="bodySm">
              Are you sure you want to downgrade to the Free plan? You'll lose
              access to premium features immediately.
            </Typography>
          </Alert>
          <Typography variant="bodySm">
            Your account will be downgraded to the Free plan and you'll lose
            access to:
          </Typography>
          <List sx={{ mt: 1 }}>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <X size={16} color="red" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="bodySm">Advanced analytics</Typography>
                }
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <X size={16} color="red" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="bodySm">Priority support</Typography>
                }
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <X size={16} color="red" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="bodySm">Additional storage</Typography>
                }
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>
            Keep Current Plan
          </Button>
          <Button
            onClick={confirmDowngrade}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? "Processing..." : "Downgrade to Free"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default MembershipPage;
