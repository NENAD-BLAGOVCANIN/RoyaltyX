import {
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
} from "@mui/material";
import {
  History,
  Search,
  Person,
  Folder,
  Link,
  Description,
} from "@mui/icons-material";

const SearchDropdown = ({
  isOpen,
  searchQuery,
  onItemClick,
}) => {
  // Mock data based on the image provided
  const mockItems = [
    {
      id: "1",
      type: "recent",
      title: "Menu item",
    },
    {
      id: "2",
      type: "search",
      title: "Menu item",
    },
    {
      id: "3",
      type: "search",
      title: "Menu item",
    },
    {
      id: "4",
      type: "search",
      title: "Menu item",
    },
    {
      id: "5",
      type: "user",
      title: "Michael Wielpuetz",
      avatar: "/src/modules/shared/assets/img/placeholder/placeholder_user_avatar.jpg",
    },
    {
      id: "6",
      type: "user",
      title: "Menu item",
    },
    {
      id: "7",
      type: "catalog",
      title: "Catalog node",
    },
    {
      id: "8",
      type: "connection",
      title: "Data Connection A",
    },
    {
      id: "9",
      type: "datacard",
      title: "Data Card Placeholder A",
    },
  ];

  const getIcon = (type) => {
    switch (type) {
      case "recent":
        return <History sx={{ color: "text.secondary", fontSize: 20 }} />;
      case "search":
        return <Search sx={{ color: "text.secondary", fontSize: 20 }} />;
      case "user":
        return <Person sx={{ color: "text.secondary", fontSize: 20 }} />;
      case "catalog":
        return <Folder sx={{ color: "text.secondary", fontSize: 20 }} />;
      case "connection":
        return <Link sx={{ color: "text.secondary", fontSize: 20 }} />;
      case "datacard":
        return <Description sx={{ color: "text.secondary", fontSize: 20 }} />;
      default:
        return <Search sx={{ color: "text.secondary", fontSize: 20 }} />;
    }
  };

  const filteredItems = mockItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <Paper
      elevation={8}
      sx={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        zIndex: 1300,
        maxHeight: 400,
        overflow: "auto",
        mt: 1,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <List sx={{ py: 1 }}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <ListItem
              key={item.id}
              onClick={() => onItemClick?.(item)}
              sx={{
                py: 1.5,
                px: 2,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
                cursor: "pointer",
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.type === "user" && item.avatar ? (
                  <Avatar
                    src={item.avatar}
                    sx={{ width: 24, height: 24 }}
                    alt={item.title}
                  />
                ) : (
                  getIcon(item.type)
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.primary",
                      fontWeight: 400,
                      fontSize: "14px",
                    }}
                  >
                    {item.title}
                  </Typography>
                }
                secondary={
                  item.subtitle && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontSize: "12px",
                      }}
                    >
                      {item.subtitle}
                    </Typography>
                  )
                }
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    textAlign: "center",
                    py: 2,
                  }}
                >
                  No results found for "{searchQuery}"
                </Typography>
              }
            />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default SearchDropdown;
