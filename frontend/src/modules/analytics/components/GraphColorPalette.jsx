import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  useTheme,
} from "@mui/material";
import { X } from "lucide-react";

export const GraphColorPalette = ({
  showGraphColorPalette,
  setShowGraphColorPalette,
  onSelectColor,
}) => {
  const colors = [
    "#6CC3E0",
    "#009efd",
    "#0055CC",
    "#5E4DB2",
    "#9F8FEF",
    "#4BCE97",
    "#94C748",
    "#216E4E",
    "#E2B203",
    "#FEA362",
    "#Ff0000",
    "#Ff0168",
    "#F87168",
    "#AE2E24",
    "#E774BB",
    "#FFFFFF",
    "#D3D3D3",
    "#808080",
    "#404040",
    "#000000",
  ];
  const theme = useTheme();

  return (
    <Dialog
      open={showGraphColorPalette}
      onClose={() => setShowGraphColorPalette(false)}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 300,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 3,
        }}
      >
        <Typography variant="h5">Pick color</Typography>
        <IconButton
          onClick={() => setShowGraphColorPalette(false)}
          size="small"
        >
          <X />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1, pb: 3 }}>
        <Grid
          container
          spacing={4}
          sx={{ pt: 2, pb: 2 }}
          justifyContent="space-between"
        >
          {colors.map((color) => (
            <Grid
              item
              xs={2.4}
              key={color}
              display="flex"
              justifyContent="center"
            >
              <Box
                component="button"
                onClick={() => {
                  onSelectColor(color);
                }}
                sx={{
                  backgroundColor: color,
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: `2px solid ${theme.palette.divider}`,
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.1)",
                    boxShadow: theme.shadows[4],
                  },
                  "&:focus": {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2,
                  },
                  padding: 0,
                  margin: 0,
                }}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
