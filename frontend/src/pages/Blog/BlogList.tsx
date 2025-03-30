import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Stack,
  Button,
  Flex,
  Text,
  useColorModeValue,
  useToast,
  InputRightElement,
  IconButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  CloseIcon, 
  ViewIcon, 
  ViewOffIcon,
  ChevronDownIcon,
  StarIcon
} from '@chakra-ui/icons';
import BlogList from '../../components/blog/BlogList';
import Pagination from '../../components/common/Pagination';
import { getBlogs, getFollowedBlogs, searchBlogs, toggleFollowBlog } from '../../services/blog.service';
import { Blog, PaginatedResponse } from '../../types/entities';

const BlogListPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [followedBlogs, setFollowedBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followedLoading, setFollowedLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState<string>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [followedPage, setFollowedPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [followedTotal, setFollowedTotal] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState(0);
  const [showActive, setShowActive] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const navigate = useNavigate();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchBlogs = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let response: PaginatedResponse<Blog>;
      if (searchQuery) {
        response = await searchBlogs(searchQuery, currentPage, itemsPerPage);
      } else {
        response = await getBlogs(currentPage, itemsPerPage);
      }
      
      // Filter by active status if needed
      let filteredBlogs = response.items;
      if (showActive) {
        filteredBlogs = filteredBlogs.filter((blog: Blog) => blog.isActive);
      }
      
      // Sort blogs based on selection
      switch (sortBy) {
        case 'name':
          filteredBlogs.sort((a: Blog, b: Blog) => a.name.localeCompare(b.name));
          break;
        case 'oldest':
          filteredBlogs.sort((a: Blog, b: Blog) => 
            new Date(a.lastScraped || 0).getTime() - 
            new Date(b.lastScraped || 0).getTime()
          );
          break;
        case 'latest':
        default:
          filteredBlogs.sort((a: Blog, b: Blog) => 
            new Date(b.lastScraped || 0).getTime() - 
            new Date(a.lastScraped || 0).getTime()
          );
          break;
      }
      
      setBlogs(filteredBlogs);
      setTotalItems(response.totalItems);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast({
        title: 'Error fetching blogs',
        description: 'There was an error loading the blogs. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, sortBy, showActive, toast]);

  const fetchFollowedBlogs = useCallback(async () => {
    try {
      setFollowedLoading(true);
      const response = await getFollowedBlogs(followedPage, itemsPerPage);
      
      let filteredBlogs = response.items;
      if (showActive) {
        filteredBlogs = filteredBlogs.filter((blog: Blog) => blog.isActive);
      }
      
      setFollowedBlogs(filteredBlogs);
      setFollowedTotal(response.totalItems);
    } catch (error) {
      console.error('Error fetching followed blogs:', error);
      toast({
        title: 'Error fetching followed blogs',
        description: 'There was an error loading your followed blogs. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setFollowedLoading(false);
    }
  }, [followedPage, itemsPerPage, showActive, toast]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    if (activeTab === 1) {
      fetchFollowedBlogs();
    }
  }, [activeTab, fetchFollowedBlogs]);

  const handleToggleFollow = async (blogId: number) => {
    try {
      await toggleFollowBlog(blogId);
      
      // Update the blogs list to reflect changes
      setBlogs(blogs.map(blog => {
        if (blog.id === blogId) {
          return { ...blog };
        }
        return blog;
      }));
      
      // Refresh followed blogs if we're on that tab
      if (activeTab === 1) {
        fetchFollowedBlogs();
      }
      
      toast({
        title: 'Success',
        description: 'Blog follow status updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: 'Error',
        description: 'Failed to update follow status. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      setIsSearching(true);
      setCurrentPage(1); // Reset to first page
      fetchBlogs();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    setIsSearching(false);
  };

  const handleBlogClick = (blog: Blog) => {
    navigate(`/blogs/${blog.id}`);
  };

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFollowedPageChange = (page: number) => {
    setFollowedPage(page);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={6}>
        Music Blogs
      </Heading>
      
      <Tabs 
        isFitted 
        variant="enclosed" 
        colorScheme="purple" 
        onChange={handleTabChange} 
        mb={6}
      >
        <TabList>
          <Tab>All Blogs</Tab>
          <Tab>Following</Tab>
        </TabList>
        
        <Box 
          mt={4} 
          p={4} 
          borderWidth="1px" 
          borderColor={borderColor} 
          borderRadius="md" 
          bg={bgColor} 
          boxShadow="sm"
        >
          <Stack 
            direction={{ base: 'column', md: 'row' }} 
            mb={4} 
            spacing={4}
            justify="space-between"
          >
            <InputGroup maxW={{ base: '100%', md: '400px' }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search blogs by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              {searchQuery && (
                <InputRightElement>
                  <IconButton
                    aria-label="Clear search"
                    icon={<CloseIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={clearSearch}
                  />
                </InputRightElement>
              )}
            </InputGroup>
            
            <Flex gap={2} wrap="wrap">
              <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="md">
                  Sort by
                </MenuButton>
                <MenuList>
                  <MenuItem 
                    onClick={() => setSortBy('latest')}
                    fontWeight={sortBy === 'latest' ? 'bold' : 'normal'}
                  >
                    Latest Updated
                  </MenuItem>
                  <MenuItem 
                    onClick={() => setSortBy('oldest')}
                    fontWeight={sortBy === 'oldest' ? 'bold' : 'normal'}
                  >
                    Oldest Updated
                  </MenuItem>
                  <MenuItem 
                    onClick={() => setSortBy('name')}
                    fontWeight={sortBy === 'name' ? 'bold' : 'normal'}
                  >
                    Name
                  </MenuItem>
                </MenuList>
              </Menu>

              <Checkbox 
                isChecked={showActive} 
                onChange={(e) => setShowActive(e.target.checked)}
                colorScheme="purple"
                alignSelf="center"
              >
                Active blogs only
              </Checkbox>
              
              <IconButton
                aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
                icon={viewMode === 'grid' ? <ViewIcon /> : <ViewOffIcon />}
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                variant="outline"
              />
            </Flex>
          </Stack>
          
          {isSearching && (
            <Text mb={4} fontSize="sm" color="gray.600">
              Searching for "{searchQuery}"...
            </Text>
          )}
          
          <TabPanels>
            <TabPanel p={0}>
              <BlogList
                blogs={blogs}
                onToggleFollow={handleToggleFollow}
                onBlogClick={handleBlogClick}
                isLoading={isLoading}
                layout={viewMode}
                title={searchQuery ? `Search Results (${totalItems})` : undefined}
              />
              
              {!isLoading && blogs.length > 0 && (
                <Flex justify="center" mt={6}>
                  <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                  />
                </Flex>
              )}
            </TabPanel>
            
            <TabPanel p={0}>
              <BlogList
                blogs={followedBlogs}
                onToggleFollow={handleToggleFollow}
                onBlogClick={handleBlogClick}
                isLoading={followedLoading}
                layout={viewMode}
                title={followedTotal > 0 ? `Followed Blogs (${followedTotal})` : undefined}
              />
              
              {!followedLoading && followedBlogs.length > 0 && (
                <Flex justify="center" mt={6}>
                  <Pagination
                    currentPage={followedPage}
                    totalItems={followedTotal}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handleFollowedPageChange}
                  />
                </Flex>
              )}
              
              {!followedLoading && followedBlogs.length === 0 && !showActive && (
                <Box textAlign="center" py={8}>
                  <StarIcon boxSize={10} color="purple.400" mb={4} />
                  <Heading size="md" mb={2}>You're not following any blogs yet</Heading>
                  <Text color="gray.500">
                    Follow blogs to keep track of your favorite music sources
                  </Text>
                  <Button 
                    mt={4} 
                    colorScheme="purple" 
                    onClick={() => setActiveTab(0)}
                  >
                    Explore Blogs
                  </Button>
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Box>
      </Tabs>
    </Container>
  );
};

export default BlogListPage; 