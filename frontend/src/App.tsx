import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box, Heading, Text, Container, Flex } from '@chakra-ui/react';

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
          <Box 
            as="header" 
            bg="blue.600" 
            color="white" 
            p={4}
          >
            <Container maxW="container.xl">
              <Heading as="h1" size="lg">Listener App</Heading>
            </Container>
          </Box>
          
          {/* Main content */}
          <Box 
            as="main" 
            flex="1" 
            py={8}
          >
            <Container maxW="container.xl">
              <Heading as="h2" size="xl" mb={6}>Welcome to Listener App</Heading>
              <Text fontSize="lg">
                Your music blog aggregator for discovering new music.
              </Text>
              
              <Routes>
                <Route path="/" element={<div>Home Page</div>} />
                {/* Add more routes here */}
              </Routes>
            </Container>
          </Box>
          
          {/* Footer */}
          <Box 
            as="footer" 
            bg="gray.100" 
            p={4} 
            mt="auto"
          >
            <Container maxW="container.xl">
              <Text textAlign="center">
                &copy; {new Date().getFullYear()} Music Blog Aggregator
              </Text>
            </Container>
          </Box>
        </Flex>
      </Router>
    </ChakraProvider>
  );
};

export default App; 