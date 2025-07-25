import { InfoCircleFill } from "react-bootstrap-icons";
import TopicsList from "../components/TopicsList";
import { Alert, AlertTitle, Typography } from "@mui/material";

const HelpDocumentation = () => {
  return (
    <div className="pb-5">
      <Typography variant="h2" sx={{ fontWeight: "bold", mt: 4 }}>
        Project Documentation
      </Typography>
      <div className="mt-4 mb-5">
        <Alert
          severity="info"
          variant="outlined"
          icon={<InfoCircleFill className="h5 mb-0" />}
        >
          <AlertTitle>Information</AlertTitle>
          This page will contain multiple topics all containing instructions and
          rules on how to use particular features as a project owner. As we make
          updates to the project, including how different features are used, we
          will also make sure to keep this page up to date and provide support
          in case project owners experience any issues.
        </Alert>
      </div>

      <TopicsList />
    </div>
  );
};

export default HelpDocumentation;
