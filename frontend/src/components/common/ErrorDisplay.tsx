import React from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Button,
  CloseButton,
  Collapse,
  Flex,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { WarningTwoIcon, InfoIcon, RepeatIcon } from '@chakra-ui/icons';

export type ErrorSeverity = 'error' | 'warning' | 'info';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  details?: string;
  severity?: ErrorSeverity;
  isClosable?: boolean;
  onClose?: () => void;
  onRetry?: () => void;
  isInline?: boolean;
  fullWidth?: boolean;
}

/**
 * A reusable component for displaying errors with different severities
 * and optional actions like retry or close
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title,
  message,
  details,
  severity = 'error',
  isClosable = false,
  onClose,
  onRetry,
  isInline = false,
  fullWidth = false,
}) => {
  // Always call hooks at the top level
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const detailsBgColor = useColorModeValue('gray.50', 'gray.700');
  
  // If it's an inline error, use a simple Alert component
  if (isInline) {
    return (
      <Alert 
        status={severity} 
        variant="left-accent" 
        borderRadius="md"
        data-testid="inline-error"
        width={fullWidth ? '100%' : 'auto'}
      >
        <AlertIcon />
        <Box flex="1">
          {title && <AlertTitle>{title}</AlertTitle>}
          <AlertDescription display="block">
            {message}
          </AlertDescription>
        </Box>
        {isClosable && onClose && (
          <CloseButton 
            alignSelf="flex-start" 
            position="relative" 
            right={-1} 
            top={-1} 
            onClick={onClose}
            data-testid="close-button"
          />
        )}
      </Alert>
    );
  }

  // For non-inline error, use a more detailed display
  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden" 
      p={6} 
      bg={bgColor} 
      borderColor={borderColor}
      width={fullWidth ? '100%' : 'auto'}
      data-testid="detailed-error"
      boxShadow="sm"
    >
      <VStack spacing={4} align="flex-start">
        <Flex w="100%" justifyContent="space-between" alignItems="center">
          <Flex alignItems="center">
            {severity === 'error' && <WarningTwoIcon color="red.500" boxSize={5} mr={2} />}
            {severity === 'warning' && <WarningTwoIcon color="orange.500" boxSize={5} mr={2} />}
            {severity === 'info' && <InfoIcon color="blue.500" boxSize={5} mr={2} />}
            <Text fontSize="xl" fontWeight="bold">
              {title || (severity === 'error' 
                ? 'Error Occurred' 
                : severity === 'warning' 
                  ? 'Warning' 
                  : 'Information')}
            </Text>
          </Flex>
          {isClosable && onClose && (
            <CloseButton 
              onClick={onClose} 
              data-testid="close-button"
            />
          )}
        </Flex>
        
        <Text>{message}</Text>
        
        {details && (
          <Collapse in={true} animateOpacity>
            <Box 
              p={3} 
              borderWidth="1px" 
              borderRadius="md" 
              bg={detailsBgColor}
              fontSize="sm"
              fontFamily="monospace"
              width="100%"
              overflowX="auto"
              data-testid="error-details"
            >
              {details}
            </Box>
          </Collapse>
        )}
        
        {onRetry && (
          <Button 
            leftIcon={<RepeatIcon />} 
            colorScheme="blue" 
            size="sm" 
            onClick={onRetry}
            data-testid="retry-button"
          >
            Retry
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default ErrorDisplay; 