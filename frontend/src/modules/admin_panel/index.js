import HelpDocumentation from "./help_documentation/pages/HelpDocumentation";
import Messaging from "./help_documentation/pages/Messaging";
import ProductsListView from "./help_documentation/pages/ProductsListView";
import DataUpload from "./help_documentation/pages/DataUpload";
import ReportGeneration from "./help_documentation/pages/ReportGeneration";
import Dashboard from "./dashboard/pages/Dashboard";
import Support from "./support/pages/Support";
import Users from "./users/pages/Users";

const adminRoutes = [
  {
    path: "/admin/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/admin/users",
    element: <Users />,
  },
  {
    path: "/admin/support",
    element: <Support />,
  },
  {
    path: "/admin/documentation",
    element: <HelpDocumentation />,
  },
  {
    path: "/admin/documentation/data-upload",
    element: <DataUpload />,
  },
  {
    path: "/admin/documentation/products-list-view",
    element: <ProductsListView />,
  },
  {
    path: "/admin/documentation/messaging",
    element: <Messaging />,
  },
  {
    path: "/admin/documentation/report-generation",
    element: <ReportGeneration />,
  },
];

export default adminRoutes;
