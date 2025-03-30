import React from 'react';
import { Spinner, Center, Box, Text, useColorModeValue } from '@chakra-ui/react';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  thickness?: string;
  color?: string;
  emptyHeight?: string;
  fullPage?: boolean;
}

/**
 * A reusable loading spinner component that can be used across the application
 * with consistent styling and behavior
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text,
  size = 'lg',
  thickness = '4px',
  color,
  emptyHeight = '200px',
  fullPage = false,
}) => {
  // Always call hooks at the top level
  const defaultSpinnerColor = useColorModeValue('purple.500', 'purple.300');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  // Use the provided color or the default theme color
  const spinnerColor = color || defaultSpinnerColor;
  
  const content = (
    <>
      <Spinner
        thickness={thickness}
        speed="0.65s"
        emptyColor="gray.200"
        color={spinnerColor}
        size={size}
        data-testid="loading-spinner"
      />
      {text && (
        <Text 
          mt={4} 
          color={textColor} 
          fontSize="md" 
          textAlign="center"
          data-testid="loading-text"
        >
          {text}
        </Text>
      )}
    </>
  );

  if (fullPage) {
    return (
      <Center 
        w="100vw" 
        h="100vh" 
        position="fixed" 
        top="0" 
        left="0" 
        zIndex="overlay"
        data-testid="fullpage-spinner-container"
      >
        <Box p={8} borderRadius="md">
          {content}
        </Box>
      </Center>
    );
  }

  return (
    <Center 
      w="100%" 
      h={emptyHeight} 
      py={8}
      data-testid="spinner-container"
    >
      <Box p={4}>
        {content}
      </Box>
    </Center>
  );
};

export default LoadingSpinner; 