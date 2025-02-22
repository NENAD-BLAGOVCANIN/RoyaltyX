import { useState } from "react";
import { toast } from "react-toastify";
import { uploadFile } from "../api/import";
import { useDropzone } from "react-dropzone";
import { Spinner } from "react-bootstrap";

const FileUploadInput = () => {
    const [uploading, setUploading] = useState(false);

    const onDrop = async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;
        const file = acceptedFiles[0];

        setUploading(true);
        try {
            const response = await uploadFile(file);
            if (response.status === "success") {
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Error: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            "application/pdf": [".pdf"],
            "text/csv": [".csv"],
            "application/vnd.ms-excel": [".xls", ".xlsx"]
        }
    });

    return (
        <div className="mt-4">
            <div
                {...getRootProps()}
                className={`rounded p-5 text-center ${isDragActive ? "border-custom-primary" : "border-custom-regular"} bgc-primary-transparent`}
                style={{ cursor: "pointer" }}
            >
                <input {...getInputProps()} disabled={uploading} />
                {uploading ? (
                    <div>
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 txt-primary fw-bold">Processing reports...</p>
                    </div>
                ) : (
                    <div>
                        <p className="fw-bold txt-lighter">
                            {isDragActive ? "Drop the file here..." : "Drag & Drop a file here or click to upload"}
                        </p>
                        <p className="small text-muted">Supported formats: CSV, XLS, XLSX</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUploadInput;
