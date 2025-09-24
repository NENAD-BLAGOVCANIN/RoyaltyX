import { Line } from "react-chartjs-2";
import { useState } from "react";
import { EyeSlash, Palette } from "react-bootstrap-icons";
import { useSettings } from "../../common/contexts/SettingsContext";
import { GraphColorPalette } from "./GraphColorPalette";
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
  getChartTitle,
  CHART_CONFIGS,
} from "../../common/config/chartConfig";

const RentalsOverTime = ({ analytics }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { setShowRentalsOverTime } = useSettings();
  const [showGraphColorPalette, setShowGraphColorPalette] = useState(false);
  const { setRentalsOverTimeGraphColor, rentalsOverTimeGraphColor } =
    useSettings();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const onSelectColor = (color) => {
    setRentalsOverTimeGraphColor(color);
  };

  if (!analytics || !analytics.time_stats)
    return <Typography>Loading...</Typography>;

  const granularity = analytics.granularity || "monthly";
  const rentalsData = analytics.time_stats;

  const labels = formatChartLabels(rentalsData, granularity);
  const dataValues = rentalsData.map((item) => item.rentals);
  const chartTitle = getChartTitle("rentals", granularity);

  const data = {
    labels,
    datasets: [
      getBaseLineDataset(chartTitle, dataValues, rentalsOverTimeGraphColor),
    ],
  };

  const options = getBaseLineChartOptions(CHART_CONFIGS.standard);

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
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      color: 'text.secondary'
                    }}
                  >
                    RENTALS
                  </Typography>
                  <InfoPopover text="Shows the total number of content rentals over time, tracking how often your content is rented by users" />
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
                        setShowRentalsOverTime(false);
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
              
              {/* Total Value Display */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: '2.5rem',
                    color: 'text.primary'
                  }}
                >
                  {dataValues.reduce((sum, value) => sum + (value || 0), 0).toLocaleString()}
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

export default RentalsOverTime;
