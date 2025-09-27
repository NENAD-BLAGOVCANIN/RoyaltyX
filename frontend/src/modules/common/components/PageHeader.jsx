import { Box, Typography } from "@mui/material";

const PageHeader = ({ title, description, appendActions }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}
    >
      <Box
        style={{
          gap: "14px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          maxWidth: 500,
        }}
      >
        {typeof title === "string" ? (
          <Typography variant="h1">{title}</Typography>
        ) : (
          title
        )}
        {description && (
          <Typography variant="bodyMd" component="p">
            {description}
          </Typography>
        )}
      </Box>
      {appendActions && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {appendActions}
        </Box>
      )}
    </Box>
  );
};


export default PageHeader;