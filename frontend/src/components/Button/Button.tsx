import React from 'react';
import { Button as ChakraButton, ButtonProps } from '@chakra-ui/react';

interface CustomButtonProps extends ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<CustomButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}) => {
  // Map our variant to Chakra UI variants
  const variantMap = {
    primary: {
      colorScheme: 'blue',
      variant: 'solid',
    },
    secondary: {
      colorScheme: 'gray',
      variant: 'solid',
    },
    outline: {
      colorScheme: 'blue',
      variant: 'outline',
    },
  };

  const { colorScheme, variant: chakraVariant } = variantMap[variant];

  return (
    <ChakraButton
      colorScheme={colorScheme}
      variant={chakraVariant}
      size={size}
      {...props}
    >
      {children}
    </ChakraButton>
  );
};

export default Button; 