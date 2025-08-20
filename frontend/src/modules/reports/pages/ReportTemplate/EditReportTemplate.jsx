import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getReportTemplateById, updateReportTemplate } from "../../api/report-templates";
import { toast } from "react-toastify";
import ReportTemplateForm from "./ReportTemplateForm";

export default function EditReportTemplate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    getReportTemplateById(id).then(setInitialData).catch(() => {
      toast.error("Failed to load template.");
      navigate("/reports?tab=1");
    });
  }, [id, navigate])

  const handleUpdate = async (data) => {
    try {
      await updateReportTemplate(id, data);
      toast.success("Template updated successfully!");
      navigate("/reports?tab=1");
    } catch (err) {
      toast.error("Failed to update template.");
    }
  };

  if (!initialData) return <div>Loading...</div>;

  return (
    <ReportTemplateForm
      initialData={initialData}
      onSubmit={handleUpdate}
      buttonLabel="Update"
    />
  );
}
