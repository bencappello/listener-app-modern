import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Avatar,
  Heading,
  Text,
  Button,
  Stack,
  Divider,
  Badge,
  Flex,
  Alert,
  AlertIcon,
  Spinner
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import * as userService from '../../services/user.service';
import { User, Song } from '../../types/entities';
import SongList from '../../components/song/SongList';

export const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [favoritesTotal, setFavoritesTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!id) {
          setError('No user ID provided');
          setLoading(false);
          return;
        }
        
        const userData = await userService.getUserById(id);
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Unable to load user profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      
      try {
        setFavoritesLoading(true);
        const response = await userService.getUserFavorites(user.id, { limit: 10 });
        setFavorites(response.items);
        setFavoritesTotal(response.totalItems);
      } catch (err) {
        console.error('Error fetching favorites:', err);
      } finally {
        setFavoritesLoading(false);
      }
    };

    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const handleToggleFollow = async () => {
    if (!user) return;
    
    try {
      const updatedUser = await userService.toggleFollow(user.id);
      setUser(updatedUser);
    } catch (err) {
      console.error('Error toggling follow status:', err);
    }
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleToggleFavorite = async (songId: number) => {
    // Update favorites in UI optimistically
    setFavorites(prevFavorites =>
      prevFavorites.map(song =>
        song.id === songId
          ? { ...song, isFavorite: !song.isFavorite }
          : song
      )
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        User not found
      </Alert>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Grid templateColumns={{ base: "1fr", md: "250px 1fr" }} gap={8}>
        {/* Left sidebar with user info */}
        <Box>
          <Flex direction="column" align="center">
            <Avatar 
              size="2xl" 
              name={user.username} 
              src={user.avatarUrl || user.profileImage} 
              mb={4}
              aria-label={`${user.username} avatar`}
            />
            
            <Heading as="h1" size="lg" mb={2}>
              {user.username}
            </Heading>
            
            {user.bio && (
              <Text color="gray.600" textAlign="center" mb={4}>
                {user.bio}
              </Text>
            )}
            
            <Stack direction="row" mt={2} mb={4}>
              <Badge colorScheme="blue" p={2} borderRadius="md">
                {user.followersCount || 0} followers
              </Badge>
              <Badge colorScheme="teal" p={2} borderRadius="md">
                {user.followingCount || 0} following
              </Badge>
            </Stack>
            
            {user.isCurrentUser ? (
              <Button 
                leftIcon={<EditIcon />} 
                colorScheme="blue" 
                variant="outline"
                onClick={handleEditProfile}
                width="full"
              >
                Edit Profile
              </Button>
            ) : (
              <Button 
                colorScheme={user.isFollowing ? "gray" : "blue"}
                onClick={handleToggleFollow}
                width="full"
              >
                {user.isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </Flex>
        </Box>
        
        {/* Right content area */}
        <Box>
          <Heading as="h2" size="md" mb={4}>
            Favorite Songs
          </Heading>
          
          <Divider mb={4} />
          
          <SongList
            songs={favorites}
            onToggleFavorite={handleToggleFavorite}
            isLoading={favoritesLoading}
            showBlogInfo={true}
            emptyMessage="No favorite songs yet"
          />
          
          {!favoritesLoading && favorites.length === 0 && (
            <Box p={4} textAlign="center">
              <Text color="gray.500">No favorite songs yet</Text>
            </Box>
          )}
        </Box>
      </Grid>
    </Container>
  );
};

export default UserProfile; 