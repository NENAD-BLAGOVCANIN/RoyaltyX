import { useParams, useNavigate } from "react-router-dom";
import { useProduct } from "../api/product";
import { Container, Spinner } from "react-bootstrap";
import { ReactComponent as ProductThumbnailPlaceholder } from "../../common/assets/img/vectors/product-thumbnail-placeholder-lg.svg";
import { apiUrl } from "../../common/api/config";
import {
  Typography,
  Box,
  Button as MUIButton,
  Card,
  CardContent,
  capitalize,
} from "@mui/material";
import { ChartColumn, SquarePen } from "lucide-react";

const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { product } = useProduct(id);

  if (!product) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <div className="mt-3">
      <div className="row">
        <div className="col-md-7">
          <Typography variant="h2" sx={{ fontWeight: "bold", mb: 2 }}>
            {product.title}
          </Typography>

          <Typography variant="body1" color="textSecondary">
            {product.description || "No description available."}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, my: 3 }}>
            <MUIButton
              variant="contained"
              color="primary"
              onClick={() => navigate(`/products/${id}/analytics`)}
            >
              <ChartColumn style={{ marginRight: 10 }} /> View Analytics
            </MUIButton>
            <MUIButton
              variant="outlined"
              onClick={() => navigate(`/products/${id}/edit`)}
            >
              <SquarePen style={{ marginRight: 10 }} /> Edit Details
            </MUIButton>
          </Box>

          <Card sx={{ mt: 5, borderRadius: 3, boxShadow: 1 }}>
            <CardContent style={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Product Metadata
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <span style={{ fontWeight: 500, paddingRight: 6 }}>Type:</span>
                Video
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <span style={{ fontWeight: 500, paddingRight: 6 }}>
                  Platform:
                </span>
                {capitalize(product?.source?.platform || "Unknown")}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <span style={{ fontWeight: 500, paddingRight: 6 }}>
                  Author:
                </span>
                Unknown
              </Typography>
              <Typography variant="body1">
                <span style={{ fontWeight: 500, paddingRight: 6 }}>
                  Created at:
                </span>
                {Date(product.created_at)}
              </Typography>
            </CardContent>
          </Card>
        </div>
        <div className="col-md-5">
          <div className="px-3">
            {product.thumbnail ? (
              <div>
                <img
                  className="w-100"
                  style={{ objectFit: "cover", maxHeight: 220, height: "auto" }}
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
              </div>
            ) : (
              <div className="card-img-top text-center">
                <ProductThumbnailPlaceholder />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
