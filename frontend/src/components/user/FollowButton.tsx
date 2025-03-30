import React, { useState } from 'react';
import { Button, ButtonProps } from '@chakra-ui/react';
import * as userService from '../../services/user.service';

interface FollowButtonProps extends Omit<ButtonProps, 'onClick'> {
  userId: string | number;
  isFollowing: boolean;
  onFollowChange: (isFollowing: boolean) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  isFollowing,
  onFollowChange,
  colorScheme = 'blue',
  variant = 'solid',
  size = 'md',
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  
  const handleToggleFollow = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const updatedUser = await userService.toggleFollow(userId);
      onFollowChange(updatedUser.isFollowing || false);
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggleFollow}
      isLoading={loading}
      isDisabled={!userId || loading}
      colorScheme={isFollowing ? 'gray' : colorScheme}
      variant={isFollowing ? 'outline' : variant}
      size={size}
      data-testid="follow-button"
      {...props}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
};

export default FollowButton; 