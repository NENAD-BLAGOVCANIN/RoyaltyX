import { useNavigate } from "react-router-dom";
import { createReportTemplate } from "../../api/report-templates";
import { toast } from "react-toastify";
import ReportTemplateForm from "./ReportTemplateForm";

export default function CreateNewReportTemplate() {
  const navigate = useNavigate();

  const handleCreate = async (data) => {
    try {
      await createReportTemplate(data);
      toast.success("Template created successfully!");
      navigate("/reports?tab=1");
    } catch (err) {
      toast.error(err || "Failed to create template.");
    }
  };

  return (
    <ReportTemplateForm
      initialData={{}}
      onSubmit={handleCreate}
      buttonLabel="Create"
    />
  );
}
