import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Container, Spinner, Image } from "react-bootstrap";
import { useProduct } from "../../../products/api/product";
import { apiUrl } from "../../../common/api/config";
import { ReactComponent as ProductThumbnailPlaceholder } from "../../../common/assets/img/vectors/product-thumbnail-placeholder-lg.svg";
import { Button, TextField } from "@mui/material";

const EditProduct = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const { id } = useParams();
  const { product, updateProduct } = useProduct(id);

  useEffect(() => {
    const loadInitialProductValues = () => {
      setTitle(product?.title);
      setDescription(product?.description);
      setThumbnail(product?.thumbnail);
    };

    loadInitialProductValues();
  }, [id, product]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);

      if (imageFile) {
        formData.append("thumbnail", imageFile);
      }

      await updateProduct(formData, id);
      toast.success("Product updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update product");
    }
  };

  if (!product) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <div>
      <h2 className="bold mb-4">Edit Product</h2>
      <div className="row">
        <div className="col-md-7">
          <form className="pe-5">
            <div className="mb-3">
              <TextField
                id="formProductTitle"
                variant="outlined"
                placeholder="Title"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <TextField
                id="formProductDescription"
                variant="outlined"
                fullWidth
                placeholder="Description"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button variant="contained" color="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </form>
        </div>
        <div className="col-md-5">
          {previewImage ? (
            <Image src={previewImage} alt="Product Thumbnail" fluid />
          ) : thumbnail ? (
            <Image
              src={(() => {
                const url = thumbnail.replace("/media/", "");
                if (url.startsWith("https")) {
                  return decodeURIComponent(url).replace("https", "http");
                } else {
                  return apiUrl + thumbnail;
                }
              })()}
              alt="Product Thumbnail"
              fluid
            />
          ) : (
            <div className="card card-img-top rounded-0 text-center">
              <ProductThumbnailPlaceholder />
            </div>
          )}

          <div className="mt-3">
            <label htmlFor="formProductThumbnail">Upload New Thumbnail</label>
            <input
              id="formProductThumbnail"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "block", marginTop: "8px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
