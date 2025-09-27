import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router";
import { Box, Button, Grid, Typography } from "@mui/material";
import { ArrowRight, Shredder } from "lucide-react";
import ProductCard from "../../products/components/ProductCard";

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
        <Grid
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            justifyContent: "center",
            mt: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 10,
            }}
          >
            <Shredder size={60} color="var(--color-subtle)" />
            <Typography sx={{ mt: 1, color: "text.secondary" }}>
              No products available at the moment.
            </Typography>
          </Box>
        </Grid>
      )}
    </>
  );
};
