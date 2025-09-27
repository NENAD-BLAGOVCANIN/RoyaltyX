import { Typography } from "@mui/material";
import { SPACING } from "../../common/constants/spacing";
import { useTheme } from "../../common/contexts/ThemeContext";

export const MissingProductsPlaceholder = () => {
  const { colors } = useTheme();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: SPACING.xl,
        width: "100%",
        borderRadius: "6px",
        border: "1px dashed" + colors.border.secondary,
      }}
    >
      <Typography
        variant="h2"
        sx={{
          color: "text.secondary",
          mb: SPACING.md,
        }}
      >
        No Products yet
      </Typography>

      <Typography
        variant="bodyMd"
        sx={{
          color: "text.secondary",
          maxWidth: "500px",
          lineHeight: 1.6,
        }}
      >
        No products have been added to this project yet. Add a new source or
        manually import a structured file (CSV) to manage your products.
      </Typography>
    </div>
  );
};
