import { Spinner } from "react-bootstrap";
import { useProducts } from "../../api/products";
import { Box, Grid, Typography } from "@mui/material";
import { Shredder } from "lucide-react";
import PageHeader from "../../../common/components/PageHeader";
import ProductCard from "../../components/ProductCard";

const Products = () => {
  const { products, loading } = useProducts();

  return (
    <>
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" />
        </div>
      ) : products?.length > 0 ? (
        <>
          <PageHeader title="Products" />
          <Grid container spacing={3}>
            {products?.map((product) => (
              <ProductCard product={product} />
            ))}
          </Grid>
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100vh - 130px)",
          }}
        >
          <Shredder size={60} color="var(--color-subtle)" />
          <Typography sx={{ mt: 1, color: "text.secondary" }}>
            No products available at the moment.
          </Typography>
        </Box>
      )}
    </>
  );
};

export default Products;
