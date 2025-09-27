import { Box, Button, Grid, Typography } from "@mui/material";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { SourceItem } from "./SourceItem";
import { MissingSourcesPlaceholder } from "../../sources/components/MissingSourcesPlaceholder";

export const LinkedSourcesSection = ({ sources, loading }) => {
  const navigate = useNavigate();

  return (
    <Box>
       <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 5,
          mt: 5,
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
        <MissingSourcesPlaceholder />
      )}
    </Box>
  );
};
