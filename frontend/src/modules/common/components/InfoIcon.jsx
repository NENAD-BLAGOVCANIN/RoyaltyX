import { InfoOutlined } from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";

const InfoIcon = ({ tooltip, size = "small" }) => {
  return (
    <Tooltip title={tooltip} arrow placement="top">
      <IconButton size={size} sx={{ ml: 1, p: 0.5 }}>
        <InfoOutlined fontSize="small" sx={{ color: "text.secondary" }} />
      </IconButton>
    </Tooltip>
  );
};

export default InfoIcon;
