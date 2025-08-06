import { useNavigate, useParams } from "react-router";
import PageHeader from "../../../common/components/PageHeader";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { deleteFile, getFile } from "../../api/files";
import { useProject } from "../../../common/contexts/ProjectContext";
import { Lock } from "lucide-react";
import { Alert, AlertTitle, Box, Typography } from "@mui/material";

const DeleteData = () => {
  const { file_id } = useParams();
  const [file, setFile] = useState({});
  const navigate = useNavigate();
  
  // Get current user role from project context
  const { currentUserRole } = useProject();
  const isOwner = currentUserRole === 'owner';

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        const response = await getFile(file_id);
        setFile(response);
      } catch (error) {
        console.error("Error fetching files:", error);
        if (error.message.includes('403') || error.message.includes('Only project owners')) {
          toast.error("Access denied: Only project owners can access manual import files.");
          navigate("/sources/manual-import");
        }
      }
    };

    fetchFileData();
  }, [file_id, navigate]);

  const handleFileDeletion = async () => {
    try {
      await deleteFile(file_id);
      navigate("/sources/manual-import");
      toast.success("File successfully deleted!");
    } catch (error) {
      if (error.message.includes('403') || error.message.includes('Only project owners')) {
        toast.error("Access denied: Only project owners can delete manual import files.");
      } else {
        toast.error("Error deleting file: " + error.message);
      }
    }
  };

  // Show access denied message for non-owners
  if (!isOwner) {
    return (
      <div className="py-3">
        <PageHeader
          title="Delete File"
          description="Access to file deletion is restricted."
        />

        <Alert severity="warning" sx={{ mt: 3 }}>
          <AlertTitle>Access Restricted</AlertTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lock size={20} />
            <Typography>
              Only project owners can delete manual import files. Please contact your project owner if you need to delete files.
            </Typography>
          </Box>
        </Alert>
      </div>
    );
  }

  return (
    <div className="py-3">
      <PageHeader
        title={`Delete ${file.name}`}
        description="Removing the file will also remove all the data associated with the file. 
                Be careful when using this feature because you might lose your data permanently."
      />

      <p>Are you sure you want to proceed with the deletion?</p>

      <div className="d-flex mt-3">
        <div className="px-1">
          <button
            onClick={() => {
              handleFileDeletion();
            }}
            className="btn btn-danger fw-500"
          >
            Confirm
          </button>
        </div>
        <div className="px-1">
          <button className="btn btn-basic fw-500">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteData;
