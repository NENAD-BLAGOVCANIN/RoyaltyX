import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardMedia,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  CardContent,
  Grid,
} from "@mui/material";
import { Inventory2 } from "@mui/icons-material";
import { Edit3, BarChart2, EllipsisVertical } from "lucide-react";
import { apiUrl } from "../../common/api/config";
import { useState } from "react";

const ProductCard = ({ product }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Grid size={{ md: 4, xs: 12 }} key={product.id}>
      <Card 
        variant="outlined" 
        xs={{ borderRadius: 3 }}
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {product.thumbnail ? (
          <CardMedia
            component="img"
            image={(() => {
              const url = product.thumbnail.replace("/media/", "");
              if (url.startsWith("https")) {
                return decodeURIComponent(url).replace("https", "http");
              } else {
                return apiUrl + product.thumbnail;
              }
            })()}
            alt={product.title}
            sx={{ borderRadius: 1, height: 180, objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 180,
              backgroundColor: "grey.300",
              borderRadius: 1,
            }}
          >
            <Inventory2
              sx={{
                fontSize: 64,
                color: "grey.400",
              }}
            />
          </Box>
        )}
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography
              component={Link}
              to={"/products/" + product.id}
              variant="h6"
              sx={{
                textDecoration: "none",
                color: "inherit",
                fontWeight: "bold",
              }}
            >
              {product.title}
            </Typography>

            <div>
              <IconButton
                sx={{
                  margin: 0,
                  padding: 0,
                  py: 2,
                  ml: 2,
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                }}
                onClick={handleMenuOpen}
              >
                <EllipsisVertical size={20} color="var(--color-text)" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem
                  onClick={() => {
                    navigate(`/products/${product.id}/edit`);
                    handleMenuClose();
                  }}
                >
                  <Edit3 size={16} style={{ marginRight: 15 }} /> Edit
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate(`/products/${product.id}/analytics`);
                    handleMenuClose();
                  }}
                >
                  <BarChart2 size={16} style={{ marginRight: 15 }} /> Analytics
                </MenuItem>
              </Menu>
            </div>
          </Box>

          <Typography 
            variant="body2" 
            color="textSecondary" 
            sx={{ 
              mt: 2,
              minHeight: '2.5em', // Reserve space for at least 2 lines
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.description || "No description available"}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default ProductCard;
