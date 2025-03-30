import React from 'react';
import {
  Box,
  Flex,
  Text,
  Grid,
  Spinner,
  Container,
  useBreakpointValue
} from '@chakra-ui/react';
import { Song } from '../../types/entities';
import SongCard from './SongCard';

interface SongListProps {
  songs: Song[];
  onToggleFavorite: (songId: number | string) => void;
  onPlaySong: (song: Song) => void;
  isLoading: boolean;
  title?: string;
}

// Create a simplified version of the SongList for tests
const SongList: React.FC<SongListProps> = ({
  songs,
  onToggleFavorite,
  onPlaySong,
  isLoading,
  title
}) => {
  // Determine columns based on breakpoint
  const columns = useBreakpointValue({
    base: 1,
    sm: 2,
    md: 3,
    lg: 4
  }) || 1;

  // Handle loading state
  if (isLoading) {
    return (
      <Flex
        data-testid="song-list-loading"
        direction="column"
        align="center"
        justify="center"
        minH="200px"
        width="100%"
      >
        <Spinner size="xl" />
        <Text mt={2}>Loading songs...</Text>
      </Flex>
    );
  }

  // Handle empty state
  if (!songs.length) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="200px"
        width="100%"
      >
        <Text fontSize="lg" fontWeight="medium">No songs found</Text>
      </Flex>
    );
  }

  return (
    <Box width="100%">
      {title && (
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          {title}
        </Text>
      )}
      
      <Grid 
        templateColumns={`repeat(${columns}, 1fr)`}
        gap={4}
      >
        {songs.map((song) => (
          <Box key={song.id}>
            <SongCard
              song={song}
              onToggleFavorite={onToggleFavorite}
              onPlay={onPlaySong}
            />
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

export default SongList; 