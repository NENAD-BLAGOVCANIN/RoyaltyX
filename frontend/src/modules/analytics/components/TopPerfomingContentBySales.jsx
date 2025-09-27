import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { getTopPerformingProductsBySales } from "../../products/api/product";
import { toast } from "react-toastify";

export const TopPerfomingContentBySales = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchTopPerformingProducts = async () => {
      try {
        const fetchedProducts = await getTopPerformingProductsBySales();
        setProducts(fetchedProducts);
      } catch (error) {
        toast.error(error.message || "Failed to fetch analytics");
      }
    };

    fetchTopPerformingProducts();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
        Top Performing Content (by sales)
      </Typography>
      {!products || products.length === 0 ? (
        <Card sx={{ p: 3 }} variant="outlined">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <Typography variant="bodyMd" sx={{ color: "text.secondary" }}>
              No content data available for sales.
            </Typography>
          </Box>
        </Card>
      ) : (
        <Card sx={{ p: 0, mb: 5 }} variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Rank
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Title
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight="bold">
                      Revenue
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product, index) => {
                  const totalSales = product.sales.reduce(
                    (sum, sale) => sum + Number(sale.royalty_amount),
                    0
                  );
                  return (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Typography variant="bodySm" fontWeight="medium">
                          {index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="bodySm">{product.title}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="bodySm" color="success.main">
                          {formatCurrency(totalSales)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
};
