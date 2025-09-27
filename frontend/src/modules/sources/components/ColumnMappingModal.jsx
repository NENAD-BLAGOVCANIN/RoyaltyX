import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { confirmColumnMappings, getExpectedFields } from "../api/files";
import { useProducts } from "../../products/contexts/ProductsContext";
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
  const { refetch: refetchProducts } = useProducts();

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
      await refetchProducts();
      
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
    // Base required fields for any import
    const required = new Set(['title', 'period_start', 'period_end']);
    
    // Check if sales data will be created
    const salesIndicators = ['unit_price', 'quantity', 'royalty_amount'];
    const hasSalesData = salesIndicators.some(field => mappings[field]);
    
    if (hasSalesData) {
      required.add('unit_price');
      required.add('quantity');
      required.add('royalty_amount');
    }
    
    // Check if impressions data will be created
    const impressionIndicators = ['impressions', 'ecpm'];
    const hasImpressionData = impressionIndicators.some(field => mappings[field]);
    
    if (hasImpressionData) {
      required.add('impressions');
    }
    
    return required;
  };

  const isFieldRequired = (fieldKey) => {
    return getRequiredFields().has(fieldKey);
  };

  const getFieldRequirementType = (fieldKey) => {
    // Base required fields
    const baseRequired = ['title', 'period_start', 'period_end'];
    if (baseRequired.includes(fieldKey)) {
      return 'required';
    }

    // Check if user has mapped any sales-related fields
    const salesIndicators = ['unit_price', 'quantity', 'royalty_amount'];
    const hasSalesData = salesIndicators.some(field => mappings[field]);
    
    // Sales-specific required fields - show chip if ANY sales field is mapped
    const salesFields = ['unit_price', 'quantity', 'royalty_amount'];
    if (salesFields.includes(fieldKey) && hasSalesData) {
      return 'sales';
    }

    // Check if user has mapped any impression-related fields
    const impressionIndicators = ['impressions', 'ecpm'];
    const hasImpressionData = impressionIndicators.some(field => mappings[field]);
    
    // Impressions-specific required fields - show chip if ANY impression field is mapped
    const impressionFields = ['impressions'];
    if (impressionFields.includes(fieldKey) && hasImpressionData) {
      return 'impressions';
    }

    // Show potential requirement chips for unmapped fields
    // This helps users understand what would be required if they choose certain data types
    
    // Show "Required for Sales" on sales fields even if not mapped, 
    // but only if no sales data is currently mapped (to avoid confusion)
    if (salesFields.includes(fieldKey) && !hasSalesData) {
      return 'potential-sales';
    }

    // Show "Required for Impressions" on impression fields even if not mapped,
    // but only if no impression data is currently mapped
    if (impressionFields.includes(fieldKey) && !hasImpressionData) {
      return 'potential-impressions';
    }

    return null;
  };

  const getRequirementChip = (fieldKey) => {
    const requirementType = getFieldRequirementType(fieldKey);
    
    // Debug logging
    console.log(`Field: ${fieldKey}, Requirement Type: ${requirementType}`, { mappings });
    
    if (requirementType === 'required') {
      return (
        <Chip 
          label="Required" 
          size="small" 
          color="error" 
          variant="outlined"
        />
      );
    } else if (requirementType === 'sales') {
      return (
        <Chip 
          label="Required for Sales" 
          size="small" 
          color="warning" 
          variant="outlined"
        />
      );
    } else if (requirementType === 'impressions') {
      return (
        <Chip 
          label="Required for Impressions" 
          size="small" 
          color="info" 
          variant="outlined"
        />
      );
    } else if (requirementType === 'potential-sales') {
      return (
        <Chip 
          label="Required for Sales" 
          size="small" 
          color="warning" 
          variant="outlined"
          sx={{ opacity: 0.7 }}
        />
      );
    } else if (requirementType === 'potential-impressions') {
      return (
        <Chip 
          label="Required for Impressions" 
          size="small" 
          color="info" 
          variant="outlined"
          sx={{ opacity: 0.7 }}
        />
      );
    }
    
    return null;
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
        <Typography variant="bodySm" color="text.secondary" sx={{ mt: 1 }}>
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
                        <Typography variant="bodySm" fontWeight="medium">
                          {field.label}
                        </Typography>
                        {getRequirementChip(field.key)}
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
                      <Typography variant="bodySm" color="text.secondary">
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
