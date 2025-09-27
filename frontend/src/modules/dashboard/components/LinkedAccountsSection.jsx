import { Box, Button, Grid, Typography } from "@mui/material";
import { ArrowRight, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { SourceItem } from "./SourceItem";

export const LinkedAccountsSection = ({ sources, loading }) => {
  const navigate = useNavigate();

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 5,
          mb: 5,
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 600 }}>
          Sources
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/sources")}>
          View All <ArrowRight className="ms-2" />
        </Button>
      </Box>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" />
        </div>
      ) : sources?.length > 0 ? (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {sources.map((source, index) => (
            <SourceItem source={source} key={index} />
          ))}
        </Grid>
      ) : (
        <Grid
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            justifyContent: "center",
            mt: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 10,
            }}
          >
            <WifiOff size={60} color="var(--color-subtle)" />
            <Typography sx={{ mt: 1, color: "text.secondary" }}>
              No sources linked yet.
            </Typography>
          </Box>
        </Grid>
      )}
    </Box>
  );
};
