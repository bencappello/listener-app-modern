import React from 'react';
import {
  Box,
  Image,
  Text,
  Link,
  Flex,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react';
import { FaHeart, FaRegHeart, FaPlay } from 'react-icons/fa';
import { Song } from '../../types/entities';

interface SongCardProps {
  song: Song;
  onToggleFavorite: (songId: number | string) => void;
  onPlay: (song: Song) => void;
}

const SongCard: React.FC<SongCardProps> = ({ song, onToggleFavorite, onPlay }) => {
  const { title, artist, blogName, imageUrl, postUrl, isFavorite } = song;
  
  const placeholderImage = '/assets/images/music-placeholder.jpg';
  const displayImage = imageUrl && imageUrl.length > 0 ? imageUrl : placeholderImage;
  
  const bgOverlay = useColorModeValue('rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.7)');
  const heartColor = useColorModeValue('red.500', 'red.300');
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box 
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={cardBg}
      borderColor={cardBorderColor}
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'lg'
      }}
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <Box position="relative" paddingTop="100%">
        <Image
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          objectFit="cover"
          src={displayImage}
          alt={title}
          fallbackSrc={placeholderImage}
        />
        
        <Box
          position="absolute"
          bottom="0"
          left="0"
          width="100%"
          bg={bgOverlay}
          color="white"
          p={2}
        >
          <Flex justifyContent="space-between" alignItems="center">
            <Text 
              fontSize="sm" 
              noOfLines={1}
              width="70%"
            >
              {artist}
            </Text>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              icon={isFavorite ? <FaHeart /> : <FaRegHeart />}
              color={isFavorite ? heartColor : "white"}
              onClick={() => onToggleFavorite(song.id)}
            />
          </Flex>
        </Box>
        
        <IconButton
          aria-label="Play song"
          icon={<FaPlay />}
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          size="lg"
          colorScheme="blue"
          opacity="0"
          _groupHover={{ opacity: 0.9 }}
          onClick={() => onPlay(song)}
          borderRadius="full"
        />
      </Box>
      
      <Box p={4} flex="1">
        <Text 
          fontWeight="semibold" 
          fontSize="md" 
          noOfLines={1} 
          title={title}
          mb={2}
        >
          {title}
        </Text>
        
        <Link 
          href={postUrl}
          isExternal
          color="blue.500"
          fontSize="sm"
          display="block"
        >
          {blogName}
        </Link>
      </Box>
    </Box>
  );
};

export default SongCard; 