import { useNavigate, useParams } from "react-router";
import PageHeader from "../../../common/components/PageHeader";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { deleteFile, getFile } from "../../../management/api/files";

const DeleteData = () => {
  const { file_id } = useParams();
  const [file, setFile] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        const response = await getFile(file_id);
        setFile(response);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFileData();
  }, []);

  const handleFileDeletion = async () => {
    await deleteFile(file_id);
    navigate("/sources/manual-import");
    toast.success("File successfully deleted!");
  };

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
