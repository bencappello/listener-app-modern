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
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { LoginCredentials } from '../../types/auth';
import { useAuth } from '../../hooks/useAuth';

const LoginPage: React.FC = () => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<LoginCredentials>();
  
  const { login, isLoggingIn, loginError } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the return URL from location state or default to home
  const from = (location.state as any)?.from?.pathname || '/';
  
  const onSubmit = async (data: LoginCredentials) => {
    login(data, {
      onSuccess: () => {
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 2000,
        });
        navigate(from, { replace: true });
      },
      onError: (error: any) => {
        toast({
          title: 'Login failed',
          description: error.message || 'Please check your credentials',
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
          <Heading size="lg" textAlign="center">Sign in to your account</Heading>
          <Text color="gray.600" textAlign="center">
            Access your music discovery tools
          </Text>
        </Stack>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <FormControl isInvalid={!!errors.username}>
              <FormLabel>Username</FormLabel>
              <Input 
                {...register('username', { 
                  required: 'Username is required' 
                })} 
                placeholder="Your username"
              />
              <FormErrorMessage>
                {errors.username?.message}
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
                placeholder="Your password"
              />
              <FormErrorMessage>
                {errors.password?.message}
              </FormErrorMessage>
            </FormControl>
            
            <Button 
              type="submit" 
              colorScheme="blue" 
              size="lg" 
              fontSize="md"
              isLoading={isLoggingIn}
              w="full"
              mt={4}
            >
              Sign in
            </Button>
          </Stack>
        </form>
        
        <Divider my={6} />
        
        <Text textAlign="center">
          Don't have an account?{' '}
          <ChakraLink as={Link} to="/register" color="blue.500">
            Sign up
          </ChakraLink>
        </Text>
      </Box>
    </Container>
  );
};

export default LoginPage; 