import { useState, useEffect } from "react";
import Papa from "papaparse";
import { toast } from "react-toastify";
import { uploadFile, deleteFile } from "../api/files";
import CsvViewer from "../../common/components/CsvViewer/CsvViewer";
import { ReactComponent as GoogleSheetsIcon } from "../../common/assets/img/vectors/google_sheets_icon.svg";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography
} from "@mui/material";
import { X } from "lucide-react";

const ViewFileModal = ({ csvData, selectedFile, handleCloseModal, setFiles }) => {
  const [editableData, setEditableData] = useState([]);

  useEffect(() => {
    if (csvData) {
      setEditableData(JSON.parse(JSON.stringify(csvData)));
    }
  }, [csvData]);

  const handleCellChange = (rowIndex, key, newValue) => {
    const updated = [...editableData];
    updated[rowIndex] = { ...updated[rowIndex], [key]: newValue };
    setEditableData(updated);
  };

  const handleSave = async () => {
    try {
      const csvString = Papa.unparse(editableData);
      
      // Convert CSV string into a Blob and File
      const blob = new Blob([csvString], { type: "text/csv" });
      const updatedFile = new File([blob], selectedFile.name, { type: "text/csv" });
      
      await deleteFile(selectedFile.id);
      const { file: newFile } = await uploadFile(updatedFile);

      setFiles((prevFiles) => [
        ...prevFiles.filter((f) => f.id !== selectedFile.id),
        newFile,]);
        
      toast.success("Successfully updated file!");
      handleCloseModal();
    } catch (err) {
      console.error(err);
      toast.error("Error: " + err.message);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={handleCloseModal}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <GoogleSheetsIcon style={{ marginRight: '8px' }} />
            <Typography variant="h6">{selectedFile?.name}</Typography>
          </Box>
          <IconButton
            onClick={handleCloseModal}
            size="small"
            aria-label="close"
          >
            <X />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        <CsvViewer data={editableData} onCellChange={handleCellChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseModal} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewFileModal;
