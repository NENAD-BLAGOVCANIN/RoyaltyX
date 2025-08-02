import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, TextField, useTheme } from "@mui/material";

const DateRangeSelector = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Max");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const periods = [
    { label: "5D", value: "5D" },
    { label: "1M", value: "1M" },
    { label: "6M", value: "6M" },
    { label: "1Y", value: "1Y" },
    { label: "5Y", value: "5Y" },
    { label: "Max", value: "Max" },
    { label: "Custom", value: "Custom" },
  ];

  // Function to update URL params
  const updateURLParams = (start, end, period) => {
    const params = new URLSearchParams(location.search);

    if (period === "Max") {
      params.delete("period_start");
      params.delete("period_end");
    } else if (start && end) {
      params.set("period_start", start.toLocaleDateString("en-CA"));
      params.set("period_end", end.toLocaleDateString("en-CA"));
    }

    navigate(`${location.pathname}?${params.toString()}`);
  };

  const calculateDateRange = (period) => {
    const today = new Date();
    let startDate, endDate = today;

    switch (period) {
      case "5D":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 5);
        break;
      case "1M":
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "6M":
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 6);
        break;
      case "1Y":
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case "5Y":
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 5);
        break;
      case "Max":
        return [null, null];
      default:
        return [null, null];
    }

    return [startDate, endDate];
  };

  const handlePeriodClick = (period) => {
    setSelectedPeriod(period);
    if (period !== "Custom") {
      const [start, end] = calculateDateRange(period);
      updateURLParams(start, end, period);
    }
  };

  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      updateURLParams(startDate, endDate, "Custom");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const start = params.get("period_start");
    const end = params.get("period_end");

    if (start && end) {
      setCustomStartDate(start);
      setCustomEndDate(end);
      
      // Try to determine which period this corresponds to
      const startDate = new Date(start);
      
      // Check if it matches any predefined period exactly
      const [calculatedStart] = calculateDateRange("5D");
      const [calculatedStart1M] = calculateDateRange("1M");
      const [calculatedStart6M] = calculateDateRange("6M");
      const [calculatedStart1Y] = calculateDateRange("1Y");
      const [calculatedStart5Y] = calculateDateRange("5Y");
      
      if (calculatedStart && Math.abs(startDate - calculatedStart) < 86400000) {
        setSelectedPeriod("5D");
      } else if (calculatedStart1M && Math.abs(startDate - calculatedStart1M) < 86400000) {
        setSelectedPeriod("1M");
      } else if (calculatedStart6M && Math.abs(startDate - calculatedStart6M) < 86400000) {
        setSelectedPeriod("6M");
      } else if (calculatedStart1Y && Math.abs(startDate - calculatedStart1Y) < 86400000) {
        setSelectedPeriod("1Y");
      } else if (calculatedStart5Y && Math.abs(startDate - calculatedStart5Y) < 86400000) {
        setSelectedPeriod("5Y");
      } else {
        setSelectedPeriod("Custom");
      }
    } else {
      setSelectedPeriod("Max");
      setCustomStartDate("");
      setCustomEndDate("");
    }
  }, [location.search]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "4px",
          overflow: "hidden",
          backgroundColor: "transparent",
        }}
      >
        {periods.map((period, index) => (
          <Box key={period.value} sx={{ display: "flex", alignItems: "center" }}>
            <Box
              component="button"
              onClick={() => handlePeriodClick(period.value)}
              sx={{
                border: "none",
                background: "none",
                padding: "8px 12px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                color: selectedPeriod === period.value ? "#1976d2" : "#5f6368",
                backgroundColor: "transparent",
                transition: "color 0.2s ease",
                "&:hover": {
                  color: selectedPeriod === period.value ? "#1976d2" : "#202124",
                },
                "&:focus": {
                  outline: "none",
                },
              }}
            >
              {period.label}
            </Box>
            {index < periods.length - 1 && (
              <Box
                sx={{
                  width: "1px",
                  height: "20px",
                  backgroundColor: "divider",
                }}
              />
            )}
          </Box>
        ))}
      </Box>
      
      {selectedPeriod === "Custom" && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            type="date"
            label="Start Date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            onBlur={handleCustomDateChange}
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "13px",
              },
              "& input[type='date']::-webkit-calendar-picker-indicator": {
                filter: theme.palette.mode === "dark" ? "invert(1)" : "invert(0)",
                cursor: "pointer",
              },
            }}
          />
          <TextField
            type="date"
            label="End Date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            onBlur={handleCustomDateChange}
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "13px",
              },
              "& input[type='date']::-webkit-calendar-picker-indicator": {
                filter: theme.palette.mode === "dark" ? "invert(1)" : "invert(0)",
                cursor: "pointer",
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default DateRangeSelector;
