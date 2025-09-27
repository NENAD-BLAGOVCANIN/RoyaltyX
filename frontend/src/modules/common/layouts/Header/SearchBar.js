import { useState, useRef, useEffect } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import SearchDropdown from "./SearchDropdown";

const SearchBar = ({ 
  placeholder = "Search", 
  fullWidth = true 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Handle input change
  const handleInputChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    setIsDropdownOpen(value.length > 0);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (searchQuery.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle dropdown item click
  const handleDropdownItemClick = (item) => {
    console.log("Selected item:", item);
    setIsDropdownOpen(false);
    // You can add navigation logic here based on the item type
  };

  return (
    <Box 
      ref={searchContainerRef}
      sx={{ 
        width: fullWidth ? '100%' : 'auto', 
        maxWidth: 600,
        position: 'relative'
      }}
    >
      <TextField
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        variant="outlined"
        size="medium"
        fullWidth={fullWidth}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ 
                color: 'text.secondary',
                fontSize: '1.25rem'
              }} />
            </InputAdornment>
          ),
          sx: {
            backgroundColor: 'background.paper',
            height: '40px',
            '& .MuiOutlinedInput-notchedOutline': {
              border: '1px solid',
              borderColor: 'divider',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'text.secondary',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              border: '2px solid',
              borderColor: 'primary.main',
            },
            '& .MuiInputBase-input': {
              padding: '12px 14px 12px 0',
              fontSize: '16px',
              '&::placeholder': {
                color: 'text.secondary',
                opacity: 0.7,
              },
            },
          },
        }}
      />
      <SearchDropdown
        isOpen={isDropdownOpen}
        searchQuery={searchQuery}
        onItemClick={handleDropdownItemClick}
      />
    </Box>
  );
};

export default SearchBar;
