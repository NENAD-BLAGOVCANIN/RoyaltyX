import { useEffect, useState } from 'react';
import { apiUrl } from "../../../common/api/config";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
} from '@mui/material';

export default function ReportTemplateForm({
  initialData = {},
  onSubmit,
  buttonLabel = "Create",
}) {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    template_name: '',
    title: '',
    logo: null,
    address: '',
    include_sales_revenue: true,
    include_impressions: true,
    include_impressions_revenue: true,
    ...initialData,
  });
  
  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...initialData }));
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrors({});
      await onSubmit(formData);
    } catch (error) {
      setErrors(error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, mx: 'auto', my: 3 }}>
      <Typography variant="h3" mb={2}>Report Template</Typography>

      <TextField
        required
        fullWidth
        label="Template Name"
        name="template_name"
        value={formData.template_name}
        onChange={handleChange}
        error={Boolean(errors.template_name)}
        helperText={errors.template_name} 
        margin="normal"
      />

      <TextField
        fullWidth
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={Boolean(errors.title)}
        helperText={errors.title} 
        margin="normal"
      />

      <TextField
        fullWidth
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        error={Boolean(errors.address)}
        helperText={errors.address} 
        margin="normal"
      />
      {formData.logo && (
        <Box mt={2} sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 1,
        }}>
          <Typography variant="bodySm" gutterBottom>Logo Preview:</Typography>
          <img
            src={
              typeof formData.logo === "string"
                ? formData.logo.startsWith("http")
                  ? formData.logo
                  : `${apiUrl}${formData.logo}` // handle relative media paths
                : URL.createObjectURL(formData.logo) // File object preview
            }
            alt="Report logo"
            style={{ maxHeight: 100, borderRadius: 4 }}
          />
        </Box>
      )}
      <Button variant="outlined" component="label" sx={{ mt: 2, mr: 2 }}>
        Upload Logo
        <input
          type="file"
          name="logo"
          hidden
          onChange={handleChange}
          accept="image/*"
        />
      </Button>
      {errors.logo && <Typography variant="bodySm" color="error" sx={{ mt: 1 }}>{errors.logo[0]}</Typography>}

      <Box sx={{ display: "flex", flexDirection: "column", mt: 2, gap: 1 }}>

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.include_sales_revenue}
              onChange={handleChange}
              name="include_sales_revenue"
            />
          }
          label="Include Sales Revenue"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.include_impressions}
              onChange={handleChange}
              name="include_impressions"
            />
          }
          label="Include Impressions"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.include_impressions_revenue}
              onChange={handleChange}
              name="include_impressions_revenue"
            />
          }
          label="Include Impressions Revenue"
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
        {buttonLabel}
        </Button>
      </Box>
    </Box>
  );
}
