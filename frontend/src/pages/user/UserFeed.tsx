import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Flex, 
  Text, 
  Alert, 
  AlertIcon, 
  Button, 
  Stack,
  useColorModeValue
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import SongList from '../../components/song/SongList';
import * as songService from '../../services/song.service';
import * as userService from '../../services/user.service';
import { Song } from '../../types/entities';

export const UserFeed: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchFeedSongs();
  }, [page]);

  const fetchFeedSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the song service to get feed songs
      const response = await songService.getSongs({ 
        page, 
        limit: itemsPerPage, 
        feed: true // This parameter tells the API to return feed songs
      });
      
      setSongs(response.items || []);
      
      if (response.pagination) {
        setTotalPages(Math.ceil(response.pagination.total / itemsPerPage));
      }
    } catch (err) {
      console.error('Error fetching feed songs:', err);
      setError('Error loading your feed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (songId: number | string) => {
    try {
      const updatedSong = await songService.toggleFavorite(songId);
      
      // Update song in the list
      setSongs(prevSongs => 
        prevSongs.map(song => 
          song.id === songId ? { ...song, isFavorite: updatedSong.isFavorite } : song
        )
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handlePlaySong = (song: Song) => {
    console.log('Playing song:', song.title);
    // This would be implemented with audio player integration
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <Flex justify="center" mt={6}>
        <Stack direction="row" spacing={2}>
          <Button
            leftIcon={<ChevronLeftIcon />}
            onClick={() => handlePageChange(page - 1)}
            isDisabled={page === 1}
            aria-label="Go to previous page"
          >
            Previous
          </Button>
          
          <Flex align="center" px={4}>
            <Text>{page} of {totalPages}</Text>
          </Flex>
          
          <Button
            rightIcon={<ChevronRightIcon />}
            onClick={() => handlePageChange(page + 1)}
            isDisabled={page >= totalPages}
            aria-label="Go to next page"
          >
            Next
          </Button>
        </Stack>
      </Flex>
    );
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" mb={6}>Your Music Feed</Heading>
      
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      <Box
        bg={bgColor}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
        p={6}
      >
        <SongList
          songs={songs}
          onToggleFavorite={handleToggleFavorite}
          onPlaySong={handlePlaySong}
          isLoading={loading}
          title="Recent Songs"
        />
        
        {!loading && songs.length === 0 && !error && (
          <Box textAlign="center" p={8}>
            <Text fontSize="lg" color="gray.500">
              No songs in your feed
            </Text>
            <Text color="gray.500" mt={2}>
              Follow more blogs and users to see more music in your feed
            </Text>
          </Box>
        )}
        
        {renderPagination()}
      </Box>
    </Container>
  );
};

export default UserFeed; 