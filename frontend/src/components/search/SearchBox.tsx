import React, { useState, useEffect, useRef } from 'react';
import {
  InputGroup,
  Input,
  InputRightElement,
  InputLeftElement,
  IconButton,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';

interface SearchBoxProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  defaultValue?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  width?: string;
  colorScheme?: string;
  variant?: string;
  disableEmptySearch?: boolean;
  autoFocus?: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder = 'Search',
  onSearch,
  onClear,
  defaultValue = '',
  size = 'md',
  width = '100%',
  colorScheme = 'purple',
  variant = 'outline',
  disableEmptySearch = false,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const iconColor = useColorModeValue('gray.400', 'gray.500');
  const hoverColor = useColorModeValue(`${colorScheme}.500`, `${colorScheme}.300`);
  
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSearch = () => {
    if (disableEmptySearch && !query.trim()) return;
    onSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (onClear) {
      onClear();
    }
  };

  return (
    <InputGroup size={size} width={width} role="group">
      <InputLeftElement pointerEvents="none">
        <SearchIcon color={iconColor} />
      </InputLeftElement>
      
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        borderRadius="md"
        variant={variant}
        _focus={{
          borderColor: `${colorScheme}.500`,
          boxShadow: `0 0 0 1px var(--chakra-colors-${colorScheme}-500)`,
        }}
        autoComplete="off"
      />
      
      <InputRightElement width="auto">
        <Box display="flex">
          {query && (
            <IconButton
              aria-label="Clear search"
              icon={<CloseIcon fontSize="10px" />}
              size="sm"
              variant="ghost"
              onClick={handleClear}
              _hover={{ color: hoverColor }}
              mr="1"
            />
          )}
          
          <IconButton
            aria-label="Search"
            icon={<SearchIcon />}
            size="sm"
            colorScheme={colorScheme}
            variant="ghost"
            onClick={handleSearch}
            isDisabled={disableEmptySearch && !query.trim()}
            _hover={{ color: hoverColor }}
          />
        </Box>
      </InputRightElement>
    </InputGroup>
  );
};

export default SearchBox; 