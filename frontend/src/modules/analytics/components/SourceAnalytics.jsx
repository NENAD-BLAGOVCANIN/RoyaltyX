import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  capitalize,
} from "@mui/material";
import youtubeLogo from "../../common/assets/img/platform_logos/youtube.webp";
import tiktokLogo from "../../common/assets/img/platform_logos/tiktok.webp";
import twitchLogo from "../../common/assets/img/platform_logos/twitch.webp";
import vimeoLogo from "../../common/assets/img/platform_logos/vimeo.webp";

export const SourceAnalytics = ({ analytics }) => {
  const getPlatformLogo = (platform) => {
    switch (platform) {
      case "youtube":
        return youtubeLogo;
      case "tiktok":
        return tiktokLogo;
      case "twitch":
        return twitchLogo;
      case "vimeo":
        return vimeoLogo;
      default:
        return youtubeLogo;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("en-US").format(number);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
        Source Analytics
      </Typography>
      {!analytics?.source_analytics ||
      analytics.source_analytics.length === 0 ? (
        <Card sx={{ p: 3 }} variant="outlined">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              No source data available for the selected period.
            </Typography>
          </Box>
        </Card>
      ) : (
        <Card sx={{ p: 0 }} variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Source
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight="bold">
                      Platform
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight="bold">
                      Products
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight="bold">
                      Impressions
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight="bold">
                      Impression Revenue
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight="bold">
                      Sales
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight="bold">
                      Royalty Revenue
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight="bold">
                      Total Revenue
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.source_analytics.map((source) => {
                  const totalRevenue =
                    source.analytics.total_impression_revenue +
                    source.analytics.total_royalty_revenue;

                  return (
                    <TableRow key={source.id} hover>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <img
                            src={getPlatformLogo(source.platform)}
                            alt={`${source.platform} Logo`}
                            style={{ height: "24px", objectFit: "contain" }}
                          />
                          <Typography variant="body2" fontWeight="medium">
                            {source.account_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={capitalize(source.platform_display)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatNumber(source.analytics.product_count)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatNumber(source.analytics.total_impressions)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main">
                          {formatCurrency(
                            source.analytics.total_impression_revenue
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box>
                          <Typography variant="body2">
                            {formatNumber(source.analytics.total_sales_count)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main">
                          {formatCurrency(
                            source.analytics.total_royalty_revenue
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="success.main"
                        >
                          {formatCurrency(totalRevenue)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
};
