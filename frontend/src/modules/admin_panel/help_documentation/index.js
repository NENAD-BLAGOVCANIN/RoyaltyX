import HelpDocumentation from "./pages/HelpDocumentation";
import Messaging from "./pages/Messaging";
import ProductsListView from "./pages/ProductsListView";
import DataUpload from "./pages/DataUpload";
import ReportGeneration from "./pages/ReportGeneration";

const helpDocumentationRoutes = [
  {
    path: "documentation",
    element: <HelpDocumentation />,
  },
  {
    path: "documentation/data-upload",
    element: <DataUpload />,
  },
  {
    path: "documentation/products-list-view",
    element: <ProductsListView />,
  },
  {
    path: "documentation/messaging",
    element: <Messaging />,
  },
  {
    path: "documentation/report-generation",
    element: <ReportGeneration />,
  },
];

export default helpDocumentationRoutes;
