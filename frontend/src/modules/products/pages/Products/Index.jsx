import { Spinner } from "react-bootstrap";
import { useProducts } from "../../contexts/ProductsContext";
import { Box, Grid, Typography, TextField, InputAdornment } from "@mui/material";
import { Shredder, Search } from "lucide-react";
import PageHeader from "../../../common/components/PageHeader";
import ProductCard from "../../components/ProductCard";
import { useState, useMemo } from "react";

const Products = () => {
  const { products, loading } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchTerm.trim()) return products;
    
    return products.filter(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const searchBar = (
    <TextField
      size="small"
      placeholder="Search products..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search size={20} color="var(--color-subtle)" />
          </InputAdornment>
        ),
      }}
      sx={{
        minWidth: 250,
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'background.paper',
        }
      }}
    />
  );

  return (
    <>
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" />
        </div>
      ) : products?.length > 0 ? (
        <>
          <PageHeader title="Products" appendActions={searchBar} />
          <Grid container spacing={3}>
            {filteredProducts?.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </Grid>
          {filteredProducts?.length === 0 && searchTerm && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "200px",
                mt: 4,
              }}
            >
              <Search size={60} color="var(--color-subtle)" />
              <Typography sx={{ mt: 1, color: "text.secondary" }}>
                No products found matching "{searchTerm}"
              </Typography>
            </Box>
          )}
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
