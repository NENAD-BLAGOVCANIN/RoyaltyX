import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router";
import { Box, Button, Grid, Typography } from "@mui/material";
import { ArrowRight } from "lucide-react";
import ProductCard from "../../products/components/ProductCard";
import { MissingProductsPlaceholder } from "../../products/components/MissingProductsPlaceholder";

export const ProductsList = ({ products, loading }) => {
  const navigate = useNavigate();

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          mt: 6,
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 600 }}>
          Products
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/products")}>
          View All <ArrowRight className="ms-2" />
        </Button>
      </Box>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" />
        </div>
      ) : products?.length > 0 ? (
        <Grid container spacing={3}>
          {products?.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </Grid>
      ) : (
        <MissingProductsPlaceholder />
      )}
    </>
  );
};
