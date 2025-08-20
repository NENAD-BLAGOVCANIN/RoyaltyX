import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { deleteReportTemplate, getReportTemplateById } from "../../api/report-templates";
import { Box, Button, Typography } from "@mui/material";
import { toast } from "react-toastify";

export default function DeleteReportTemplate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [initialData, setInitialData] = useState(null);
  
    useEffect(() => {
      getReportTemplateById(id).then(setInitialData).catch(() => {
        toast.error("Failed to load template.");
        navigate("/reports?tab=1");
      });
    }, [id, navigate])

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await deleteReportTemplate(id);
      toast.success("Template deleted successfully.");
      navigate("/reports?tab=1");
    } catch (err) {
      toast.error("Failed to delete template.");
    } finally {
      setLoading(false);
    }
  };
  if (!initialData) return <div>Loading...</div>;

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", my: 5, textAlign: "center" }}>
    <Typography variant="h5" mb={2}>
      Delete Report Template: {initialData.template_name}
    </Typography>
    <Typography variant="body1" mb={3}>
      Are you sure you want to proceed with the deletion?
    </Typography>

    <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 3 }}>
      <Button
        variant="contained"
        color="error"
        onClick={handleConfirmDelete}
        disabled={loading}
      >
        {loading ? "Deleting..." : "Confirm"}
      </Button>
      <Button
        variant="outlined"
        onClick={() => navigate("/reports?tab=1")}
      >
        Cancel
      </Button>
    </Box>
  </Box>
  );
}