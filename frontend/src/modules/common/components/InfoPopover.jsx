import { InfoOutlined } from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";

export const InfoPopover = ({ 
  title = "", 
  text, 
  size = "small", 
  placement = "top",
  sx = {} 
}) => {
  const tooltipContent = title ? `${title}: ${text}` : text;

  return (
    <Tooltip 
      title={tooltipContent} 
      arrow 
      placement={placement}
      componentsProps={{
        tooltip: {
          sx: {
            maxWidth: 300,
            fontSize: '0.875rem',
            lineHeight: 1.4,
            padding: '8px 12px',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            ...sx
          }
        }
      }}
    >
      <IconButton 
        size={size} 
        sx={{ 
          ml: 1, 
          p: 0.5,
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <InfoOutlined fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};
