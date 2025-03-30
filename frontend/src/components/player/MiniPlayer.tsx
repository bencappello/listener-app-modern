import React from 'react';
import {
  Box,
  Flex,
  Image,
  Text,
  IconButton,
  useColorModeValue,
  Tooltip,
  Collapse,
} from '@chakra-ui/react';
import { FaCaretUp, FaCaretDown } from 'react-icons/fa';
import { usePlayer } from '../../contexts/PlayerContext';
import PlayerControls from './PlayerControls';
import { truncateString } from '../../utils/formatters';

interface MiniPlayerProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

/**
 * A compact player that shows the currently playing song with basic controls
 */
const MiniPlayer: React.FC<MiniPlayerProps> = ({ 
  isOpen = true, 
  onToggle 
}) => {
  const {
    currentSong,
    isPlaying,
    queue,
  } = usePlayer();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');

  // Do not render if there is no current song
  if (!currentSong) return null;

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      zIndex="sticky"
      bg={bgColor}
      boxShadow="0 -2px 10px rgba(0, 0, 0, 0.05)"
      borderTopWidth="1px"
      borderColor={borderColor}
      data-testid="mini-player"
    >
      {/* Toggle button */}
      {onToggle && (
        <Flex justify="center">
          <IconButton
            icon={isOpen ? <FaCaretDown /> : <FaCaretUp />}
            aria-label={isOpen ? "Collapse player" : "Expand player"}
            size="sm"
            variant="ghost"
            onClick={onToggle}
            position="absolute"
            top="-16px"
            borderTopRadius="md"
            borderBottomRadius="0"
            bg={bgColor}
            borderTopWidth="1px"
            borderLeftWidth="1px"
            borderRightWidth="1px"
            borderColor={borderColor}
            data-testid="toggle-player-button"
          />
        </Flex>
      )}
      
      <Collapse in={isOpen} animateOpacity>
        <Box p={4}>
          <Flex align="center">
            {/* Album/Song Image */}
            <Image
              src={currentSong.imageUrl || 'https://via.placeholder.com/80?text=No+Image'}
              alt={currentSong.title}
              boxSize="60px"
              objectFit="cover"
              borderRadius="md"
              mr={4}
              fallbackSrc="https://via.placeholder.com/80?text=No+Image"
              data-testid="song-image"
            />
            
            {/* Song Info */}
            <Box flex="1" minWidth="0">
              <Tooltip label={currentSong.title} placement="top" hasArrow>
                <Text
                  fontWeight="bold"
                  color={textColor}
                  noOfLines={1}
                  data-testid="song-title"
                >
                  {truncateString(currentSong.title, 40)}
                </Text>
              </Tooltip>
              
              <Tooltip label={currentSong.artist} placement="bottom" hasArrow>
                <Text
                  fontSize="sm"
                  color={secondaryTextColor}
                  noOfLines={1}
                  data-testid="song-artist"
                >
                  {truncateString(currentSong.artist, 40)}
                </Text>
              </Tooltip>
              
              <Text
                fontSize="xs"
                color={secondaryTextColor}
                data-testid="song-blog"
              >
                {currentSong.blogName}
              </Text>
            </Box>
            
            {/* Player Controls */}
            <Box ml={4} minWidth="200px">
              <PlayerControls 
                showSeekBar={false} 
                showVolumeControl={false}
                size="sm"
              />
            </Box>
            
            {/* Queue Info */}
            <Box ml={2} textAlign="right" display={{ base: 'none', md: 'block' }}>
              <Text fontSize="xs" color={secondaryTextColor}>
                {queue.length > 0 && `Next up: ${queue.length} song${queue.length !== 1 ? 's' : ''}`}
              </Text>
            </Box>
          </Flex>
        </Box>
      </Collapse>
    </Box>
  );
};

export default MiniPlayer; 