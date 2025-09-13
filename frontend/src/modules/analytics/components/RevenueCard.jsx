import { RevenueChart } from "./RevenueChart";
import { useState } from "react";
import { EyeSlash, Palette } from "react-bootstrap-icons";
import { useSettings } from "../../common/contexts/SettingsContext";
import { GraphColorPalette } from "./GraphColorPalette";
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
} from "@mui/material";
import { EllipsisVertical, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const RevenueCard = ({ analytics }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { setShowTotalRevenueCard } = useSettings();
  const [showGraphColorPalette, setShowGraphColorPalette] = useState(false);
  const { setrevenueGraphColor } = useSettings();
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const onSelectColor = (color) => {
    setrevenueGraphColor(color);
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
                Revenue in last 5 months
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
                      setShowTotalRevenueCard(false);
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
            <Box sx={{ position: "relative", mb: 3, pl: 1 }}>
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
              <Typography variant="h1" sx={{ fontWeight: "bold", pl: 2 }}>
                {analytics?.total_royalty_revenue?.toLocaleString()}
              </Typography>
            </Box>

            <RevenueChart analytics={analytics} />

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
