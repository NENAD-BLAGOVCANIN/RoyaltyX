import { useEffect, useState } from "react";
import { getReportTemplates } from "../../api/report-templates";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import PageHeader from "../../../common/components/PageHeader";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const ReportTemplates = () => {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await getReportTemplates();
        setTemplates(response);
      } catch (error) {
        console.error("Error fetching report templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  const navigate = useNavigate();

  return (
    <div className="py-3">
      <PageHeader
        title="Report Templates"
        description="This is a page where you will be able to create, read, update and delete report templates specific to this
        product."
      />

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/report-templates/create")}
        >
          Create new Template
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="report templates table">
          <TableHead>
            <TableRow>
              <TableCell>Template name</TableCell>
              <TableCell>Created by</TableCell>
              <TableCell>Created at</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((template) => (
              <TableRow
                key={template.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {template.template_name}
                </TableCell>
                <TableCell>{template?.created_by?.email}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(template.created_at), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit template">
                      <IconButton
                        component={Link}
                        to={`/report-templates/${template.id}/edit`}
                        color="primary"
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete template">
                      <IconButton
                        component={Link}
                        to={`/report-templates/${template.id}/delete`}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ReportTemplates;
