import React from 'react';
import { 
  Box, 
  Button, 
  Container, 
  FormControl, 
  FormLabel, 
  Heading, 
  Input, 
  Stack, 
  Text, 
  useToast,
  FormErrorMessage,
  Divider,
  Link as ChakraLink
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { RegisterData } from '../../types/auth';
import { useAuth } from '../../hooks/useAuth';

const RegisterPage: React.FC = () => {
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors, isSubmitting } 
  } = useForm<RegisterData>();
  
  const { register: registerUser, isRegistering, registerError } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const onSubmit = async (data: RegisterData) => {
    registerUser(data, {
      onSuccess: () => {
        toast({
          title: 'Registration successful',
          status: 'success',
          duration: 2000,
        });
        navigate('/');
      },
      onError: (error: any) => {
        toast({
          title: 'Registration failed',
          description: error.message || 'Please check your information',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };
  
  return (
    <Container maxW="md" py={12}>
      <Box p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="white">
        <Stack spacing={4} mb={8}>
          <Heading size="lg" textAlign="center">Create an account</Heading>
          <Text color="gray.600" textAlign="center">
            Join our music discovery community
          </Text>
        </Stack>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <FormControl isInvalid={!!errors.username}>
              <FormLabel>Username</FormLabel>
              <Input 
                {...register('username', { 
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters'
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Username can only contain letters, numbers and underscores'
                  }
                })} 
                placeholder="Choose a username"
              />
              <FormErrorMessage>
                {errors.username?.message}
              </FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input 
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })} 
                type="email"
                placeholder="Your email address"
              />
              <FormErrorMessage>
                {errors.email?.message}
              </FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={!!errors.password}>
              <FormLabel>Password</FormLabel>
              <Input 
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { 
                    value: 6, 
                    message: 'Password must be at least 6 characters' 
                  } 
                })} 
                type="password" 
                placeholder="Create a password"
              />
              <FormErrorMessage>
                {errors.password?.message}
              </FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={!!errors.confirm_password}>
              <FormLabel>Confirm Password</FormLabel>
              <Input 
                {...register('confirm_password', { 
                  required: 'Please confirm your password',
                  validate: value => 
                    value === watch('password') || 'Passwords do not match'
                })} 
                type="password" 
                placeholder="Confirm your password"
              />
              <FormErrorMessage>
                {errors.confirm_password?.message}
              </FormErrorMessage>
            </FormControl>
            
            <Button 
              type="submit" 
              colorScheme="blue" 
              size="lg" 
              fontSize="md"
              isLoading={isRegistering}
              w="full"
              mt={4}
            >
              Create Account
            </Button>
          </Stack>
        </form>
        
        <Divider my={6} />
        
        <Text textAlign="center">
          Already have an account?{' '}
          <ChakraLink as={Link} to="/login" color="blue.500">
            Sign in
          </ChakraLink>
        </Text>
      </Box>
    </Container>
  );
};

export default RegisterPage; 