import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  List,
  ListItem,
  IconButton,
  Image,
  useColorModeValue,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { CloseIcon, DeleteIcon } from '@chakra-ui/icons';
import { usePlayer } from '../../contexts/PlayerContext';
import { truncateString } from '../../utils/formatters';

interface QueueDisplayProps {
  onClose?: () => void;
  maxHeight?: string;
}

/**
 * Component to display and manage the current song queue
 */
const QueueDisplay: React.FC<QueueDisplayProps> = ({
  onClose,
  maxHeight = '400px',
}) => {
  const {
    queue,
    currentSong,
    clearQueue,
    removeFromQueue,
    play,
  } = usePlayer();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  
  const handleSongClick = (index: number) => {
    if (index < queue.length) {
      const song = queue[index];
      play(song);
    }
  };
  
  const handleRemoveSong = (
    e: React.MouseEvent<HTMLButtonElement>,
    songId: string | number
  ) => {
    e.stopPropagation();
    removeFromQueue(songId);
  };

  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="md"
      boxShadow="md"
      borderWidth="1px"
      borderColor={borderColor}
      data-testid="queue-display"
    >
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontWeight="bold" fontSize="lg" color={textColor}>
          Queue {queue.length ? `(${queue.length})` : ''}
        </Text>
        
        <HStack>
          {queue.length > 0 && (
            <Button
              size="xs"
              colorScheme="red"
              variant="ghost"
              leftIcon={<DeleteIcon />}
              onClick={clearQueue}
              data-testid="clear-queue-button"
            >
              Clear
            </Button>
          )}
          
          {onClose && (
            <IconButton
              size="sm"
              aria-label="Close queue"
              icon={<CloseIcon />}
              variant="ghost"
              onClick={onClose}
              data-testid="close-queue-button"
            />
          )}
        </HStack>
      </Flex>
      
      {/* Currently playing song */}
      {currentSong && (
        <Box mb={4}>
          <Text fontSize="sm" fontWeight="medium" mb={2} color={secondaryTextColor}>
            Now playing
          </Text>
          
          <Flex
            p={2}
            borderRadius="md"
            alignItems="center"
            bg={hoverBgColor}
            data-testid="current-song"
          >
            <Image
              src={currentSong.imageUrl || 'https://via.placeholder.com/50?text=No+Image'}
              alt={currentSong.title}
              boxSize="40px"
              objectFit="cover"
              borderRadius="md"
              mr={3}
              fallbackSrc="https://via.placeholder.com/50?text=No+Image"
            />
            
            <Box flex="1" minWidth="0">
              <Text
                fontWeight="bold"
                fontSize="sm"
                noOfLines={1}
                color={textColor}
              >
                {truncateString(currentSong.title, 30)}
              </Text>
              
              <Text
                fontSize="xs"
                color={secondaryTextColor}
                noOfLines={1}
              >
                {currentSong.artist}
              </Text>
            </Box>
          </Flex>
        </Box>
      )}
      
      {/* Queue list */}
      {queue.length > 0 ? (
        <Box
          maxHeight={maxHeight}
          overflowY="auto"
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
          data-testid="queue-list"
        >
          <List spacing={0}>
            {queue.map((song, index) => (
              <ListItem
                key={`${song.id}-${index}`}
                p={2}
                borderBottomWidth={index < queue.length - 1 ? '1px' : '0'}
                borderColor={borderColor}
                _hover={{ bg: hoverBgColor, cursor: 'pointer' }}
                onClick={() => handleSongClick(index)}
                data-testid={`queue-item-${index}`}
              >
                <Flex alignItems="center">
                  <Text fontSize="xs" color={secondaryTextColor} minWidth="20px">
                    {index + 1}
                  </Text>
                  
                  <Image
                    src={song.imageUrl || 'https://via.placeholder.com/50?text=No+Image'}
                    alt={song.title}
                    boxSize="30px"
                    objectFit="cover"
                    borderRadius="md"
                    mr={2}
                    fallbackSrc="https://via.placeholder.com/50?text=No+Image"
                  />
                  
                  <Box flex="1" minWidth="0">
                    <Text
                      fontSize="sm"
                      noOfLines={1}
                      color={textColor}
                    >
                      {truncateString(song.title, 30)}
                    </Text>
                    
                    <Text
                      fontSize="xs"
                      color={secondaryTextColor}
                      noOfLines={1}
                    >
                      {song.artist}
                    </Text>
                  </Box>
                  
                  <IconButton
                    size="xs"
                    aria-label="Remove from queue"
                    icon={<CloseIcon />}
                    variant="ghost"
                    onClick={(e) => handleRemoveSong(e, song.id)}
                    data-testid={`remove-queue-item-${index}`}
                  />
                </Flex>
              </ListItem>
            ))}
          </List>
        </Box>
      ) : (
        <VStack
          spacing={2}
          p={4}
          borderWidth="1px"
          borderStyle="dashed"
          borderColor={borderColor}
          borderRadius="md"
          data-testid="empty-queue"
        >
          <Text color={secondaryTextColor} fontSize="sm" textAlign="center">
            No songs in queue
          </Text>
          <Text color={secondaryTextColor} fontSize="xs" textAlign="center">
            Add songs to your queue by clicking the queue button on any song
          </Text>
        </VStack>
      )}
    </Box>
  );
};

export default QueueDisplay; 