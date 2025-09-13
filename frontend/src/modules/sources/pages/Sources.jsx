import { useState } from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import PageHeader from "../../common/components/PageHeader";
import { useSources, useUserProjectRole } from "../api/sources";
import { SourceItem } from "../components/SourceItem";
import { AddSourceModal } from "../components/AddSourceModal";
import { WifiOff } from "react-bootstrap-icons";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { useProducts } from "../../products/contexts/ProductsContext";

export const Sources = () => {
  const { sources, createSource, loading } = useSources();
  const { canAddSources, loading: roleLoading } = useUserProjectRole();
  const { refetch: refetchProducts } = useProducts();
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleCreateSource = async (source) => {
    await createSource(source);    
    await refetchProducts();
    
    handleCloseModal();
  };

  return (
    <Box>
      <PageHeader
        title="Sources"
        description="Manage your data sources and link your platforms of choice."
        action={
          canAddSources && !roleLoading ? (
            <Box sx={{display: "flex", gap: 3}}>
              <Button
                variant="outlined"
                onClick={() => navigate("/sources/manual-import")}
                sx={{ whiteSpace: "nowrap" }}
              >
                <Plus size={20} style={{ marginRight: 10 }} /> Manually import data
              </Button>
              <Button
                variant="contained"
                onClick={handleOpenModal}
                sx={{ whiteSpace: "nowrap" }}
              >
                <Plus size={20} style={{ marginRight: 10 }} /> Add source
              </Button>
            </Box>
          ) : null
        }
      />

      <Grid container spacing={4} sx={{ mt: 4 }}>
        {sources.map((source) => (
          <SourceItem key={source.id} source={source} />
        ))}

        {sources.length === 0 && !loading && (
          <Grid
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "60vh",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WifiOff size={80} color="var(--color-subtle)" />
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", mb: 2, mt: 1 }}
            >
              {canAddSources ? "No sources connected." : "No sources connected. Contact your project owner to add sources."}
            </Typography>
            {canAddSources && !roleLoading && (
              <Button
                variant="contained"
                onClick={handleOpenModal}
                sx={{ whiteSpace: "nowrap" }}
              >
                <Plus size={20} style={{ marginRight: 10 }} /> Add source
              </Button>
            )}
          </Grid>
        )}
      </Grid>

      <AddSourceModal
        open={modalOpen}
        onClose={handleCloseModal}
        createSource={handleCreateSource}
      />
    </Box>
  );
};
