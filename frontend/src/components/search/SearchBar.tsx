import React, { useState, FormEvent } from 'react';
import { 
  Paper, 
  InputBase, 
  IconButton, 
  Box,
  useTheme
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = 'Search for songs...', 
  initialValue = '' 
}) => {
  const [query, setQuery] = useState(initialValue);
  const theme = useTheme();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      onSearch(trimmedQuery);
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        p: '2px 4px',
        borderRadius: theme.shape.borderRadius,
        boxShadow: 2
      }}
      elevation={1}
    >
      <Box sx={{ ml: 1, flex: 1 }}>
        <InputBase
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
          sx={{ ml: 1 }}
          inputProps={{ 'aria-label': 'search' }}
        />
      </Box>
      <IconButton 
        type="submit" 
        aria-label="search" 
        sx={{ p: '10px' }}
        color="primary"
      >
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

export default SearchBar; 