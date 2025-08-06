import MyProjects from "./pages/MyProjects";
import CreateNewProject from "./pages/CreateNewProject";
import ProjectSettings from "../settings/pages/ProjectSettings";

const projectRoutes = [
  {
    path: "my-projects",
    element: <MyProjects />,
  },
  {
    path: "projects/create",
    element: <CreateNewProject />,
  },
  {
    path: "settings",
    element: <ProjectSettings />,
  },
];

export default projectRoutes;
