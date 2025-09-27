import { useState, useEffect } from "react";
import ProjectCard from "../components/ProjectCard";
import { getMyProjects } from "../api/project";
import { switchProject } from "../api/project";
import CreateNewProjectCard from "../components/CreateNewProjectCard";
import { useNavigate } from "react-router-dom";
import { Button, Container } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Plus } from "lucide-react";
import PageHeader from "../../common/components/PageHeader";

function MyProjects() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const fetchedProjects = await getMyProjects();
        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Error fetching :", error);
      }
    };

    fetchProjects();
  }, []);

  const handleSwitchProject = async (project_id) => {
    try {
      await switchProject(project_id);
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Error fetching :", error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 10 }}>
      <PageHeader
        title="My Projects"
        description="Find all your personal and shared projects"
        appendActions={
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              navigate("/projects/create");
            }}
          >
            <Plus size={18} className="me-2" /> Create
          </Button>
        }
      />

      <Grid container spacing={4} sx={{ display: "flex", pb: 5, mt: 3 }}>
        <CreateNewProjectCard />
        {projects.map((project) => (
          <ProjectCard
            project={project}
            key={project.id}
            handleSwitchProject={handleSwitchProject}
          />
        ))}
      </Grid>
    </Container>
  );
}

export default MyProjects;
