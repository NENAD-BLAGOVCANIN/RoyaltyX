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
import { getTopPerformingProductsByImpressions } from "../../products/api/product";
import { toast } from "react-toastify";

export const TopPerfomingContentByImpressions = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchTopPerformingProducts = async () => {
      try {
        const fetchedProducts = await getTopPerformingProductsByImpressions();
        setProducts(fetchedProducts);
      } catch (error) {
        toast.error(error.message || "Failed to fetch analytics");
      }
    };

    fetchTopPerformingProducts();
  }, []);

  const formatNumber = (number) => {
    return new Intl.NumberFormat("en-US").format(number);
  };

  return (
    <Box>
      <Typography variant="h2" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
        Top Performing Content (by impressions)
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
              No content data available for impressions.
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
                      Impressions
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product, index) => {
                  const totalImpressions = product.impressions.reduce(
                    (sum, impression) => sum + impression.impressions,
                    0,
                  );
                  return (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Typography variant="bodySm" fontWeight="medium">
                          {index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="bodySm">
                          {product.title}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="bodySm">
                          {formatNumber(totalImpressions)}
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
