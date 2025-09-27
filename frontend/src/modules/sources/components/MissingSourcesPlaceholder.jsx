import { Typography } from "@mui/material";
import { SPACING } from "../../common/constants/spacing";
import Button from "../../common/components/Button";
import { useTheme } from "../../common/contexts/ThemeContext";
import { Plus } from "lucide-react";

export const MissingSourcesPlaceholder = ({
  handleOpenModal,
  canAddSources,
}) => {
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
        No Sources Connected yet
      </Typography>

      <Typography
        variant="bodyMd"
        sx={{
          color: "text.secondary",
          maxWidth: "500px",
          lineHeight: 1.6,
        }}
      >
        No sources have been connected for this project yet. Click the button
        below to connect your first source.
      </Typography>

      {canAddSources && (
        <Button
          variant="contained"
          onClick={handleOpenModal}
          sx={{ whiteSpace: "nowrap", fontWeight: 600, mt: SPACING.lg }}
        >
          <Plus size={20} style={{ marginRight: 10 }} /> Add source
        </Button>
      )}
    </div>
  );
};
