import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import DateRangeSelector from "../../common/components/DateRangeSelector";
import { createReport } from "../api/reports";
import { getReportTemplates } from "../api/report-templates";
import { toast } from "react-toastify";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button as MuiButton,
} from "@mui/material";
import PageHeader from "../../common/components/PageHeader";

const CreateNewReport = () => {
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  useEffect(() => {
    setPeriodStart(params.get("period_start") || "");
    setPeriodEnd(params.get("period_end") || "");
  }, [location.search]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await getReportTemplates();
        setTemplates(response);
      } catch (error) {
        toast.error("Failed to load templates.");
      }
    };
    fetchTemplates();
  }, []);

  const handleCreateReport = async () => {
    const payload = {
      period_start: periodStart,
      period_end: periodEnd,
      template: selectedTemplate || null,
    };

    try {
      await createReport(payload);
      navigate("/reports");
      toast.success("Successfully generated a new report!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Generate Report"
        action={<DateRangeSelector />}
        description="Before submitting this request, make sure to select the time range for
        which the details in the report should apply. If you don't select any
        time range, then the details in the report will be based on data from
        all time."
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <FormControl
          fullWidth
          margin="normal"
          sx={{ minWidth: 300, width: "50%" }}
        >
          <InputLabel id="template-label">Select Report Template</InputLabel>
          <Select
            labelId="template-label"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            label="Select Report Template"
          >
            <MenuItem
              onClick={() => navigate("/report-templates/create")}
              sx={{
                borderTop: '1px solid #eee',
                color: 'primary.main',
                fontWeight: 500,
              }}
            >
              Create new template
            </MenuItem>
            {templates.map((template) => (
              <MenuItem key={template.id} value={template.id}>
                {template.template_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <MuiButton
          variant="outlined"
          onClick={() => navigate("/report-templates/create")}
          sx={{ mt: -1 }}
        >
          + Create New Template
        </MuiButton>

        <MuiButton
          variant="contained"
          color="primary"
          onClick={handleCreateReport}
          sx={{ mt: 3 }}
          disabled={!selectedTemplate}
        >
          Submit Request
        </MuiButton>
      </Box>
    </Box>
  );
};

export default CreateNewReport;
