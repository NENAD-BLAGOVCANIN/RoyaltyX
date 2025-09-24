import { Line } from "react-chartjs-2";
import { useState } from "react";
import { EyeSlash, Palette } from "react-bootstrap-icons";
import { useSettings } from "../../common/contexts/SettingsContext";
import { GraphColorPalette } from "./GraphColorPalette";
import { useExpenses } from "../../expenses/api/expenses";
import {
  Typography,
  IconButton,
  Box,
  Grid,
  Menu,
  MenuItem,
  Card,
  CardContent,
} from "@mui/material";
import { InfoPopover } from "../../common/components/InfoPopover";
import { EllipsisVertical } from "lucide-react";
import {
  getBaseLineChartOptions,
  getBaseLineDataset,
  formatChartLabels,
  CHART_CONFIGS,
} from "../../common/config/chartConfig";

const ROIOverTime = ({ analytics, productId = null }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { setShowROIOverTime } = useSettings();
  const [showGraphColorPalette, setShowGraphColorPalette] = useState(false);
  const { setRoiOverTimeGraphColor, roiOverTimeGraphColor } = useSettings();
  const { expenses } = useExpenses();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const onSelectColor = (color) => {
    setRoiOverTimeGraphColor(color);
  };

  if (!analytics || !analytics.time_stats)
    return <Typography>Loading...</Typography>;

  const granularity = analytics.granularity || "monthly";
  const timeStats = analytics.time_stats;

  // Filter expenses based on productId if provided
  const filteredExpenses = productId
    ? (expenses || []).filter(
        (expense) => expense.product_id === parseInt(productId)
      )
    : expenses || [];

  // Calculate total expenses for a given earnings amount
  const calculateTotalExpenses = (earnings) => {
    let totalExpenseAmount = 0;

    filteredExpenses.forEach((expense) => {
      if (expense.type === "static") {
        totalExpenseAmount += parseFloat(expense.value);
      } else if (expense.type === "percentage") {
        totalExpenseAmount += (parseFloat(expense.value) / 100) * earnings;
      }
    });

    return totalExpenseAmount;
  };

  const labels = formatChartLabels(timeStats, granularity);

  // Calculate total earnings and expenses first
  const totalEarnings = timeStats.reduce((sum, item) => {
    return sum + (item.royalty_revenue || 0) + (item.impression_revenue || 0);
  }, 0);

  const totalExpenses = calculateTotalExpenses(totalEarnings);
  const totalROI = totalEarnings - totalExpenses;

  // Calculate ROI for each time period using proportional expense distribution
  const roiData = timeStats.map((item) => {
    const periodEarnings =
      (item.royalty_revenue || 0) + (item.impression_revenue || 0);
    // Distribute expenses proportionally based on earnings
    const periodExpenseRatio =
      totalEarnings > 0 ? periodEarnings / totalEarnings : 0;
    const periodExpenses = totalExpenses * periodExpenseRatio;
    return periodEarnings - periodExpenses;
  });
  const defaultROIColor =
    totalROI > 0 ? "#28a745" : totalROI < 0 ? "#dc3545" : "#6c757d";

  const data = {
    labels,
    datasets: [
      getBaseLineDataset(
        "ROI",
        roiData,
        roiOverTimeGraphColor || defaultROIColor
      ),
    ],
  };

  const options = getBaseLineChartOptions(CHART_CONFIGS.currency);

  return (
    <>
      <Grid size={{ xs: 12, md: 6 }} sx={{ mt: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ width: "100%", maxWidth: "1200px", margin: "auto" }}>
              <Box
                sx={{
                  pb: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      textTransform: "uppercase",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      color: "text.secondary",
                    }}
                  >
                    ROI
                  </Typography>
                  <InfoPopover text="Shows your Return on Investment over time, calculated as total royalty revenue minus the expenses you may have added on the Expenses page. If you didn't include any expenses, the ROI value will be the same as the Total Revenue value." />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <IconButton onClick={handleMenuOpen} size="sm">
                    <EllipsisVertical size={16} color="var(--color-text)" />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        setShowROIOverTime(false);
                        handleMenuClose();
                      }}
                      sx={{ py: 1 }}
                    >
                      <EyeSlash style={{ marginRight: 8 }} />
                      Hide
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setShowGraphColorPalette(true);
                        handleMenuClose();
                      }}
                      sx={{ py: 1 }}
                    >
                      <Palette style={{ marginRight: 8 }} />
                      Customize color
                    </MenuItem>
                  </Menu>
                </Box>
              </Box>

              {/* Total ROI Display */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "2.5rem",
                    color: "text.primary",
                  }}
                >
                  $
                  {totalROI.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
              </Box>

              <Line data={data} options={options} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <GraphColorPalette
        showGraphColorPalette={showGraphColorPalette}
        setShowGraphColorPalette={setShowGraphColorPalette}
        onSelectColor={onSelectColor}
      />
    </>
  );
};

export default ROIOverTime;
