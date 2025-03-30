import React, { useState } from 'react';
import {
  Box,
  Flex,
  Button,
  Textarea,
  FormControl,
  FormErrorMessage,
  useColorModeValue,
  Avatar,
  useToast,
} from '@chakra-ui/react';
import { User } from '../../types/entities';

interface CommentFormProps {
  onSubmit: (comment: string) => Promise<void>;
  currentUser: User | null;
  placeholder?: string;
  isDisabled?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  currentUser,
  placeholder = 'Add a comment...',
  isDisabled = false,
}) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const toast = useToast();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    if (!currentUser) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to post comments',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(comment.trim());
      setComment('');
      toast({
        title: 'Comment posted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to post comment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      borderColor={borderColor}
      p={3}
      bg={bgColor}
      data-testid="comment-form"
    >
      <Flex>
        <Avatar
          size="sm"
          mr={3}
          name={currentUser?.username || 'Guest'}
          src={currentUser?.profileImage}
        />
        <Box width="100%">
          <FormControl isInvalid={!!error}>
            <Textarea
              value={comment}
              onChange={handleChange}
              placeholder={placeholder}
              size="sm"
              resize="vertical"
              rows={2}
              isDisabled={isDisabled || !currentUser}
              data-testid="comment-input"
            />
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
          </FormControl>
          <Flex justifyContent="flex-end" mt={2}>
            <Button
              size="sm"
              colorScheme="purple"
              isLoading={isSubmitting}
              isDisabled={isDisabled || !currentUser || !comment.trim()}
              onClick={handleSubmit}
              data-testid="comment-submit"
            >
              Post
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default CommentForm; 