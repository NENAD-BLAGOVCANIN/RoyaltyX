import { useState } from "react";
import { EyeSlash, Palette } from "react-bootstrap-icons";
import { useSettings } from "../../common/contexts/SettingsContext";
import { GraphColorPalette } from "./GraphColorPalette";
import { useExpenses } from "../../expenses/api/expenses";
import {
  IconButton,
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Menu,
  MenuItem,
  Button,
  Tooltip,
} from "@mui/material";
import {
  EllipsisVertical,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  getBaseLineChartOptions,
  getBaseLineDataset,
  formatChartLabels,
  CHART_CONFIGS,
} from "../../common/config/chartConfig";

export const ROICard = ({ analytics, productId = null }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { setShowROICard } = useSettings();
  const [showGraphColorPalette, setShowGraphColorPalette] = useState(false);
  const { setRoiGraphColor, roiGraphColor } = useSettings();
  const { expenses } = useExpenses();
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const onSelectColor = (color) => {
    setRoiGraphColor(color);
  };

  if (!analytics) return null;

  // Calculate total earnings (royalty + impression revenue)
  const totalEarnings =
    (analytics.total_royalty_revenue || 0) +
    (analytics.total_impression_revenue || 0);

  // Filter expenses based on productId if provided
  const filteredExpenses = productId
    ? (expenses || []).filter(
        (expense) => expense.product_id === parseInt(productId)
      )
    : expenses || [];

  // Calculate total expenses
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

  const totalExpenses = calculateTotalExpenses(totalEarnings);
  const roi = totalEarnings - totalExpenses;

  // Prepare chart data from time stats - calculate ROI per period
  const timeStats = analytics.time_stats || [];
  const chartData = timeStats.slice(-5).map((item) => {
    const periodEarnings =
      (item.royalty_revenue || 0) + (item.impression_revenue || 0);
    // For period-based ROI, we need to distribute expenses proportionally
    const periodExpenseRatio =
      totalEarnings > 0 ? periodEarnings / totalEarnings : 0;
    const periodExpenses = totalExpenses * periodExpenseRatio;
    return periodEarnings - periodExpenses;
  });

  const granularity = analytics.granularity || "monthly";
  const labels = formatChartLabels(timeStats.slice(-5), granularity);

  // Determine color based on ROI
  const roiColor = roi > 0 ? "#28a745" : roi < 0 ? "#dc3545" : "#6c757d";
  const displayColor = roiGraphColor || roiColor;

  const data = {
    labels,
    datasets: [getBaseLineDataset("ROI", chartData, displayColor)],
  };

  const options = {
    ...getBaseLineChartOptions(CHART_CONFIGS.currency),
    plugins: {
      ...getBaseLineChartOptions(CHART_CONFIGS.currency).plugins,
      legend: {
        display: false,
      },
    },
    scales: {
      ...getBaseLineChartOptions(CHART_CONFIGS.currency).scales,
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <>
      <Grid size={{ md: 4, xs: 12 }}>
        <Card
          variant="outlined"
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardContent sx={{ flexGrow: 1, pb: "12px !important" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  textTransform: "uppercase",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  color: "text.secondary",
                }}
              >
                ROI in last 5 months
              </Typography>
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
                      setShowROICard(false);
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

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box sx={{ position: "relative", pl: 1, flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    color: "text.secondary",
                    fontWeight: "normal",
                  }}
                >
                  $
                </Typography>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: "bold",
                    pl: 2,
                    color: roiColor,
                  }}
                >
                  {roi.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
                {roi > 0 ? (
                  <TrendingUp size={24} color="#28a745" />
                ) : roi < 0 ? (
                  <TrendingDown size={24} color="#dc3545" />
                ) : null}
              </Box>
            </Box>

            <Tooltip
              title={`Earnings: $${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | Expenses: $${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | ROI: $${roi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              arrow
            >
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.75rem" }}
                >
                  Earnings - Expenses = ROI
                </Typography>
              </Box>
            </Tooltip>

            {chartData.length > 0 && (
              <Box sx={{ height: 60, mb: 2 }}>
                <Line data={data} options={options} />
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="text"
                size="small"
                onClick={() => navigate("/analytics")}
                sx={{
                  textTransform: "none",
                  color: "primary.main",
                  py: 0.3,
                  fontSize: "1rem",
                }}
                endIcon={<ArrowRight size={18} />}
              >
                View details
              </Button>
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
