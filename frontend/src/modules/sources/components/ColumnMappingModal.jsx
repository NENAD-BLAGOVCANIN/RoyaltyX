import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { confirmColumnMappings, getExpectedFields } from "../api/files";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert
} from "@mui/material";

const ColumnMappingModal = ({ 
  open, 
  onClose, 
  fileData, 
  onMappingConfirmed 
}) => {
  const [mappings, setMappings] = useState({});
  const [expectedFields, setExpectedFields] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && fileData) {
      // Initialize mappings with suggested mappings
      setMappings(fileData.suggested_mappings || {});
      
      // Fetch expected fields
      fetchExpectedFields();
    }
  }, [open, fileData]);

  const fetchExpectedFields = async () => {
    try {
      const response = await getExpectedFields();
      setExpectedFields(response.fields);
    } catch (error) {
      console.error("Error fetching expected fields:", error);
      toast.error("Failed to load expected fields");
    }
  };

  const handleMappingChange = (expectedField, csvColumn) => {
    setMappings(prev => ({
      ...prev,
      [expectedField]: csvColumn === "" ? null : csvColumn
    }));
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const response = await confirmColumnMappings(fileData.file.id, mappings);
      toast.success(response.report.message);
      onMappingConfirmed(response);
      onClose();
    } catch (error) {
      // Handle validation errors with more detailed messaging
      const errorMessage = error.message;
      if (errorMessage.includes(";")) {
        // Multiple validation errors - show them as a list
        const errors = errorMessage.split(";").map(err => err.trim());
        toast.error(
          <div>
            <strong>Validation Errors:</strong>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              {errors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>,
          { autoClose: 8000 }
        );
      } else {
        toast.error("Error: " + errorMessage, { autoClose: 6000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const getUsedColumns = () => {
    return Object.values(mappings).filter(col => col !== null && col !== "");
  };

  const isColumnUsed = (column, currentField) => {
    const usedColumns = getUsedColumns();
    return usedColumns.includes(column) && mappings[currentField] !== column;
  };

  const getRequiredFields = () => {
    const required = new Set(['title']); // Always required
    
    // Check if sales data will be created
    const salesIndicators = ['unit_price', 'quantity', 'royalty_amount'];
    const hasSalesData = salesIndicators.some(field => mappings[field]);
    
    if (hasSalesData) {
      required.add('unit_price');
      required.add('unit_price_currency');
      required.add('quantity');
      required.add('royalty_amount');
      required.add('royalty_currency');
      required.add('period_start');
      required.add('period_end');
    }
    
    // Check if impressions data will be created
    const impressionIndicators = ['impressions', 'ecpm'];
    const hasImpressionData = impressionIndicators.some(field => mappings[field]);
    
    if (hasImpressionData) {
      required.add('period_start');
      required.add('period_end');
    }
    
    return required;
  };

  const isFieldRequired = (fieldKey) => {
    return getRequiredFields().has(fieldKey);
  };

  if (!fileData) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        Map CSV Columns to Expected Fields
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          File: {fileData.file.name}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          Please map the columns from your CSV file to the expected fields in our system. 
          We've automatically suggested mappings based on column names, but you can adjust them as needed.
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Column Mappings
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Expected Field</strong></TableCell>
                  <TableCell><strong>CSV Column</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expectedFields.map((field) => (
                  <TableRow 
                    key={field.key}
                    sx={{
                      backgroundColor: isFieldRequired(field.key) && !mappings[field.key] 
                        ? 'rgba(255, 152, 0, 0.08)' 
                        : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {field.label}
                        </Typography>
                        {isFieldRequired(field.key) && (
                          "*"
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <FormControl 
                        fullWidth 
                        size="small"
                        error={isFieldRequired(field.key) && !mappings[field.key]}
                      >
                        <InputLabel>Select Column</InputLabel>
                        <Select
                          value={mappings[field.key] || ""}
                          onChange={(e) => handleMappingChange(field.key, e.target.value)}
                          label="Select Column"
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {fileData.csv_headers.map((header) => (
                            <MenuItem 
                              key={header} 
                              value={header}
                              disabled={isColumnUsed(header, field.key)}
                            >
                              {header}
                              {isColumnUsed(header, field.key) && (
                                <Chip 
                                  label="Used" 
                                  size="small" 
                                  color="warning" 
                                  sx={{ ml: 1 }} 
                                />
                              )}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {field.description}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {fileData.csv_preview && fileData.csv_preview.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              CSV Preview (First 5 rows)
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {fileData.csv_headers.map((header) => (
                      <TableCell key={header}>
                        <strong>{header}</strong>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fileData.csv_preview.map((row, index) => (
                    <TableRow key={index}>
                      {fileData.csv_headers.map((header) => (
                        <TableCell key={header}>
                          {row[header] || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? "Processing..." : "Confirm Mappings & Process File"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnMappingModal;
