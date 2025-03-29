import React from 'react';
import { Box, Heading, Text, SimpleGrid, Container } from '@chakra-ui/react';

const HomePage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading as="h1" size="2xl" mb={4}>
          Discover New Music
        </Heading>
        <Text fontSize="xl" color="gray.600">
          Find your next favorite tracks from across the music blogosphere
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
        {/* Placeholder for content - we'll add actual content in future steps */}
        {Array.from({ length: 6 }).map((_, i) => (
          <Box 
            key={i} 
            p={5} 
            shadow="md" 
            borderWidth="1px" 
            borderRadius="md"
            bg="white"
            height="200px"
          >
            <Heading size="md" mb={4}>Featured Content {i + 1}</Heading>
            <Text>
              This is a placeholder for featured content that will be dynamically loaded
              once we implement the song and blog components.
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Container>
  );
};

export default HomePage; 