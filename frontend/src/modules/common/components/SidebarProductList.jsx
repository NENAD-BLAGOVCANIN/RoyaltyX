import { Link } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Avatar,
} from "@mui/material";
import { Inventory2 } from "@mui/icons-material";
import { useProducts } from "../../products/contexts/ProductsContext";
import { apiUrl } from "../api/config";

const SidebarProductList = () => {
  const { products, loading } = useProducts();

  if (loading || !products || products.length === 0) {
    return null;
  }

  // Show maximum 10 products
  const displayProducts = products.slice(0, 10);

  return (
    <Box sx={{ px: 2, pb: 2 }}>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          px: 2,
          pt: 2,
          pb: 1,
          display: "block",
        }}
      >
        Products
      </Typography>
      
      <List sx={{ p: 0 }}>
        {displayProducts.map((product) => (
          <ListItem key={product.id} disablePadding>
            <ListItemButton
              component={Link}
              to={`/products/${product.id}`}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                py: 1,
                px: 2,
                minHeight: 48,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <Avatar
                src={
                  product.thumbnail
                    ? (() => {
                        const url = product.thumbnail.replace("/media/", "");
                        if (url.startsWith("https")) {
                          return decodeURIComponent(url).replace("https", "http");
                        } else {
                          return apiUrl + product.thumbnail;
                        }
                      })()
                    : undefined
                }
                sx={{
                  width: 32,
                  height: 32,
                  mr: 2,
                  backgroundColor: "grey.300",
                }}
              >
                {!product.thumbnail && (
                  <Inventory2
                    sx={{
                      fontSize: 16,
                      color: "grey.500",
                    }}
                  />
                )}
              </Avatar>
              
              <ListItemText
                primary={product.title}
                primaryTypographyProps={{
                  variant: "body2",
                  noWrap: true,
                  sx: {
                    fontWeight: 500,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default SidebarProductList;
