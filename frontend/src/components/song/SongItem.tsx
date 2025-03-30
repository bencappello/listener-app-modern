import React from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Image,
  useColorModeValue,
  HStack,
  Tooltip,
  Badge,
} from '@chakra-ui/react';
import { 
  FaPlay, 
  FaPause, 
  FaHeart, 
  FaRegHeart, 
  FaEllipsisH, 
  FaPlus 
} from 'react-icons/fa';
import { usePlayer } from '../../contexts/PlayerContext';
import { Song } from '../../types/entities';
import { truncateString } from '../../utils/formatters';

interface SongItemProps {
  song: Song;
  showBlog?: boolean;
  showImage?: boolean;
  onAddToFavorites?: (songId: number | string) => void;
  onRemoveFromFavorites?: (songId: number | string) => void;
}

const SongItem: React.FC<SongItemProps> = ({
  song,
  showBlog = true,
  showImage = true,
  onAddToFavorites,
  onRemoveFromFavorites,
}) => {
  const { 
    currentSong, 
    isPlaying, 
    play, 
    pause, 
    addToQueue 
  } = usePlayer();
  
  const isCurrentSong = currentSong?.id === song.id;
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  
  const handlePlayPause = () => {
    if (isCurrentSong) {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    } else {
      play(song);
    }
  };
  
  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(song);
  };
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (song.isFavorite && onRemoveFromFavorites) {
      onRemoveFromFavorites(song.id);
    } else if (!song.isFavorite && onAddToFavorites) {
      onAddToFavorites(song.id);
    }
  };

  return (
    <Box
      p={3}
      borderWidth="1px"
      borderRadius="md"
      borderColor={borderColor}
      bg={bgColor}
      _hover={{ bg: hoverBgColor }}
      cursor="pointer"
      onClick={handlePlayPause}
      data-testid={`song-item-${song.id}`}
    >
      <Flex align="center">
        {/* Song Image */}
        {showImage && (
          <Image
            src={song.imageUrl || 'https://via.placeholder.com/80?text=No+Image'}
            alt={song.title}
            boxSize="60px"
            objectFit="cover"
            borderRadius="md"
            mr={3}
            fallbackSrc="https://via.placeholder.com/80?text=No+Image"
          />
        )}
        
        {/* Song Info */}
        <Box flex="1" minWidth="0">
          <Flex align="center" mb={1}>
            {isCurrentSong && (
              <Badge colorScheme="purple" mr={2} fontSize="xs">
                {isPlaying ? 'Playing' : 'Paused'}
              </Badge>
            )}
            <Text
              fontWeight="bold"
              color={textColor}
              noOfLines={1}
              data-testid="song-title"
            >
              {truncateString(song.title, 40)}
            </Text>
          </Flex>
          
          <Text
            fontSize="sm"
            color={secondaryTextColor}
            noOfLines={1}
            data-testid="song-artist"
          >
            {song.artist}
          </Text>
          
          {showBlog && (
            <Text
              fontSize="xs"
              color={secondaryTextColor}
              noOfLines={1}
              data-testid="song-blog"
            >
              From: {song.blogName}
            </Text>
          )}
        </Box>
        
        {/* Action Buttons */}
        <HStack spacing={1}>
          {/* Play/Pause Button */}
          <Tooltip label={isCurrentSong && isPlaying ? 'Pause' : 'Play'}>
            <IconButton
              icon={isCurrentSong && isPlaying ? <FaPause /> : <FaPlay />}
              aria-label={isCurrentSong && isPlaying ? 'Pause' : 'Play'}
              size="sm"
              colorScheme="purple"
              variant="ghost"
              data-testid="play-button"
            />
          </Tooltip>
          
          {/* Add to Queue Button */}
          <Tooltip label="Add to Queue">
            <IconButton
              icon={<FaPlus />}
              aria-label="Add to queue"
              size="sm"
              variant="ghost"
              onClick={handleAddToQueue}
              data-testid="queue-button"
            />
          </Tooltip>
          
          {/* Favorite Button */}
          {(onAddToFavorites || onRemoveFromFavorites) && (
            <Tooltip label={song.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}>
              <IconButton
                icon={song.isFavorite ? <FaHeart /> : <FaRegHeart />}
                aria-label={song.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                size="sm"
                colorScheme={song.isFavorite ? 'red' : 'gray'}
                variant="ghost"
                onClick={handleToggleFavorite}
                data-testid="favorite-button"
              />
            </Tooltip>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default SongItem; 