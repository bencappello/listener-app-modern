import React from 'react';
import {
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  TagLeftIcon,
  Flex,
  Text,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { Tag as TagType } from '../../types/entities';

interface TagListProps {
  tags: string[] | TagType[];
  selectedTags?: string[];
  onTagClick?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: string;
  variant?: 'solid' | 'subtle' | 'outline';
  isLoading?: boolean;
  icon?: React.ElementType;
  maxDisplay?: number;
  showCount?: boolean;
}

/**
 * A reusable component for displaying a list of tags or categories
 * with optional selection, filtering and counts
 */
const TagList: React.FC<TagListProps> = ({
  tags,
  selectedTags = [],
  onTagClick,
  onTagRemove,
  size = 'md',
  colorScheme = 'purple',
  variant = 'subtle',
  isLoading = false,
  icon,
  maxDisplay,
  showCount = false,
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  
  // Format tags to a standard format regardless of input type
  const formattedTags = tags.map(tag => {
    if (typeof tag === 'string') {
      return { id: tag, name: tag };
    }
    return tag;
  });
  
  // Calculate tag counts if showing counts
  const tagCounts: Record<string, number> = {};
  if (showCount) {
    formattedTags.forEach(tag => {
      const tagName = tag.name;
      tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
    });
  }
  
  // Get unique tags
  const uniqueTags = Array.from(
    new Set(formattedTags.map(tag => tag.name))
  ).sort();
  
  // Limit display if maxDisplay is specified
  const displayTags = maxDisplay && maxDisplay < uniqueTags.length
    ? uniqueTags.slice(0, maxDisplay)
    : uniqueTags;
  
  const remainingCount = uniqueTags.length - displayTags.length;

  if (isLoading) {
    return (
      <Flex align="center" data-testid="tag-list-loading">
        <Text fontSize="sm" color="gray.500">Loading tags...</Text>
      </Flex>
    );
  }

  if (uniqueTags.length === 0) {
    return (
      <Flex align="center" data-testid="tag-list-empty">
        <Text fontSize="sm" color="gray.500">No tags</Text>
      </Flex>
    );
  }

  return (
    <Wrap spacing={2} data-testid="tag-list">
      {displayTags.map(tagName => {
        const isSelected = selectedTags.includes(tagName);
        
        return (
          <WrapItem key={tagName}>
            <Tag 
              size={size}
              colorScheme={isSelected ? colorScheme : 'gray'}
              variant={isSelected ? 'solid' : variant}
              cursor={onTagClick ? 'pointer' : 'default'}
              onClick={onTagClick ? () => onTagClick(tagName) : undefined}
              data-testid={`tag-item-${tagName}`}
            >
              {icon && <TagLeftIcon as={icon} boxSize="12px" />}
              <TagLabel>{tagName}</TagLabel>
              
              {showCount && tagCounts[tagName] > 1 && (
                <Badge 
                  ml={1} 
                  fontSize="0.6em" 
                  colorScheme={isSelected ? 'gray' : colorScheme}
                  variant="solid"
                  borderRadius="full"
                >
                  {tagCounts[tagName]}
                </Badge>
              )}
              
              {isSelected && onTagRemove && (
                <TagCloseButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagRemove(tagName);
                  }}
                  data-testid={`remove-tag-${tagName}`}
                />
              )}
            </Tag>
          </WrapItem>
        );
      })}
      
      {remainingCount > 0 && (
        <WrapItem>
          <Tag size={size} colorScheme="gray" variant="outline">
            <TagLabel>+{remainingCount} more</TagLabel>
          </Tag>
        </WrapItem>
      )}
    </Wrap>
  );
};

export default TagList; 