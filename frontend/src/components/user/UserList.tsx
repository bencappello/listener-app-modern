import React from 'react';
import {
  Box,
  List,
  ListItem,
  Text,
  Avatar,
  Flex,
  useColorModeValue,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { User } from '../../types/entities';
import FollowButton from './FollowButton';

interface UserListProps {
  users: User[];
  onFollowChange: (userId: number) => void;
  onUserClick: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onFollowChange, onUserClick }) => {
  const bgHover = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (!users || users.length === 0) {
    return (
      <Box textAlign="center" py={6}>
        <Text>No users found</Text>
      </Box>
    );
  }

  return (
    <List spacing={2} width="100%">
      {users.map((user) => (
        <ListItem 
          key={user.id}
          borderWidth="1px"
          borderRadius="md"
          borderColor={borderColor}
          _hover={{ bg: bgHover, cursor: 'pointer' }}
          transition="all 0.2s"
        >
          <Flex 
            p={4} 
            justifyContent="space-between" 
            alignItems="center"
            onClick={() => onUserClick(user)}
          >
            <HStack spacing={4}>
              <Avatar 
                size="md" 
                name={user.username} 
                src={user.avatarUrl || undefined}
              />
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold" fontSize="md">
                  {user.username}
                </Text>
                {user.bio && (
                  <Text fontSize="sm" color="gray.500" noOfLines={2}>
                    {user.bio}
                  </Text>
                )}
                {user.followersCount !== undefined && (
                  <Text fontSize="xs" color="gray.500">
                    {user.followersCount} {user.followersCount === 1 ? 'follower' : 'followers'}
                  </Text>
                )}
              </VStack>
            </HStack>
            
            <Box onClick={(e) => e.stopPropagation()}>
              <FollowButton
                userId={typeof user.id === 'string' ? parseInt(user.id, 10) : user.id}
                isFollowing={user.isFollowing || false}
                onFollowChange={() => onFollowChange(typeof user.id === 'string' ? parseInt(user.id, 10) : user.id)}
              />
            </Box>
          </Flex>
        </ListItem>
      ))}
    </List>
  );
};

export default UserList; 