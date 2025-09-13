import { useState, useEffect } from "react";
import Papa from "papaparse";
import FileUploadInput from "../../components/FileUploadInput";
import ColumnMappingModal from "../../components/ColumnMappingModal";
import PageHeader from "../../../common/components/PageHeader";
import { apiUrl } from "../../../common/api/config";
import { Download, Trash2 } from "lucide-react";
import ViewFileModal from "../../components/ViewFileModal";
import { ReactComponent as GoogleSheetsIcon } from "../../../common/assets/img/vectors/google_sheets_icon.svg";
import { Link } from "react-router-dom";
import { getFiles } from "../../api/files";
import { useProject } from "../../../common/contexts/ProjectContext";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Typography,
  Chip,
  Alert,
  AlertTitle,
} from "@mui/material";

const ImportData = () => {
  const [files, setFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Column mapping modal state
  const [showColumnMappingModal, setShowColumnMappingModal] = useState(false);
  const [pendingFileData, setPendingFileData] = useState(null);

  // Get current user role from project context
  const { currentUserRole } = useProject();
  const isOwner = currentUserRole === "owner";

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await getFiles();
        setFiles(response);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);

  const handleOpenCsvViewer = async (file) => {
    try {
      const response = await fetch(apiUrl + file.file);
      const text = await response.text();
      const parsedData = Papa.parse(text, {
        header: true,
        dynamicTyping: true,
      }).data;
      setCsvData(parsedData);
      setSelectedFile(file);
      setShowModal(true);
    } catch (error) {
      console.error("Error reading the CSV file:", error);
      alert("There was an error parsing the file.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCsvData([]);
  };

  const handleFileUploaded = (fileData) => {
    setPendingFileData(fileData);
    setShowColumnMappingModal(true);
  };

  const handleMappingConfirmed = (response) => {
    // Add the processed file to the files list
    setFiles((prevFiles) => [response.file, ...prevFiles]);
    setPendingFileData(null);
  };

  const handleCloseColumnMappingModal = () => {
    setShowColumnMappingModal(false);
    setPendingFileData(null);
  };

  const getFileStatusChip = (file) => {
    if (file.is_processed) {
      return <Chip label="Processed" color="success" size="small" />;
    } else {
      return <Chip label="Pending Mapping" color="warning" size="small" />;
    }
  };

  // Show access denied message for non-owners
  if (!isOwner) {
    return (
      <div className="py-3">
        <PageHeader
          title="Manual Data Import"
          description="Upload CSV files and map columns to import your data. Our smart mapping system will suggest the best column matches."
        />

        <Alert severity="warning" sx={{ mt: 3 }}>
          <AlertTitle>Access Restricted</AlertTitle>
          <Typography>
            Only project owners can access the manual data import feature.
            Please contact your project owner to upload files or request owner
            permissions.
          </Typography>
        </Alert>
      </div>
    );
  }

  return (
    <div className="py-3">
      <PageHeader
        title="Manual Data Import"
        description="Upload CSV files and map columns to import your data. Our smart mapping system will suggest the best column matches."
      />

      <FileUploadInput
        setFiles={setFiles}
        onFileUploaded={handleFileUploaded}
      />

      {files.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h6" sx={{ pb: 3 }}>
            Uploaded Files
          </Typography>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="uploaded files table">
              <TableHead>
                <TableRow>
                  <TableCell>File Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Uploaded At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file) => (
                  <TableRow
                    key={file.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {file.name}
                    </TableCell>
                    <TableCell>{getFileStatusChip(file)}</TableCell>
                    <TableCell>
                      {new Date(file.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {file.is_processed && (
                          <IconButton
                            onClick={() => handleOpenCsvViewer(file)}
                            aria-label="view file"
                          >
                            <GoogleSheetsIcon />
                          </IconButton>
                        )}
                        <IconButton
                          component="a"
                          href={apiUrl + file.file}
                          aria-label="download file"
                        >
                          <Download size={20} />
                        </IconButton>
                        <IconButton
                          component={Link}
                          to={`/sources/manual-import/${file.id}/delete`}
                          aria-label="delete file"
                          sx={{ color: "error.main" }}
                        >
                          <Trash2 size={20} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {showModal && (
        <ViewFileModal
          csvData={csvData}
          selectedFile={selectedFile}
          handleCloseModal={handleCloseModal}
          setFiles={setFiles}
        />
      )}

      <ColumnMappingModal
        open={showColumnMappingModal}
        onClose={handleCloseColumnMappingModal}
        fileData={pendingFileData}
        onMappingConfirmed={handleMappingConfirmed}
      />
    </div>
  );
};

export default ImportData;
