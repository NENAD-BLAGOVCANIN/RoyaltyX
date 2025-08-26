import { useEffect, useState } from "react";
import { getReports } from "../api/reports";
import { getReportTemplates } from "../api/report-templates";
import { apiUrl } from "../../common/api/config";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import PageHeader from "../../common/components/PageHeader";
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
  Tooltip,
  Tabs,
  Tab,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `reports-tab-${index}`,
    'aria-controls': `reports-tabpanel-${index}`,
  };
}

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for tab parameter in URL
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setTabValue(parseInt(tabParam, 10));
    }
  }, [location.search]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await getReports();
        setReports(response);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    const fetchTemplates = async () => {
      try {
        const response = await getReportTemplates();
        setTemplates(response);
      } catch (error) {
        console.error("Error fetching report templates:", error);
      }
    };

    fetchReports();
    fetchTemplates();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <PageHeader
        title="Reports"
        description="This is a page where you will be able to see reports and report templates specific to this product."
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="reports tabs"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500,
              minWidth: 'auto',
              px: 0,
              mr: 4,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#1976d2',
              height: 3,
            },
          }}
        >
          <Tab label="Reports" {...a11yProps(0)} />
          <Tab label="Report Templates" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <div className="mb-3">
          <Button variant="contained" onClick={() => navigate("/reports/create")}>
            Request a new report
          </Button>
        </div>

        <TableContainer sx={{ mt: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="reports table">
            <TableHead>
              <TableRow>
                <TableCell>Filename</TableCell>
                <TableCell>Period Start</TableCell>
                <TableCell>Period End</TableCell>
                <TableCell>Requested by</TableCell>
                <TableCell>Created at</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow
                  key={report.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {report.filename}
                  </TableCell>
                  <TableCell>{report.period_start}</TableCell>
                  <TableCell>{report.period_end}</TableCell>
                  <TableCell>{report?.created_by?.username}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(report.created_at), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => {
                        window.location.href = apiUrl + report.file;
                      }}
                      download
                    >
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
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
      </TabPanel>
    </Box>
  );
};

export default Reports;
