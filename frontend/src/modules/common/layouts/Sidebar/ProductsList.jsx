import { Link } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  CircularProgress,
} from "@mui/material";
import { apiUrl } from "../../api/config";
import { ReactComponent as ProductThumbnailPlaceholder } from "../../assets/img/vectors/product-thumbnail-placeholder.svg";
import { useProducts } from "../../../products/contexts/ProductsContext";

const ProductsList = () => {
  const { products, loading } = useProducts();

  return (
    <Box sx={{ px: 2 }}>
      {products?.length > 0 && (
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            px: 2,
            py: 1,
            display: 'block',
          }}
        >
          PRODUCTS
        </Typography>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {products?.map((product) => (
            <ListItem key={product.id} disablePadding>
              <ListItemButton
                component={Link}
                to={`/products/${product.id}`}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 50 }}>
                  {product.thumbnail ? (
                    <Box
                      component="img"
                      sx={{
                        width: 45,
                        height: 35,
                        objectFit: 'cover',
                        borderRadius: 1,
                      }}
                      src={(() => {
                        const url = product.thumbnail.replace("/media/", "");
                        if (url.startsWith("https")) {
                          return decodeURIComponent(url).replace("https", "http");
                        } else {
                          return apiUrl + product.thumbnail;
                        }
                      })()}
                      alt={product.title}
                    />
                  ) : (
                    <ProductThumbnailPlaceholder
                      style={{ width: 35, height: 30 }}
                    />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={product.title}
                  primaryTypographyProps={{ 
                    variant: 'bodySm', 
                    fontWeight: 500,
                    noWrap: true 
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ProductsList;
