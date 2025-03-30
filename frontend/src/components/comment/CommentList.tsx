import React from 'react';
import {
  VStack,
  Box,
  Text,
  Avatar,
  Flex,
  Divider,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { Comment } from '../../types/entities';
import { formatRelativeTime } from '../../utils/formatters';

interface CommentListProps {
  comments: Comment[];
  isLoading?: boolean;
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  isLoading = false,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');

  if (isLoading) {
    return (
      <Box data-testid="comment-list-loading" p={4}>
        <Text color={secondaryTextColor}>Loading comments...</Text>
      </Box>
    );
  }

  if (comments.length === 0) {
    return (
      <Box 
        textAlign="center" 
        p={4} 
        data-testid="comment-list-empty"
        color={secondaryTextColor}
      >
        <Text>No comments yet. Be the first to comment!</Text>
      </Box>
    );
  }

  return (
    <VStack
      spacing={4}
      align="stretch"
      data-testid="comment-list"
    >
      {comments.map((comment, index) => (
        <Box key={comment.id}>
          <Flex>
            <Avatar
              size="sm"
              name={comment.user?.username || 'User'}
              src={comment.user?.profileImage}
              mr={3}
            />
            <Box width="100%">
              <Flex 
                justifyContent="space-between" 
                alignItems="flex-start"
                mb={1}
              >
                <Flex alignItems="center">
                  <Text fontWeight="bold" fontSize="sm">
                    {comment.user?.username || 'Anonymous'}
                  </Text>
                  {comment.user?.isCurrentUser && (
                    <Badge ml={2} colorScheme="purple" size="sm">
                      You
                    </Badge>
                  )}
                </Flex>
                <Text fontSize="xs" color={secondaryTextColor}>
                  {formatRelativeTime(new Date(comment.createdAt))}
                </Text>
              </Flex>
              <Text fontSize="sm" color={textColor}>
                {comment.text}
              </Text>
            </Box>
          </Flex>
          {index < comments.length - 1 && <Divider mt={4} />}
        </Box>
      ))}
    </VStack>
  );
};

export default CommentList; 