import React from 'react';
import {
  Box,
  Flex,
  Text,
  Link,
  Badge,
  IconButton,
  Image,
  useColorModeValue,
  Tooltip,
  Card,
  CardBody,
  CardFooter,
  Heading,
  Stack,
} from '@chakra-ui/react';
import { 
  ExternalLinkIcon, 
  TimeIcon, 
  StarIcon, 
  InfoIcon 
} from '@chakra-ui/icons';
import { MdPlayArrow } from 'react-icons/md';
import { Song } from '../../types/entities';
import { formatRelativeTime } from '../../utils/formatters';
import FavoriteButton from './FavoriteButton';

interface SongCardProps {
  song: Song;
  onToggleFavorite: (songId: number) => void;
  onPlay?: (song: Song) => void;
  showBlogInfo?: boolean;
}

const SongCard: React.FC<SongCardProps> = ({
  song,
  onToggleFavorite,
  onPlay,
  showBlogInfo = true,
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

  const imagePlaceholder = 'https://via.placeholder.com/300x200?text=No+Image';

  const handleFavoriteChange = () => {
    if (typeof song.id === 'number') {
      onToggleFavorite(song.id);
    } else if (typeof song.id === 'string') {
      onToggleFavorite(parseInt(song.id, 10));
    }
  };

  const handlePlay = () => {
    if (onPlay && song.audioUrl) {
      onPlay(song);
    }
  };

  return (
    <Card 
      borderWidth="1px" 
      borderColor={borderColor}
      borderRadius="lg" 
      overflow="hidden"
      bg={cardBg}
      transition="all 0.2s"
      _hover={{ shadow: 'md', borderColor: 'purple.300' }}
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <Box position="relative">
        <Image
          src={song.imageUrl || imagePlaceholder}
          alt={song.title}
          height="160px"
          width="100%"
          objectFit="cover"
          fallbackSrc={imagePlaceholder}
        />
        {song.audioUrl && (
          <IconButton
            aria-label="Play song"
            icon={<MdPlayArrow />}
            position="absolute"
            bottom="2"
            right="2"
            colorScheme="purple"
            size="sm"
            isRound
            onClick={handlePlay}
          />
        )}
      </Box>
      
      <CardBody py={3} px={4} flex="1">
        <Stack spacing={1}>
          <Heading size="sm" noOfLines={1}>
            <Link 
              href={song.postUrl}
              isExternal
              color={textColor}
              _hover={{ color: 'purple.500', textDecoration: 'none' }}
              display="inline-flex"
              alignItems="center"
            >
              {song.title}
              <ExternalLinkIcon ml={1} boxSize="12px" />
            </Link>
          </Heading>
          
          <Text fontSize="sm" color={subTextColor} noOfLines={1}>
            {song.artist}
          </Text>
          
          {showBlogInfo && (
            <Link
              href={`/blogs/${song.blogId}`}
              fontSize="sm"
              color="purple.500"
              _hover={{ textDecoration: 'underline' }}
              fontWeight="medium"
              noOfLines={1}
              mt={1}
            >
              {song.blogName}
            </Link>
          )}
          
          <Flex align="center" mt={1}>
            <TimeIcon boxSize={3} color={subTextColor} mr={1} />
            <Text fontSize="xs" color={subTextColor}>
              {formatRelativeTime(new Date(song.postDate))}
            </Text>
          </Flex>
        </Stack>
      </CardBody>
      
      <CardFooter 
        pt={0} 
        pb={3} 
        px={4}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        borderTop="none"
      >
        <FavoriteButton
          songId={song.id}
          isFavorite={song.isFavorite || false}
          onFavoriteChange={handleFavoriteChange}
          size="sm"
        />
        
        {song.tags && song.tags.length > 0 && (
          <Box>
            {song.tags.slice(0, 1).map((tag) => (
              <Badge 
                key={tag} 
                colorScheme="purple" 
                variant="subtle" 
                fontSize="xs"
              >
                {tag}
              </Badge>
            ))}
            {song.tags.length > 1 && (
              <Tooltip 
                label={song.tags.slice(1).join(', ')} 
                placement="top"
              >
                <Badge 
                  ml={1} 
                  colorScheme="gray" 
                  variant="subtle" 
                  fontSize="xs"
                >
                  +{song.tags.length - 1}
                </Badge>
              </Tooltip>
            )}
          </Box>
        )}
      </CardFooter>
    </Card>
  );
};

export default SongCard; 