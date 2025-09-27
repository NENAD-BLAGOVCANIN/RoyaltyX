import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useExpenses, useDeleteExpense } from "../api/expenses";
import AddExpenseModal from "../components/AddExpenseModal";
import PageHeader from "../../common/components/PageHeader";

const Expenses = () => {
  const { expenses, loading, refetch } = useExpenses();
  const { deleteExpense } = useDeleteExpense();
  const [error, setError] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  const handleAddExpense = () => {
    setEditingExpense(null);
    setAddModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setAddModalOpen(true);
  };

  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setError(null);

      await deleteExpense(expenseToDelete.id);
      await refetch(); // Refresh the list
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleModalClose = () => {
    setAddModalOpen(false);
    setEditingExpense(null);
  };

  const handleExpenseCreated = async () => {
    await refetch(); // Refresh the list after create/update
    handleModalClose();
  };

  const formatValue = (expense) => {
    if (expense.type === "percentage") {
      return `${expense.value}%`;
    }
    return `$${parseFloat(expense.value).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Expenses"
        description="Manage and track all your expenses, including their values, types, associated members, and products. Add, edit, or delete expenses as needed."
        appendActions={
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={handleAddExpense}
          >
            Add Expense
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer sx={{ mt: 3 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Member</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="bodySm" color="text.secondary">
                    No expenses found. Click "Add Expense" to create your first
                    expense.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id} hover>
                  <TableCell>
                    <Typography variant="bodySm" fontWeight="medium">
                      {expense.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="bodySm">
                      {formatValue(expense)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        expense.type === "percentage"
                          ? "Percentage"
                          : "Static Amount"
                      }
                      size="small"
                      color={
                        expense.type === "percentage" ? "primary" : "secondary"
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="bodySm">
                      {expense.user_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="bodySm">
                      {expense.product_title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="bodySm" color="text.secondary">
                      {formatDate(expense.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEditExpense(expense)}
                      sx={{ mr: 1 }}
                    >
                      <Edit size={16} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(expense)}
                      color="error"
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AddExpenseModal
        open={addModalOpen}
        onClose={handleModalClose}
        onExpenseCreated={handleExpenseCreated}
        editingExpense={editingExpense}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Expense</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{expenseToDelete?.name}"? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Expenses;
