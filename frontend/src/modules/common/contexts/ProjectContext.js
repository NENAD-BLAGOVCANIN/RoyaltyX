import { createContext, useState, useContext, useEffect } from "react";
import { getProjectInfo } from "../../projects/api/project";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [project, setProject] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const { id: currentUserId } = useAuth();

  useEffect(() => {
    const fetchProjectInfo = async () => {
      try {
        const data = await getProjectInfo();
        setProject(data);
        
        // Find current user's role in this project
        if (data && data.users && currentUserId) {
          const currentUserInProject = data.users.find(
            user => user.user_details.id === parseInt(currentUserId)
          );
          setCurrentUserRole(currentUserInProject?.role || null);
        }
      } catch (error) {
        toast.error(error.message || "Failed to fetch project info");
      }
    };

    if (currentUserId) {
      fetchProjectInfo();
    }
  }, [currentUserId]);

  // Update current user role when project data changes
  useEffect(() => {
    if (project && project.users && currentUserId) {
      const currentUserInProject = project.users.find(
        user => user.user_details.id === parseInt(currentUserId)
      );
      setCurrentUserRole(currentUserInProject?.role || null);
    }
  }, [project, currentUserId]);

  return (
    <ProjectContext.Provider value={{ project, setProject, currentUserRole }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
