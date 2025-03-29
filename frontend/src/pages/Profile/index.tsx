import React from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Avatar, 
  Button, 
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  SimpleGrid
} from '@chakra-ui/react';
import { useAppSelector } from '../../store';

const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Box p={8} borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm">
          <HStack spacing={8} align="flex-start">
            <Avatar
              size="2xl"
              name={user?.username}
              src={user?.profile_picture}
              bg="blue.500"
            />
            <VStack align="flex-start" spacing={4} flex={1}>
              <Heading size="lg">{user?.username}</Heading>
              <Text color="gray.600">{user?.email}</Text>
              <Text>
                {user?.bio || 'No bio yet. Tell us about your music taste!'}
              </Text>
              <Button colorScheme="blue" size="sm">
                Edit Profile
              </Button>
            </VStack>
          </HStack>
        </Box>

        <Box p={8} borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm">
          <Heading size="md" mb={6}>
            Activity Stats
          </Heading>
          <StatGroup>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} width="100%">
              <Stat>
                <StatLabel>Favorite Songs</StatLabel>
                <StatNumber>0</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Following</StatLabel>
                <StatNumber>0</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Followers</StatLabel>
                <StatNumber>0</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Comments</StatLabel>
                <StatNumber>0</StatNumber>
              </Stat>
            </SimpleGrid>
          </StatGroup>
        </Box>

        <Box p={8} borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm">
          <Heading size="md" mb={6}>
            Recent Activity
          </Heading>
          <Text color="gray.500">No recent activity to show.</Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default ProfilePage; 