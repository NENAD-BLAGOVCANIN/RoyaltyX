import {
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useExpenses } from "../../expenses/api/expenses";
import { useProject } from "../../common/contexts/ProjectContext";

const ExpenseListCard = ({ productId = null, title = "All Expenses" }) => {
  const { expenses, loading, error } = useExpenses();
  const { currentUserRole } = useProject();

  // Only show this component to project owners
  if (currentUserRole !== "owner") {
    return null;
  }

  const filteredExpenses = productId
    ? expenses?.filter(
        (expense) => expense.product_id === parseInt(productId)
      ) || []
    : expenses || [];


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
      <Grid size={{ xs: 12 }}>
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
            >
              <CircularProgress />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid size={{ xs: 12 }}>
        <Card sx={{ borderRadius: 2, boxShadow: 2, mt: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Alert severity="error">Failed to load expenses: {error}</Alert>
          </CardContent>
        </Card>
      </Grid>
    );
  }

  // Don't show the card if no expenses
  if (filteredExpenses.length === 0) {
    return null;
  }

  return (
    <Grid size={{ xs: 12 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 2, mt: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            {title}
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Name
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Value
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Type
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Member
                    </Typography>
                  </TableCell>
                  {!productId && (
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Product
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Created
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {expense.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
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
                          expense.type === "percentage"
                            ? "primary"
                            : "secondary"
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {expense.user_name}
                      </Typography>
                    </TableCell>
                    {!productId && (
                      <TableCell>
                        <Typography variant="body2">
                          {expense.product_title}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(expense.created_at)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Typography variant="body2" color="text.secondary">
              Total expenses: {filteredExpenses.length}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default ExpenseListCard;
