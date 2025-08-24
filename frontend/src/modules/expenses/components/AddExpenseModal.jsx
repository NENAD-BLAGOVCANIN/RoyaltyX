import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { useExpenses, useExpenseFormData, useExpense } from "../api/expenses";

const AddExpenseModal = ({ open, onClose, onExpenseCreated, editingExpense }) => {
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    type: "static",
    user: "",
    product: "",
  });
  
  const { createExpense, creating } = useExpenses();
  const { members, products, loading: dataLoading, error: dataError } = useExpenseFormData();
  const { updateExpense, updating } = useExpense(editingExpense?.id);
  
  const [error, setError] = useState(null);
  const loading = creating || updating;

  useEffect(() => {
    if (open) {
      if (editingExpense) {
        setFormData({
          name: editingExpense.name,
          value: editingExpense.value,
          type: editingExpense.type,
          user: editingExpense.user,
          product: editingExpense.product,
        });
      } else {
        setFormData({
          name: "",
          value: "",
          type: "static",
          user: "",
          product: "",
        });
      }
      setError(null);
    }
  }, [open, editingExpense]);

  useEffect(() => {
    if (dataError) {
      setError(dataError);
    }
  }, [dataError]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Expense name is required");
      return false;
    }
    if (!formData.value || parseFloat(formData.value) <= 0) {
      setError("Value must be greater than 0");
      return false;
    }
    if (formData.type === "percentage" && parseFloat(formData.value) > 100) {
      setError("Percentage value cannot exceed 100%");
      return false;
    }
    if (!formData.user) {
      setError("Please select a project member");
      return false;
    }
    if (!formData.product) {
      setError("Please select a product");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setError(null);

      const expenseData = {
        name: formData.name.trim(),
        value: parseFloat(formData.value),
        type: formData.type,
        user: formData.user,
        product: formData.product,
      };

      if (editingExpense) {
        await updateExpense(expenseData);
      } else {
        await createExpense(expenseData);
      }

      onExpenseCreated();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      value: "",
      type: "static",
      user: "",
      product: "",
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingExpense ? "Edit Expense" : "Add New Expense"}
      </DialogTitle>
      <DialogContent>
        {dataLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ pt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Expense Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Marketing fee"
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => handleInputChange("type", e.target.value)}
                >
                  <MenuItem value="static">Static Amount</MenuItem>
                  <MenuItem value="percentage">Percentage</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Value"
                type="number"
                value={formData.value}
                onChange={(e) => handleInputChange("value", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {formData.type === "percentage" ? "%" : "$"}
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  min: 0,
                  max: formData.type === "percentage" ? 100 : undefined,
                  step: "0.01",
                }}
              />
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Project Member</InputLabel>
              <Select
                value={formData.user}
                label="Project Member"
                onChange={(e) => handleInputChange("user", e.target.value)}
              >
                {members.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Product</InputLabel>
              <Select
                value={formData.product}
                label="Product"
                onChange={(e) => handleInputChange("product", e.target.value)}
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || dataLoading}
        >
          {loading ? (
            <CircularProgress size={20} />
          ) : (
            editingExpense ? "Update" : "Create"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddExpenseModal;
