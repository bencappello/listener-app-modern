import React from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Image,
  Text,
  Heading,
  Button,
  Badge,
  Link,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Stack,
  SkeletonText,
  Skeleton,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  ArrowBackIcon, 
  ExternalLinkIcon, 
  StarIcon, 
  TimeIcon
} from '@chakra-ui/icons';
import { Blog } from '../../types/entities';
import { formatDate } from '../../utils/formatters';

interface BlogStats {
  songCount?: number;
  followerCount?: number;
}

interface BlogDetailProps {
  blog: Blog | null;
  onToggleFollow: (blogId: number) => void;
  onBack: () => void;
  isFollowing: boolean;
  isLoading?: boolean;
  stats?: BlogStats;
}

const BlogDetail: React.FC<BlogDetailProps> = ({
  blog,
  onToggleFollow,
  onBack,
  isFollowing,
  isLoading = false,
  stats
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  
  // Loading state
  if (isLoading) {
    return (
      <Container maxW="4xl" py={8} data-testid="blog-detail-loading">
        <HStack spacing={4} mb={6}>
          <IconButton
            aria-label="Back"
            icon={<ArrowBackIcon />}
            onClick={onBack}
            size="md"
            variant="ghost"
          />
          <Skeleton height="40px" width="300px" />
        </HStack>
        
        <Box 
          p={6} 
          borderWidth="1px" 
          borderColor={borderColor}
          borderRadius="lg" 
          bg={cardBg}
        >
          <Skeleton height="250px" mb={6} />
          <SkeletonText mt="4" noOfLines={4} spacing="4" />
          <HStack mt={6} spacing={4}>
            <Skeleton height="40px" width="120px" />
            <Skeleton height="40px" width="150px" />
          </HStack>
        </Box>
      </Container>
    );
  }

  // Blog not found state
  if (!blog) {
    return (
      <Container maxW="4xl" py={8} textAlign="center">
        <IconButton
          aria-label="Back"
          icon={<ArrowBackIcon />}
          onClick={onBack}
          size="md"
          variant="ghost"
          alignSelf="flex-start"
          mb={6}
        />
        <VStack spacing={4}>
          <Heading size="xl">Blog not found</Heading>
          <Text color={secondaryTextColor}>
            The blog you're looking for doesn't exist or has been removed.
          </Text>
          <Button onClick={onBack} leftIcon={<ArrowBackIcon />}>
            Go back
          </Button>
        </VStack>
      </Container>
    );
  }

  const formattedLastScraped = blog.lastScraped 
    ? formatDate(new Date(blog.lastScraped)) 
    : 'Never';

  return (
    <Container maxW="4xl" py={8}>
      <HStack spacing={4} mb={6}>
        <IconButton
          aria-label="Back"
          icon={<ArrowBackIcon />}
          onClick={onBack}
          size="md"
          variant="ghost"
        />
        <Heading size="lg">{blog.name}</Heading>
        {!blog.isActive && (
          <Badge colorScheme="red">Inactive</Badge>
        )}
      </HStack>
      
      <Box 
        p={6} 
        borderWidth="1px" 
        borderColor={borderColor}
        borderRadius="lg" 
        bg={cardBg}
      >
        {blog.imageUrl && (
          <Image
            src={blog.imageUrl}
            alt={blog.name}
            borderRadius="md"
            maxHeight="300px"
            objectFit="cover"
            width="100%"
            mb={6}
          />
        )}
        
        {stats && (
          <StatGroup mb={6} textAlign="center">
            {stats.songCount !== undefined && (
              <Stat>
                <StatNumber>{stats.songCount}</StatNumber>
                <StatLabel>Songs</StatLabel>
              </Stat>
            )}
            {stats.followerCount !== undefined && (
              <Stat>
                <StatNumber>{stats.followerCount}</StatNumber>
                <StatLabel>Followers</StatLabel>
              </Stat>
            )}
          </StatGroup>
        )}
        
        {blog.description && (
          <Box mb={6}>
            <Heading size="md" mb={2}>Description</Heading>
            <Text color={textColor}>{blog.description}</Text>
          </Box>
        )}
        
        <Box mb={6}>
          <Heading size="md" mb={2}>Website</Heading>
          <Link 
            href={blog.url} 
            color="blue.500" 
            isExternal
            display="inline-flex"
            alignItems="center"
          >
            {blog.url} <ExternalLinkIcon mx="2px" />
          </Link>
        </Box>
        
        <HStack mb={6}>
          <TimeIcon color={secondaryTextColor} />
          <Text color={secondaryTextColor}>
            Last updated: {formattedLastScraped}
          </Text>
        </HStack>
        
        <Divider mb={6} />
        
        <Stack 
          direction={{ base: 'column', md: 'row' }} 
          spacing={4}
          justify="space-between"
        >
          <Button
            leftIcon={<StarIcon />}
            colorScheme={isFollowing ? 'purple' : 'gray'}
            onClick={() => onToggleFollow(blog.id)}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
          
          <Link href={blog.url} isExternal _hover={{ textDecoration: 'none' }}>
            <Button rightIcon={<ExternalLinkIcon />} variant="outline">
              Visit Website
            </Button>
          </Link>
        </Stack>
      </Box>
    </Container>
  );
};

export default BlogDetail; 