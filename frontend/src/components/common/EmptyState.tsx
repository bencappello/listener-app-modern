import React from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, InfoIcon } from '@chakra-ui/icons';

export type EmptyStateType = 'search' | 'data' | 'content' | 'custom';

interface EmptyStateProps {
  title: string;
  message: string;
  type?: EmptyStateType;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
  minHeight?: string;
}

/**
 * A reusable component for displaying empty states when no data is available
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  type = 'data',
  actionLabel,
  onAction,
  icon,
  minHeight = '200px',
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Determine the icon to display based on the type
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'search':
        return SearchIcon;
      case 'content':
        return AddIcon;
      case 'data':
      case 'custom':
      default:
        return InfoIcon;
    }
  };
  
  const IconComponent = getIcon();

  return (
    <Box
      width="100%"
      borderWidth="1px"
      borderRadius="lg"
      p={8}
      bg={bgColor}
      borderColor={borderColor}
      minHeight={minHeight}
      data-testid="empty-state"
    >
      <VStack spacing={4}>
        <Icon
          as={IconComponent}
          boxSize={10}
          color={useColorModeValue('gray.400', 'gray.500')}
          data-testid="empty-state-icon"
        />
        
        <Text
          fontSize="xl"
          fontWeight="bold"
          textAlign="center"
        >
          {title}
        </Text>
        
        <Text
          fontSize="md"
          color={useColorModeValue('gray.600', 'gray.400')}
          textAlign="center"
          maxWidth="400px"
          data-testid="empty-state-message"
        >
          {message}
        </Text>
        
        {actionLabel && onAction && (
          <Button
            mt={4}
            colorScheme="purple"
            onClick={onAction}
            size="md"
            data-testid="empty-state-action"
          >
            {actionLabel}
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default EmptyState; 