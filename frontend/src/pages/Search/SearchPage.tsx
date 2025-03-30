import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Text,
  Spinner,
  Center,
  useToast,
  Flex,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import SearchBox from '../../components/search/SearchBox';
import SongList from '../../components/song/SongList';
import BlogList from '../../components/blog/BlogList';
import UserList from '../../components/user/UserList';
import Pagination from '../../components/common/Pagination';
import { searchSongs } from '../../services/song.service';
import { searchBlogs } from '../../services/blog.service';
import { searchUsers } from '../../services/user.service';
import { Song, Blog, User, PaginatedResponse } from '../../types/entities';

type SearchCategory = 'songs' | 'blogs' | 'users';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Get search query and category from URL params
  const query = searchParams.get('q') || '';
  const category = (searchParams.get('category') || 'songs') as SearchCategory;
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  // State for search results
  const [songs, setSongs] = useState<Song[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // State for tracking counts and loading
  const [songsCount, setSongsCount] = useState(0);
  const [blogsCount, setBlogsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(
    category === 'songs' ? 0 : category === 'blogs' ? 1 : 2
  );
  
  const itemsPerPage = 10;

  // Search for songs
  const searchForSongs = useCallback(async (searchQuery: string, pageNum: number) => {
    try {
      setIsLoading(true);
      const response = await searchSongs(searchQuery, pageNum, itemsPerPage);
      setSongs(response.items);
      setSongsCount(response.totalItems);
    } catch (error) {
      console.error('Error searching songs:', error);
      toast({
        title: 'Error',
        description: 'Failed to search songs. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setSongs([]);
      setSongsCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Search for blogs
  const searchForBlogs = useCallback(async (searchQuery: string, pageNum: number) => {
    try {
      setIsLoading(true);
      const response = await searchBlogs(searchQuery, pageNum, itemsPerPage);
      setBlogs(response.items);
      setBlogsCount(response.totalItems);
    } catch (error) {
      console.error('Error searching blogs:', error);
      toast({
        title: 'Error',
        description: 'Failed to search blogs. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setBlogs([]);
      setBlogsCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Search for users
  const searchForUsers = useCallback(async (searchQuery: string, pageNum: number) => {
    try {
      setIsLoading(true);
      const response = await searchUsers(searchQuery, pageNum, itemsPerPage);
      setUsers(response.items);
      setUsersCount(response.totalItems);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to search users. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setUsers([]);
      setUsersCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Perform search when query, category, or page changes
  useEffect(() => {
    if (!query) return;
    
    switch (category) {
      case 'songs':
        searchForSongs(query, page);
        break;
      case 'blogs':
        searchForBlogs(query, page);
        break;
      case 'users':
        searchForUsers(query, page);
        break;
      default:
        searchForSongs(query, page);
    }
  }, [query, category, page, searchForSongs, searchForBlogs, searchForUsers]);

  // Handle search submission
  const handleSearch = (searchQuery: string) => {
    // Update URL params and reset to page 1
    setSearchParams({
      q: searchQuery,
      category,
      page: '1',
    });
  };

  // Handle tab change
  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
    const newCategory = index === 0 ? 'songs' : index === 1 ? 'blogs' : 'users';
    
    // Update URL params and reset to page 1
    setSearchParams({
      q: query,
      category: newCategory,
      page: '1',
    });
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setSearchParams({
      q: query,
      category,
      page: newPage.toString(),
    });
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (songId: number) => {
    // This would call your actual toggle favorite service
    // For now, just update the UI
    setSongs(songs.map(song => {
      if (song.id === songId) {
        return { ...song, isFavorite: !song.isFavorite };
      }
      return song;
    }));
  };

  // Handle blog follow toggle
  const handleToggleFollow = async (blogId: number) => {
    // This would call your actual toggle follow service
    // For now, just update the UI
    setBlogs(blogs.map(blog => {
      if (blog.id === blogId) {
        return { ...blog };
      }
      return blog;
    }));
  };

  // Handle user follow toggle
  const handleFollowUser = async (userId: number) => {
    // This would call your actual follow user service
    // For now, just update the UI
    setUsers(users.map(user => {
      if (user.id === userId) {
        return { ...user, isFollowing: !user.isFollowing };
      }
      return user;
    }));
  };

  // Handle user click
  const handleUserClick = (user: User) => {
    window.location.href = `/users/${user.id}`;
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={6}>
        Search
      </Heading>
      
      <Box mb={6}>
        <SearchBox
          placeholder="Search for songs, blogs, or users..."
          onSearch={handleSearch}
          defaultValue={query}
          size="lg"
          autoFocus={!query}
        />
      </Box>
      
      {query ? (
        <Box 
          borderWidth="1px" 
          borderRadius="lg" 
          overflow="hidden" 
          boxShadow="sm"
          bg={bgColor}
          borderColor={borderColor}
        >
          <Tabs 
            index={activeTabIndex} 
            onChange={handleTabChange} 
            colorScheme="purple" 
            variant="enclosed"
          >
            <TabList>
              <Tab>
                Songs 
                {songsCount > 0 && (
                  <Badge ml={2} colorScheme="purple" borderRadius="full">
                    {songsCount}
                  </Badge>
                )}
              </Tab>
              <Tab>
                Blogs
                {blogsCount > 0 && (
                  <Badge ml={2} colorScheme="purple" borderRadius="full">
                    {blogsCount}
                  </Badge>
                )}
              </Tab>
              <Tab>
                Users
                {usersCount > 0 && (
                  <Badge ml={2} colorScheme="purple" borderRadius="full">
                    {usersCount}
                  </Badge>
                )}
              </Tab>
            </TabList>
            
            <TabPanels>
              {/* Songs Tab */}
              <TabPanel px={4} py={4}>
                {isLoading ? (
                  <Center py={10}>
                    <Spinner color="purple.500" size="xl" />
                  </Center>
                ) : songs.length > 0 ? (
                  <>
                    <SongList
                      songs={songs}
                      onToggleFavorite={handleToggleFavorite}
                      showBlogInfo={true}
                    />
                    
                    {songsCount > itemsPerPage && (
                      <Flex justify="center" mt={6}>
                        <Pagination
                          currentPage={page}
                          totalItems={songsCount}
                          itemsPerPage={itemsPerPage}
                          onPageChange={handlePageChange}
                        />
                      </Flex>
                    )}
                  </>
                ) : (
                  <Text textAlign="center" py={10} color="gray.500">
                    No songs found matching "{query}"
                  </Text>
                )}
              </TabPanel>
              
              {/* Blogs Tab */}
              <TabPanel px={4} py={4}>
                {isLoading ? (
                  <Center py={10}>
                    <Spinner color="purple.500" size="xl" />
                  </Center>
                ) : blogs.length > 0 ? (
                  <>
                    <BlogList
                      blogs={blogs}
                      onToggleFollow={handleToggleFollow}
                      onBlogClick={(blog) => {
                        window.location.href = `/blogs/${blog.id}`;
                      }}
                      isLoading={false}
                    />
                    
                    {blogsCount > itemsPerPage && (
                      <Flex justify="center" mt={6}>
                        <Pagination
                          currentPage={page}
                          totalItems={blogsCount}
                          itemsPerPage={itemsPerPage}
                          onPageChange={handlePageChange}
                        />
                      </Flex>
                    )}
                  </>
                ) : (
                  <Text textAlign="center" py={10} color="gray.500">
                    No blogs found matching "{query}"
                  </Text>
                )}
              </TabPanel>
              
              {/* Users Tab */}
              <TabPanel px={4} py={4}>
                {isLoading ? (
                  <Center py={10}>
                    <Spinner color="purple.500" size="xl" />
                  </Center>
                ) : users.length > 0 ? (
                  <>
                    <UserList
                      users={users}
                      onFollowChange={handleFollowUser}
                      onUserClick={handleUserClick}
                    />
                    
                    {usersCount > itemsPerPage && (
                      <Flex justify="center" mt={6}>
                        <Pagination
                          currentPage={page}
                          totalItems={usersCount}
                          itemsPerPage={itemsPerPage}
                          onPageChange={handlePageChange}
                        />
                      </Flex>
                    )}
                  </>
                ) : (
                  <Text textAlign="center" py={10} color="gray.500">
                    No users found matching "{query}"
                  </Text>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      ) : (
        <Box 
          borderWidth="1px" 
          borderRadius="lg" 
          overflow="hidden" 
          boxShadow="sm"
          bg={bgColor}
          borderColor={borderColor}
          p={8}
          textAlign="center"
        >
          <Text fontSize="xl" color="gray.500" mb={4}>
            Enter a search term to find songs, blogs, and users
          </Text>
          <Text color="gray.500">
            You can search by title, artist, blog name, or username
          </Text>
        </Box>
      )}
    </Container>
  );
};

export default SearchPage; 