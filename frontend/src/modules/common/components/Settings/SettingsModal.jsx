import { useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import { Palette, LayoutGrid, X, Crown } from "lucide-react";
import ThemeSettings from "./ThemeSettings";
import ViewSettings from "./ViewSettings";
import SubscriptionSettings from "./SubscriptionSettings";

function SettingsModal({ showSettingsModal, setShowSettingsModal }) {
  const [selectedTab, setSelectedTab] = useState("theme");

  const handleClose = () => setShowSettingsModal(false);

  const settingsTabs = [
    {
      id: "theme",
      label: "Appearance",
      icon: Palette,
      color: "inherit",
    },
    {
      id: "view",
      label: "View",
      icon: LayoutGrid,
      color: "inherit",
    },
    {
      id: "subscription",
      label: "Subscription",
      icon: Crown,
      color: "inherit",
    },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case "theme":
        return <ThemeSettings />;
      case "view":
        return <ViewSettings />;
      case "subscription":
        return <SubscriptionSettings />;
      default:
        return <ThemeSettings />;
    }
  };

  return (
    <Dialog
      open={showSettingsModal}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: "60vh",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogContent
        sx={{ p: 0, display: "flex", height: "100%", position: "relative" }}
      >
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            position: "absolute",
            top: "1.6rem",
            right: "1.3rem",
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <X />
        </IconButton>
        <Box
          sx={{
            width: 250,
            borderRight: "1px solid",
            borderColor: "divider",
            display: "flex",
            backgroundColor: "background.paper",
            flexDirection: "column",
          }}
        >
          {/* Navigation List */}
          <List sx={{ px: 2, py: 2, flex: 1 }}>
            {settingsTabs.map((tab) => {
              const IconComponent = tab.icon;
              const isSelected = selectedTab === tab.id;

              return (
                <ListItem key={tab.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => setSelectedTab(tab.id)}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      "&.Mui-selected": {
                        backgroundColor: "action.selected",
                        "&:hover": {
                          backgroundColor: "action.selected",
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                      }}
                    >
                      <IconComponent size={18} />
                    </ListItemIcon>
                    <ListItemText
                      primary={tab.label}
                      primaryTypographyProps={{
                        variant: "bodySm",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backgroundColor: "background.paper",
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              p: 4,
            }}
          >
            {renderContent()}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsModal;
