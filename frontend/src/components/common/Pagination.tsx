import React, { useMemo } from 'react';
import {
  Button,
  ButtonGroup,
  Flex,
  Text,
  IconButton,
  useColorModeValue,
  Select,
  HStack,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPageSelector?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPageSelector = false,
}) => {
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / itemsPerPage));
  }, [totalItems, itemsPerPage]);

  const pages = useMemo(() => {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }, [currentPage, totalPages]);

  const buttonColorScheme = useColorModeValue('purple', 'purple');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = parseInt(event.target.value, 10);
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newValue);
    }
  };

  if (totalPages <= 1 && !showItemsPerPageSelector) {
    return null;
  }

  return (
    <Flex justifyContent="center" alignItems="center" flexWrap="wrap" gap={4}>
      {showItemsPerPageSelector && (
        <HStack spacing={2}>
          <Text fontSize="sm" color={textColor}>Items per page:</Text>
          <Select
            size="sm"
            width="70px"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </Select>
        </HStack>
      )}
      
      <ButtonGroup size="sm" isAttached variant="outline">
        <IconButton
          aria-label="Previous page"
          icon={<ChevronLeftIcon />}
          onClick={handlePrevious}
          isDisabled={currentPage === 1}
        />
        
        {totalPages > 7 && currentPage > 3 && (
          <>
            <Button onClick={() => onPageChange(1)}>1</Button>
            {currentPage > 4 && <Text mx={2}>...</Text>}
          </>
        )}
        
        {pages.map((page) => (
          <Button
            key={page}
            colorScheme={page === currentPage ? buttonColorScheme : undefined}
            variant={page === currentPage ? 'solid' : 'outline'}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        
        {totalPages > 7 && currentPage < totalPages - 2 && (
          <>
            {currentPage < totalPages - 3 && <Text mx={2}>...</Text>}
            <Button onClick={() => onPageChange(totalPages)}>{totalPages}</Button>
          </>
        )}
        
        <IconButton
          aria-label="Next page"
          icon={<ChevronRightIcon />}
          onClick={handleNext}
          isDisabled={currentPage === totalPages}
        />
      </ButtonGroup>
      
      <Text fontSize="sm" color={textColor}>
        Page {currentPage} of {totalPages} ({totalItems} items)
      </Text>
    </Flex>
  );
};

export default Pagination; 