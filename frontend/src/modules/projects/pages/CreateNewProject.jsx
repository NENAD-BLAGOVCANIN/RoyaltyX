import { useState, useEffect, useRef } from "react";
import { saveProject } from "../api/project";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../common/components/Button";
import { Typography, TextField, Box } from "@mui/material";

function CreateNewProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);

    try {
      await saveProject(formData);

      setName("");
      setDescription("");

      navigate("/");
      toast.success("Successfully added a new project!");
    } catch (error) {
      toast.error(error.message);
    }

    setLoading(false);
  };

  return (
    <div>
      <Box
        sx={{
          maxWidth: 750,
          margin: "auto",
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div className="px-5 w-100">
          <Typography variant="h2" sx={{ mt: 10, mb: 1, fontWeight: 600 }}>
            Create new project
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Empower your projects with ease. Streamline creation and management
            effortlessly.
          </Typography>
          <br />
          <br />

          {error && <span className="text-danger small">{error}</span>}

          <TextField
            label="Name *"
            variant="outlined"
            fullWidth
            margin="normal"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            inputRef={nameInputRef}
          />

          <TextField
            label="Description (optional)"
            variant="outlined"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="pt-4">
            <Button variant="primary" onClick={handleSubmit} loading={loading}>
              Save
            </Button>
          </div>
        </div>
      </Box>
    </div>
  );
}

export default CreateNewProject;
