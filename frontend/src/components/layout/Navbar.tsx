import React from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  Stack, 
  Heading, 
  Container,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Avatar
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import { ChevronDownIcon, SearchIcon } from '@chakra-ui/icons';

const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box as="header" bg="blue.600" color="white" py={3} boxShadow="md">
      <Container maxW="container.xl">
        <Flex align="center" justify="space-between" wrap="wrap">
          <Flex align="center" mr={5}>
            <Heading as="h1" size="lg">
              <RouterLink to="/">Listener App</RouterLink>
            </Heading>
          </Flex>

          <Stack direction="row" spacing={4} align="center">
            <Button
              as={RouterLink}
              to="/search"
              colorScheme="whiteAlpha"
              variant="ghost"
              leftIcon={<SearchIcon />}
            >
              Search
            </Button>
            
            {isAuthenticated ? (
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  colorScheme="whiteAlpha"
                  variant="outline"
                >
                  {user?.username || 'Account'}
                </MenuButton>
                <MenuList color="gray.800">
                  <MenuItem as={RouterLink} to="/profile">
                    Profile
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/favorites">
                    Favorites
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <>
                <Button 
                  as={RouterLink}
                  to="/login"
                  colorScheme="whiteAlpha"
                  variant="outline"
                >
                  Login
                </Button>
                <Button 
                  as={RouterLink}
                  to="/register"
                  colorScheme="blue"
                  bg="white"
                  color="blue.600"
                >
                  Sign Up
                </Button>
              </>
            )}
          </Stack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar; 