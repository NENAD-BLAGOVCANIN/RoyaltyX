import { Typography, Card, CardContent, Box, Grid } from "@mui/material";

const GeneralStatsCard = ({ analytics, showProductCount = false }) => {
  return (
    <Grid size={{ md: 6, xs: 12 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 2, mt: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
            General Stats
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
                variant="body2"
                color="text.primary"
                sx={{ fontWeight: 500 }}
              >
                IMPRESSIONS
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                color="primary.main"
              >
                {analytics?.total_impressions?.toLocaleString() || "0"}
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
                variant="body2"
                color="text.primary"
                sx={{ fontWeight: 500 }}
              >
                REVENUE FROM IMPRESSIONS
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                color="primary.main"
              >
                ${analytics?.total_impression_revenue?.toLocaleString() || "0"}
              </Typography>
            </Box>
            {showProductCount && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{ fontWeight: 500 }}
                >
                  PRODUCTS
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="primary.main"
                >
                  {analytics?.product_count?.toLocaleString() || "0"}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default GeneralStatsCard;
