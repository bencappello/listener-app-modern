import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { StarIcon } from '@chakra-ui/icons';
import TagList from './TagList';
import { Tag } from '../../types/entities';

describe('TagList Component', () => {
  const mockStringTags = ['rock', 'indie', 'electronic', 'pop', 'jazz', 'hip-hop'];
  
  const mockObjectTags: Tag[] = [
    { id: 1, name: 'rock' },
    { id: 2, name: 'indie' },
    { id: 3, name: 'electronic' },
    { id: 4, name: 'pop' },
    { id: 5, name: 'jazz' },
    { id: 6, name: 'hip-hop' }
  ];
  
  it('renders a list of tags from string array', () => {
    render(<TagList tags={mockStringTags} />);
    
    // Check that all tags are rendered
    mockStringTags.forEach(tag => {
      expect(screen.getByTestId(`tag-item-${tag}`)).toBeInTheDocument();
    });
  });
  
  it('renders a list of tags from Tag objects', () => {
    render(<TagList tags={mockObjectTags} />);
    
    // Check that all tags are rendered
    mockObjectTags.forEach(tag => {
      expect(screen.getByTestId(`tag-item-${tag.name}`)).toBeInTheDocument();
    });
  });
  
  it('displays a loading state when isLoading is true', () => {
    render(<TagList tags={mockStringTags} isLoading={true} />);
    
    // Check for loading indicator
    expect(screen.getByTestId('tag-list-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading tags...')).toBeInTheDocument();
  });
  
  it('displays empty state when no tags are provided', () => {
    render(<TagList tags={[]} />);
    
    // Check for empty state message
    expect(screen.getByTestId('tag-list-empty')).toBeInTheDocument();
    expect(screen.getByText('No tags')).toBeInTheDocument();
  });
  
  it('calls onTagClick when a tag is clicked', () => {
    const mockOnTagClick = jest.fn();
    render(<TagList tags={mockStringTags} onTagClick={mockOnTagClick} />);
    
    // Click on a tag
    fireEvent.click(screen.getByTestId('tag-item-rock'));
    
    // Check if onTagClick was called with the correct tag
    expect(mockOnTagClick).toHaveBeenCalledWith('rock');
  });
  
  it('highlights selected tags', () => {
    const selectedTags = ['rock', 'jazz'];
    render(<TagList tags={mockStringTags} selectedTags={selectedTags} />);
    
    // Selected tags should have different styling
    // We can't easily check styling directly, but we can check for class differences
    const rockTag = screen.getByTestId('tag-item-rock');
    const popTag = screen.getByTestId('tag-item-pop');
    
    // Selected tags should have colorScheme "purple" and variant "solid"
    expect(rockTag).toHaveAttribute('data-colorscheme', 'purple');
    expect(rockTag).toHaveAttribute('data-variant', 'solid');
    
    // Non-selected tags should have colorScheme "gray" and variant "subtle"
    expect(popTag).toHaveAttribute('data-colorscheme', 'gray');
    expect(popTag).toHaveAttribute('data-variant', 'subtle');
  });
  
  it('calls onTagRemove when remove button is clicked', () => {
    const selectedTags = ['rock'];
    const mockOnTagRemove = jest.fn();
    
    render(
      <TagList 
        tags={mockStringTags} 
        selectedTags={selectedTags} 
        onTagRemove={mockOnTagRemove} 
      />
    );
    
    // Click on the remove button for the selected tag
    fireEvent.click(screen.getByTestId('remove-tag-rock'));
    
    // Check if onTagRemove was called with the correct tag
    expect(mockOnTagRemove).toHaveBeenCalledWith('rock');
  });
  
  it('limits display when maxDisplay is specified', () => {
    render(<TagList tags={mockStringTags} maxDisplay={3} />);
    
    // Only first 3 tags should be displayed
    expect(screen.getByTestId('tag-item-electronic')).toBeInTheDocument();
    expect(screen.getByTestId('tag-item-indie')).toBeInTheDocument();
    expect(screen.getByTestId('tag-item-jazz')).toBeInTheDocument();
    
    // There should be a "+3 more" indicator
    expect(screen.getByText('+3 more')).toBeInTheDocument();
  });
  
  it('displays counts when showCount is true', () => {
    // Create array with duplicate tags to test counts
    const tagsWithDuplicates = [...mockStringTags, 'rock', 'rock', 'indie'];
    
    render(<TagList tags={tagsWithDuplicates} showCount={true} />);
    
    // Check that count badges are displayed for tags with multiple occurrences
    const rockTag = screen.getByTestId('tag-item-rock');
    const indieTag = screen.getByTestId('tag-item-indie');
    
    // Rock appears 3 times
    expect(rockTag).toHaveTextContent('rock3');
    
    // Indie appears 2 times
    expect(indieTag).toHaveTextContent('indie2');
  });
  
  it('renders with an icon when provided', () => {
    render(<TagList tags={mockStringTags} icon={StarIcon} />);
    
    // Use Testing Library methods instead of direct DOM querying
    const tagList = screen.getByTestId('tag-list');
    
    // Check each tag for the presence of an SVG icon
    mockStringTags.forEach(tag => {
      const tagElement = screen.getByTestId(`tag-item-${tag}`);
      const icons = within(tagElement).getAllByRole('presentation');
      expect(icons.length).toBeGreaterThan(0);
    });
  });
}); 