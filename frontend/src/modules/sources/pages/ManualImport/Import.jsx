import { useState, useEffect } from "react";
import Papa from "papaparse";
import FileUploadInput from "../../components/FileUploadInput";
import PageHeader from "../../../common/components/PageHeader";
import { apiUrl } from "../../../common/api/config";
import { Download, Trash2 } from "lucide-react";
import ViewFileModal from "../../components/ViewFileModal";
import { ReactComponent as GoogleSheetsIcon } from "../../../common/assets/img/vectors/google_sheets_icon.svg";
import { Link } from "react-router-dom";
import { getFiles } from "../../../management/api/files";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography
} from "@mui/material";

const ImportData = () => {
  const [files, setFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

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

  return (
    <div className="py-3">
      <PageHeader
        title="Manual Data Import"
        description="Manage your data sources and reports from different platforms all in one place."
      />

      <FileUploadInput setFiles={setFiles} />

      {files.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h6" sx={{ pb: 3 }}>
            Uploaded Files
          </Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="uploaded files table">
              <TableHead>
                <TableRow>
                  <TableCell>File Name</TableCell>
                  <TableCell>Uploaded At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file) => (
                  <TableRow
                    key={file.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {file.name}
                    </TableCell>
                    <TableCell>
                      {new Date(file.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          onClick={() => handleOpenCsvViewer(file)}
                          aria-label="view file"
                        >
                          <GoogleSheetsIcon />
                        </IconButton>
                        <IconButton
                          component="a"
                          href={apiUrl + file.file}
                          aria-label="download file"
                        >
                          <Download size={20} />
                        </IconButton>
                        <IconButton
                          component={Link}
                          to={`/management/data/${file.id}/delete`}
                          aria-label="delete file"
                          sx={{ color: 'error.main' }}
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
    </div>
  );
};

export default ImportData;
