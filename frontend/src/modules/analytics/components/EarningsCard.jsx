import { Typography, Card, CardContent, Box, Grid } from "@mui/material";

const EarningsCard = ({ analytics }) => {
  const earnings = analytics?.user_earnings;

  // Don't show the card if user has no expenses
  if (!earnings?.has_expenses) {
    return null;
  }

  return (
    <Grid size={{ xs: 12 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 2, mt: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
            Your Earnings
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="bodySm"
                color="text.primary"
                sx={{ fontWeight: 500 }}
              >
                TOTAL EARNINGS
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                ${earnings?.total_earnings?.toLocaleString() || "0.00"}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="bodySm"
                color="text.primary"
                sx={{ fontWeight: 500 }}
              >
                EXPENSE ASSIGNMENTS
              </Typography>
              <Typography
                variant="bodySm"
                fontWeight="bold"
                color="primary.main"
              >
                {earnings?.expense_count || "0"}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default EarningsCard;
