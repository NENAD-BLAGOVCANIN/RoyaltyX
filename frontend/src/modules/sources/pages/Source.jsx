import { useNavigate, useParams } from "react-router-dom";
import { useSource } from "../api/source";
import { toast } from "react-toastify";

import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Card,
  CardContent,
} from "@mui/material";
import { useState } from "react";

export const Source = () => {
  const { sourceId } = useParams();
  const { source, loading, deleteSource, updateSource, updating } = useSource(sourceId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await deleteSource(sourceId);
      toast.success("Source deleted successfully");
      navigate("/sources");
    } catch (error) {
      toast.error("Failed to delete source");
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = source.status === 'active' ? 'paused' : 'active';
      const updatedSource = await updateSource({ status: newStatus });
      if (updatedSource) {
        toast.success(`Source ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
      }
    } catch (error) {
      toast.error("Failed to update source status");
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!source && !loading) {
    return (
      <Container>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }} color="error">
          Source not found
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <Box>
        <Typography
          variant="h2"
          sx={{ mb: 3, mt: 2, fontWeight: 600 }}
          gutterBottom
        >
          {source.account_name}
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography
                  variant="h5"
                  sx={{ mb: 3, fontWeight: 600 }}
                  gutterBottom
                >
                  Details
                </Typography>
                <Typography variant="subtitle1" fontWeight={500}>
                  Platform
                </Typography>
                <Typography variant="body1">
                  {source.platform || "Unknown"}
                </Typography>
                <Typography variant="subtitle1" fontWeight={500} sx={{ mt: 2 }}>
                  Account name
                </Typography>
                <Typography variant="body1">
                  {source.account_name || "Unknown"}
                </Typography>
                <Typography variant="subtitle1" fontWeight={500} sx={{ mt: 2 }}>
                 Imported videos
                </Typography>
                <Typography variant="body1">
                  {source.imported_video_count || "0"}
                </Typography>
                <Typography variant="subtitle1" fontWeight={500} sx={{ mt: 2 }}>
                  Created At
                </Typography>
                <Typography variant="body1">
                  {new Date(source.created_at).toLocaleString()}
                </Typography>
                <Typography variant="subtitle1" fontWeight={500} sx={{ mt: 2 }}>
                  Last Fetched At
                </Typography>
                <Typography variant="body1">
                  {source.last_fetched_at
                    ? new Date(source.last_fetched_at).toLocaleString()
                    : "Never"}
                </Typography>
                <Typography variant="subtitle1" fontWeight={500} sx={{ mt: 2 }}>
                  Fetch Frequency
                </Typography>
                <Typography variant="body1">24 hours</Typography>
                <Typography variant="subtitle1" fontWeight={500} sx={{ mt: 2 }}>
                  Status
                </Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                  {source.status || 'active'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography
                  variant="h5"
                  sx={{ mb: 3, fontWeight: 600 }}
                  gutterBottom
                >
                  Actions
                </Typography>
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setConfirmOpen(true)}
                  >
                    Delete Source
                  </Button>
                  <Button 
                    variant="outlined" 
                    color={source.status === 'active' ? 'warning' : 'success'}
                    onClick={handleToggleStatus}
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : (source.status === 'active' ? 'Pause Source' : 'Activate Source')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogContent>
          <Typography variant="h4">Confirm Deletion</Typography>
          <DialogContentText sx={{ py: 3 }}>
            Are you sure you want to delete this data source? This action cannot
            be undone.
          </DialogContentText>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};
