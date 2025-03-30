import React, { useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  useDisclosure,
  useColorModeValue,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { FaMusic, FaList, FaComments } from 'react-icons/fa';
import { usePlayer } from '../../contexts/PlayerContext';
import MiniPlayer from './MiniPlayer';
import PlayerControls from './PlayerControls';
import QueueDisplay from './QueueDisplay';
import CommentList from '../comment/CommentList';
import CommentForm from '../comment/CommentForm';
import { User, Comment } from '../../types/entities';

interface AudioPlayerProps {
  currentUser: User | null;
  onAddComment?: (songId: number | string, text: string) => Promise<void>;
  comments?: Comment[];
  commentsLoading?: boolean;
}

/**
 * Main audio player component that integrates all player functionalities
 */
const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentUser,
  onAddComment,
  comments = [],
  commentsLoading = false,
}) => {
  // State for showing/hiding the mini player
  const [miniPlayerVisible, setMiniPlayerVisible] = useState(true);
  
  // Drawer state
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Player state
  const { currentSong, queue } = usePlayer();
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Handle comment submission
  const handleSubmitComment = async (text: string) => {
    if (onAddComment && currentSong) {
      await onAddComment(currentSong.id, text);
    }
  };
  
  // Toggle mini player visibility
  const toggleMiniPlayer = () => {
    setMiniPlayerVisible(!miniPlayerVisible);
  };
  
  // Only render if there's a current song
  if (!currentSong) return null;

  return (
    <>
      {/* Mini Player (bottom of the screen) */}
      {miniPlayerVisible && (
        <MiniPlayer 
          isOpen={true} 
          onToggle={onOpen}
        />
      )}
      
      {/* Full Player Drawer */}
      <Drawer 
        isOpen={isOpen} 
        placement="bottom" 
        onClose={onClose} 
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent
          maxHeight="80vh"
          borderTopLeftRadius="md"
          borderTopRightRadius="md"
        >
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Now Playing
          </DrawerHeader>
          
          <DrawerBody p={0}>
            <Tabs isFitted variant="enclosed" colorScheme="purple">
              <TabList>
                <Tab><FaMusic /> <Box ml={2}>Player</Box></Tab>
                <Tab><FaList /> <Box ml={2}>Queue</Box></Tab>
                <Tab><FaComments /> <Box ml={2}>Comments</Box></Tab>
              </TabList>
              
              <TabPanels>
                {/* Player Tab */}
                <TabPanel>
                  <VStack spacing={5} p={2}>
                    <Flex
                      justify="center"
                      align="center"
                      width="100%"
                      direction="column"
                    >
                      <Box
                        width="100%"
                        maxWidth="300px"
                        height="300px"
                        borderRadius="md"
                        overflow="hidden"
                        mb={6}
                      >
                        <Box
                          as="img"
                          src={currentSong.imageUrl || 'https://via.placeholder.com/300?text=No+Cover'}
                          alt={currentSong.title}
                          width="100%"
                          height="100%"
                          objectFit="cover"
                          data-testid="player-album-cover"
                        />
                      </Box>
                      
                      <Box width="100%" maxWidth="400px">
                        <PlayerControls 
                          showSeekBar={true} 
                          showVolumeControl={true}
                          size="lg"
                        />
                      </Box>
                    </Flex>
                  </VStack>
                </TabPanel>
                
                {/* Queue Tab */}
                <TabPanel>
                  <QueueDisplay maxHeight="500px" />
                </TabPanel>
                
                {/* Comments Tab */}
                <TabPanel>
                  <VStack spacing={4} p={2} align="stretch">
                    {/* Comment Form */}
                    {onAddComment && (
                      <CommentForm
                        onSubmit={handleSubmitComment}
                        currentUser={currentUser}
                        placeholder="Add a comment about this song..."
                      />
                    )}
                    
                    {/* Comments List */}
                    <CommentList
                      comments={comments}
                      isLoading={commentsLoading}
                    />
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AudioPlayer; 