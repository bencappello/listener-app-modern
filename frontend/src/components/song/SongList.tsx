import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Link,
  Flex,
  Badge,
  IconButton,
  Skeleton,
  SkeletonText,
  useColorModeValue,
  Image,
  Tooltip,
} from '@chakra-ui/react';
import { 
  ExternalLinkIcon, 
  TimeIcon, 
  StarIcon,
  InfoIcon,
} from '@chakra-ui/icons';
import { MdPlayArrow } from 'react-icons/md';
import { Song } from '../../types/entities';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import FavoriteButton from './FavoriteButton';

interface SongListProps {
  songs: Song[];
  isLoading?: boolean;
  onToggleFavorite: (songId: number) => void;
  showBlogInfo?: boolean;
  emptyMessage?: string;
}

const SongList: React.FC<SongListProps> = ({
  songs,
  isLoading = false,
  onToggleFavorite,
  showBlogInfo = true,
  emptyMessage = 'No songs found'
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

  // Loading state
  if (isLoading) {
    return (
      <Box>
        <SkeletonText mt="4" noOfLines={1} spacing="4" mb={4} />
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th width="60px"></Th>
              <Th>Title</Th>
              {showBlogInfo && <Th>Blog</Th>}
              <Th width="150px">Date</Th>
              <Th width="60px"></Th>
            </Tr>
          </Thead>
          <Tbody>
            {[...Array(5)].map((_, i) => (
              <Tr key={i}>
                <Td>
                  <Skeleton height="40px" width="40px" borderRadius="md" />
                </Td>
                <Td>
                  <SkeletonText noOfLines={2} spacing="2" />
                </Td>
                {showBlogInfo && (
                  <Td>
                    <SkeletonText noOfLines={1} spacing="2" />
                  </Td>
                )}
                <Td>
                  <Skeleton height="16px" width="80px" />
                </Td>
                <Td>
                  <Skeleton height="24px" width="24px" borderRadius="full" />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  }

  // Empty state
  if (songs.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" color={subTextColor}>
          {emptyMessage}
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th width="60px"></Th>
            <Th>Title</Th>
            {showBlogInfo && <Th>Blog</Th>}
            <Th width="150px">Date</Th>
            <Th width="60px"></Th>
          </Tr>
        </Thead>
        <Tbody>
          {songs.map((song) => (
            <Tr 
              key={song.id}
              _hover={{ bg: hoverBgColor }}
              transition="background-color 0.2s"
            >
              <Td>
                {song.audioUrl ? (
                  <Tooltip label="Play song">
                    <IconButton
                      aria-label="Play song"
                      icon={<MdPlayArrow />}
                      size="sm"
                      variant="ghost"
                      as="a"
                      href={song.audioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  </Tooltip>
                ) : (
                  <Box 
                    width="32px" 
                    height="32px" 
                    borderRadius="md" 
                    bg="gray.200" 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center"
                  >
                    <InfoIcon color="gray.400" boxSize={4} />
                  </Box>
                )}
              </Td>
              <Td>
                <Box>
                  <Link
                    href={song.postUrl}
                    isExternal
                    color={textColor}
                    fontWeight="medium"
                    display="inline-flex"
                    alignItems="center"
                  >
                    {song.title}
                    <ExternalLinkIcon mx="2px" boxSize={3} />
                  </Link>
                  <Text fontSize="sm" color={subTextColor}>
                    {song.artist}
                  </Text>
                </Box>
              </Td>
              {showBlogInfo && (
                <Td>
                  <Link
                    href={`/blogs/${song.blogId}`}
                    color={textColor}
                    _hover={{ textDecoration: 'underline' }}
                  >
                    {song.blogName}
                  </Link>
                </Td>
              )}
              <Td>
                <Tooltip label={formatDate(new Date(song.postDate))}>
                  <Flex align="center" color={subTextColor} fontSize="sm">
                    <TimeIcon mr={1} boxSize={3} />
                    {formatRelativeTime(new Date(song.postDate))}
                  </Flex>
                </Tooltip>
              </Td>
              <Td>
                <FavoriteButton
                  songId={song.id}
                  isFavorite={song.isFavorite || false}
                  onFavoriteChange={(favorite) => onToggleFavorite(song.id)}
                  size="sm"
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default SongList; 