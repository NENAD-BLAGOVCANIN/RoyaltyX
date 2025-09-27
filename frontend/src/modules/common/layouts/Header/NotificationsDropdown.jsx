import { useState, useEffect } from "react";
import {
  Badge,
  Box,
  ClickAwayListener,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Stack,
} from "@mui/material";
import { MailOutline } from "@mui/icons-material";
import icon from "../../assets/img/brand/favicon.ico";
import { Bell } from "lucide-react";
import {
  getNotifications,
  markNotificationsAsRead,
} from "../../api/notifications";

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const markReadIfOpen = async () => {
    if (isOpen && notificationCount > 0) {
      // Dropdown is open and user is closing it → mark as read
      await handleMarkAllAsRead();
    }
  };

  const toggleDropdown = async () => {
    await markReadIfOpen();
    setIsOpen(!isOpen);
  };

  const handleClickAway = async () => {
    await markReadIfOpen();
    setIsOpen(false);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getNotifications();
        setNotifications(response.notifications);
        setNotificationCount(response.unread_count);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await markNotificationsAsRead();
      const response = await getNotifications();
      setNotifications(response.notifications);
      setNotificationCount(response.unread_count);
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box>
          <IconButton
            onClick={toggleDropdown}
            aria-label="show notifications"
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <Badge
              badgeContent={notificationCount}
              showZero={false}
              color="error"
              overlap="circular"
              componentsProps={{
                badge: {
                  sx: {
                    top: "auto",
                    bottom: 0,
                    right: 0,
                    transform: "translate(50%, 50%)",
                    fontSize: 9,
                    borderRadius: "0.375rem",
                    minWidth: 17,
                    height: 15.3,
                  },
                },
              }}
            >
              <Bell size={20} strokeWidth={1.5} />
            </Badge>
          </IconButton>

          {isOpen && (
            <Box
              sx={{
                position: "absolute",
                top: "100%",
                right: 0,
                width: 350,
                maxHeight: 400,
                bgcolor: "background.paper",
                boxShadow: 3,
                borderRadius: 1,
                mt: 1,
                zIndex: 1300,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="subtitle1" sx={{ px: 2, py: 1 }}>
                Notifications ({notifications.length})
              </Typography>
              <Divider />
              <List
                sx={{
                  overflowY: "auto",
                  minHeight: 270,
                }}
              >
                {notifications.map((notification, idx) => (
                  <ListItem key={idx} alignItems="center" sx={{ py: 1 }}>
                    <ListItemAvatar>
                      <img alt="icon" src={icon} style={{ width: 30 }} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          fontWeight={notification.is_read ? "normal" : "bold"}
                          variant="bodyMd"
                        >
                          {notification.title}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Divider />
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ px: 2, py: 1 }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                  sx={{ cursor: "pointer", color: "primary.main" }}
                >
                  <MailOutline fontSize="small" />
                  <Typography variant="bodySm">Inbox</Typography>
                </Stack>
                <Typography
                  variant="bodySm"
                  sx={{ cursor: "pointer", color: "primary.main" }}
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </Typography>
              </Stack>
            </Box>
          )}
        </Box>
      </ClickAwayListener>
    </Box>
  );
};

export default NotificationsDropdown;
