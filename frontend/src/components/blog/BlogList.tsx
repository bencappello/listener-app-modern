import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  CardFooter,
  Image,
  Heading,
  Button,
  Badge,
  Skeleton,
  SkeletonText,
  Flex,
  IconButton,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import { StarIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Blog } from '../../types/entities';

interface BlogListProps {
  blogs: Blog[];
  onToggleFollow: (blogId: number) => void;
  onBlogClick: (blog: Blog) => void;
  isLoading: boolean;
  layout?: 'list' | 'grid';
  title?: string;
}

const BlogList: React.FC<BlogListProps> = ({
  blogs,
  onToggleFollow,
  onBlogClick,
  isLoading,
  layout = 'list',
  title = 'Blogs'
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const descriptionColor = useColorModeValue('gray.600', 'gray.400');

  if (isLoading) {
    return (
      <Box data-testid="blog-list-loading" width="100%">
        <Heading size="lg" mb={6}>{title}</Heading>
        {layout === 'grid' ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
            {[...Array(6)].map((_, i) => (
              <Card key={i} borderWidth="1px" borderColor={cardBorder} bg={cardBg}>
                <Skeleton height="150px" />
                <CardBody>
                  <SkeletonText mt="4" noOfLines={2} spacing="4" />
                </CardBody>
                <CardFooter>
                  <Skeleton height="30px" width="80px" />
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <VStack spacing={4} width="100%" align="stretch">
            {[...Array(6)].map((_, i) => (
              <Card key={i} direction="row" borderWidth="1px" borderColor={cardBorder} bg={cardBg}>
                <Skeleton height="120px" width="120px" />
                <CardBody>
                  <SkeletonText mt="4" noOfLines={3} spacing="4" />
                </CardBody>
                <CardFooter>
                  <Skeleton height="30px" width="80px" />
                </CardFooter>
              </Card>
            ))}
          </VStack>
        )}
      </Box>
    );
  }

  if (blogs.length === 0) {
    return (
      <Box width="100%" textAlign="center" py={10}>
        <Heading size="lg" mb={6}>{title}</Heading>
        <Text fontSize="xl" color={textColor}>No blogs found</Text>
      </Box>
    );
  }

  return (
    <Box width="100%">
      <Heading size="lg" mb={6}>{title}</Heading>
      
      {layout === 'grid' ? (
        <SimpleGrid 
          data-testid="blog-grid-layout"
          columns={{ base: 1, md: 2, lg: 3 }} 
          spacing={5}
        >
          {blogs.map((blog) => (
            <Card 
              key={blog.id}
              data-testid="blog-card"
              borderWidth="1px" 
              borderColor={cardBorder}
              bg={cardBg}
              overflow="hidden"
              onClick={() => onBlogClick(blog)}
              cursor="pointer"
              transition="transform 0.2s"
              _hover={{ transform: 'translateY(-5px)' }}
            >
              {blog.imageUrl ? (
                <Image
                  src={blog.imageUrl}
                  alt={blog.name}
                  height="150px"
                  objectFit="cover"
                  fallback={<Skeleton height="150px" />}
                />
              ) : (
                <Box height="150px" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
                  <Text color="gray.500">No image</Text>
                </Box>
              )}
              
              <CardBody>
                <Flex justify="space-between" align="start">
                  <Heading size="md" mb={2} noOfLines={1}>{blog.name}</Heading>
                  {!blog.isActive && (
                    <Badge colorScheme="red" ml={2}>
                      Inactive
                    </Badge>
                  )}
                </Flex>
                
                {blog.description && (
                  <Text 
                    color={descriptionColor} 
                    fontSize="sm" 
                    noOfLines={2}
                  >
                    {blog.description}
                  </Text>
                )}
              </CardBody>
              
              <CardFooter pt={0}>
                <Button
                  size="sm"
                  leftIcon={<StarIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFollow(blog.id);
                  }}
                >
                  Follow
                </Button>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <VStack 
          data-testid="blog-list-layout"
          spacing={4} 
          align="stretch"
        >
          {blogs.map((blog) => (
            <Card
              key={blog.id}
              data-testid="blog-card"
              direction={{ base: 'column', sm: 'row' }}
              borderWidth="1px"
              borderColor={cardBorder}
              bg={cardBg}
              overflow="hidden"
              onClick={() => onBlogClick(blog)}
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ shadow: 'md' }}
            >
              {blog.imageUrl ? (
                <Image
                  objectFit="cover"
                  maxW={{ base: '100%', sm: '120px' }}
                  maxH={{ base: '150px', sm: '120px' }}
                  src={blog.imageUrl}
                  alt={blog.name}
                  fallback={<Skeleton height="120px" width="120px" />}
                />
              ) : (
                <Box height="120px" width="120px" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
                  <Text color="gray.500">No image</Text>
                </Box>
              )}
              
              <CardBody>
                <Flex justify="space-between" align="center">
                  <Heading size="md">{blog.name}</Heading>
                  {!blog.isActive && (
                    <Badge colorScheme="red" ml={2}>
                      Inactive
                    </Badge>
                  )}
                </Flex>
                
                {blog.description && (
                  <Text py="2" color={descriptionColor} noOfLines={2}>
                    {blog.description}
                  </Text>
                )}
                
                <Text fontSize="sm" color={descriptionColor}>
                  {blog.url}
                </Text>
              </CardBody>
              
              <CardFooter gap={2} alignItems="center">
                <Button
                  size="sm"
                  leftIcon={<StarIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFollow(blog.id);
                  }}
                >
                  Follow
                </Button>
                
                <Tooltip label="View details">
                  <IconButton
                    icon={<ChevronRightIcon />}
                    aria-label="View blog details"
                    size="sm"
                    variant="ghost"
                  />
                </Tooltip>
              </CardFooter>
            </Card>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default BlogList; 