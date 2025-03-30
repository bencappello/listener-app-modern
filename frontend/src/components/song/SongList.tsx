import React from 'react';
import {
  VStack,
  Box,
  Text,
  Flex,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { Song } from '../../types/entities';
import SongItem from './SongItem';

interface SongListProps {
  songs: Song[];
  isLoading?: boolean;
  emptyMessage?: string;
  showBlogInfo?: boolean;
  showImages?: boolean;
  onAddToFavorites?: (songId: number | string) => void;
  onRemoveFromFavorites?: (songId: number | string) => void;
  searchEnabled?: boolean;
  sortEnabled?: boolean;
}

const SongList: React.FC<SongListProps> = ({
  songs,
  isLoading = false,
  emptyMessage = 'No songs found',
  showBlogInfo = true,
  showImages = true,
  onAddToFavorites,
  onRemoveFromFavorites,
  searchEnabled = true,
  sortEnabled = true,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<string>('newest');
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  
  // Filter songs based on search query
  const filteredSongs = React.useMemo(() => {
    if (!searchQuery) return songs;
    
    const query = searchQuery.toLowerCase();
    return songs.filter(song => 
      song.title.toLowerCase().includes(query) || 
      song.artist.toLowerCase().includes(query) ||
      (showBlogInfo && song.blogName.toLowerCase().includes(query))
    );
  }, [songs, searchQuery, showBlogInfo]);
  
  // Sort songs based on sort selection
  const sortedSongs = React.useMemo(() => {
    const songsToSort = [...filteredSongs];
    
    switch (sortBy) {
      case 'title-asc':
        return songsToSort.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return songsToSort.sort((a, b) => b.title.localeCompare(a.title));
      case 'artist-asc':
        return songsToSort.sort((a, b) => a.artist.localeCompare(b.artist));
      case 'artist-desc':
        return songsToSort.sort((a, b) => b.artist.localeCompare(a.artist));
      case 'oldest':
        return songsToSort.sort((a, b) => new Date(a.postDate).getTime() - new Date(b.postDate).getTime());
      case 'newest':
      default:
        return songsToSort.sort((a, b) => new Date(b.postDate).getTime() - new Date(a.postDate).getTime());
    }
  }, [filteredSongs, sortBy]);
  
  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };
  
  // Render loading skeletons
  if (isLoading) {
    return (
      <Box data-testid="song-list-loading">
        {Array.from({ length: 5 }).map((_, index) => (
          <Box 
            key={index}
            p={3}
            mb={3}
            borderWidth="1px"
            borderRadius="md"
            borderColor={borderColor}
          >
            <Flex>
              {showImages && (
                <Skeleton 
                  height="60px" 
                  width="60px" 
                  mr={3} 
                  borderRadius="md" 
                />
              )}
              <Box flex="1">
                <Skeleton height="20px" mb={2} width="70%" />
                <Skeleton height="16px" mb={2} width="50%" />
                {showBlogInfo && <Skeleton height="14px" width="40%" />}
              </Box>
              <Skeleton height="30px" width="90px" />
            </Flex>
          </Box>
        ))}
      </Box>
    );
  }
  
  return (
    <Box data-testid="song-list">
      {/* Search and Sort Controls */}
      {(searchEnabled || sortEnabled) && (
        <Flex 
          mb={4} 
          direction={{ base: 'column', md: 'row' }} 
          gap={2}
        >
          {searchEnabled && (
            <InputGroup flex="1">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search songs..."
                borderColor={borderColor}
                data-testid="song-search"
              />
            </InputGroup>
          )}
          
          {sortEnabled && (
            <Select
              value={sortBy}
              onChange={handleSortChange}
              width={{ base: '100%', md: '200px' }}
              borderColor={borderColor}
              data-testid="song-sort"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="artist-asc">Artist (A-Z)</option>
              <option value="artist-desc">Artist (Z-A)</option>
            </Select>
          )}
        </Flex>
      )}
      
      {/* Songs List */}
      {sortedSongs.length > 0 ? (
        <VStack spacing={3} align="stretch">
          {sortedSongs.map(song => (
            <SongItem
              key={song.id}
              song={song}
              showBlog={showBlogInfo}
              showImage={showImages}
              onAddToFavorites={onAddToFavorites}
              onRemoveFromFavorites={onRemoveFromFavorites}
            />
          ))}
        </VStack>
      ) : (
        <Box 
          p={6} 
          textAlign="center" 
          borderWidth="1px" 
          borderRadius="md" 
          borderColor={borderColor}
          borderStyle="dashed"
          bg={bgColor}
          data-testid="song-list-empty"
        >
          <Text color={textColor}>{emptyMessage}</Text>
          {searchQuery && (
            <Text fontSize="sm" mt={2} color="gray.500">
              Try adjusting your search criteria
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SongList; 