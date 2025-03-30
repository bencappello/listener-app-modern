import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Button,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Flex,
  Spinner,
  Center,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import BlogDetail from '../../components/blog/BlogDetail';
import SongList from '../../components/song/SongList';
import { getBlogById, getBlogStats, toggleFollowBlog, getBlogRecentSongs } from '../../services/blog.service';
import { Blog, Song } from '../../types/entities';
import { toggleFavorite } from '../../services/song.service';

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState<{ songCount: number; followerCount: number } | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchBlog = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const blogId = parseInt(id, 10);
      const blogData = await getBlogById(blogId);
      setBlog(blogData);
      
      // Check if user is following the blog
      setIsFollowing(blogData.isFollowing || false);
      
      // Get blog statistics
      const blogStats = await getBlogStats(blogId);
      setStats(blogStats);
      
    } catch (error) {
      console.error('Error fetching blog details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog details. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setBlog(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  const fetchBlogSongs = useCallback(async () => {
    if (!id) return;
    
    try {
      setSongsLoading(true);
      const blogId = parseInt(id, 10);
      const songsData = await getBlogRecentSongs(blogId, 10);
      setSongs(songsData);
    } catch (error) {
      console.error('Error fetching blog songs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load songs from this blog. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setSongs([]);
    } finally {
      setSongsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  useEffect(() => {
    if (activeTab === 1) {
      fetchBlogSongs();
    }
  }, [activeTab, fetchBlogSongs]);

  const handleToggleFollow = async (blogId: number) => {
    try {
      const updatedBlog = await toggleFollowBlog(blogId);
      setIsFollowing(!!updatedBlog.isFollowing);
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          followerCount: stats.followerCount + (isFollowing ? -1 : 1)
        });
      }
      
      toast({
        title: isFollowing ? 'Unfollowed' : 'Following',
        description: `You have ${isFollowing ? 'unfollowed' : 'followed'} ${blog?.name}`,
        status: 'success',
        duration: 3000,
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

  const handleToggleFavorite = async (songId: number) => {
    try {
      const updatedSong = await toggleFavorite(songId);
      
      // Update the song in the list
      setSongs(songs.map(song => {
        if (song.id === songId) {
          return { ...song, isFavorite: updatedSong.isFavorite };
        }
        return song;
      }));
      
      toast({
        title: updatedSong.isFavorite ? 'Added to Favorites' : 'Removed from Favorites',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorite status. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBack = () => {
    navigate('/blogs');
  };

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  if (isLoading) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Button 
        leftIcon={<ArrowBackIcon />} 
        variant="ghost" 
        mb={6}
        onClick={handleBack}
      >
        Back to Blogs
      </Button>
      
      <BlogDetail
        blog={blog}
        onToggleFollow={handleToggleFollow}
        onBack={handleBack}
        isFollowing={isFollowing}
        stats={stats || undefined}
      />
      
      {blog && (
        <Box mt={8}>
          <Tabs colorScheme="purple" onChange={handleTabChange}>
            <TabList>
              <Tab>About</Tab>
              <Tab>Recent Songs</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <Box 
                  p={6} 
                  borderWidth="1px" 
                  borderColor={borderColor} 
                  borderRadius="lg" 
                  bg={bgColor}
                >
                  <Heading size="md" mb={4}>About this blog</Heading>
                  {blog.description ? (
                    <Text>{blog.description}</Text>
                  ) : (
                    <Text color="gray.500">No description available for this blog.</Text>
                  )}
                </Box>
              </TabPanel>
              
              <TabPanel p={0}>
                <Box
                  mt={4} 
                  p={6} 
                  borderWidth="1px" 
                  borderColor={borderColor} 
                  borderRadius="lg" 
                  bg={bgColor}
                >
                  <Heading size="md" mb={4}>Recent Songs</Heading>
                  
                  {songsLoading ? (
                    <Center py={8}>
                      <Spinner color="purple.500" />
                    </Center>
                  ) : songs.length > 0 ? (
                    <SongList
                      songs={songs}
                      onToggleFavorite={handleToggleFavorite}
                      showBlogInfo={false}
                    />
                  ) : (
                    <Flex 
                      direction="column" 
                      align="center" 
                      justify="center" 
                      py={8}
                    >
                      <Text fontSize="lg" color="gray.500">
                        No songs found from this blog yet.
                      </Text>
                      {!blog.isActive && (
                        <Text fontSize="sm" color="gray.500" mt={2}>
                          This blog is currently inactive.
                        </Text>
                      )}
                    </Flex>
                  )}
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      )}
    </Container>
  );
};

export default BlogDetailPage; 