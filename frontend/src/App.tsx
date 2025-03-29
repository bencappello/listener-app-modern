import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box, Container, Flex } from '@chakra-ui/react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import ProfilePage from './pages/Profile';
import ProtectedRoute from './components/auth/ProtectedRoute';

// This is a placeholder for now - we'll build out the actual app later
const App: React.FC = () => {
  return (
    <ChakraProvider>
      <Router>
        <Flex 
          direction="column" 
          minH="100vh"
        >
          {/* Header */}
          <Navbar />
          
          {/* Main content */}
          <Box 
            as="main" 
            flex="1" 
            py={8}
            bg="gray.50"
          >
            <Container maxW="container.xl">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<ProfilePage />} />
                  {/* Add more protected routes here */}
                </Route>
              </Routes>
            </Container>
          </Box>
          
          {/* Footer */}
          <Footer />
        </Flex>
      </Router>
    </ChakraProvider>
  );
};

export default App; 