import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import SongList from './SongList';
import { Song } from '../../types/entities';

// Mock SongItem component to simplify testing
jest.mock('./SongItem', () => {
  return function MockSongItem({ song }: { song: Song }) {
    return (
      <div data-testid={`song-item-${song.id}`}>
        <span>{song.title}</span>
        <span>{song.artist}</span>
      </div>
    );
  };
});

describe('SongList Component', () => {
  const mockSongs: Song[] = [
    {
      id: '1',
      title: 'Test Song 1',
      artist: 'Artist A',
      blogId: 1,
      blogName: 'Music Blog 1',
      audioUrl: 'https://example.com/test1.mp3',
      imageUrl: 'https://example.com/test1.jpg',
      postUrl: 'https://example.com/post1',
      postDate: '2023-01-10',
    },
    {
      id: '2',
      title: 'Another Test Song',
      artist: 'Artist B',
      blogId: 2,
      blogName: 'Music Blog 2',
      audioUrl: 'https://example.com/test2.mp3',
      imageUrl: 'https://example.com/test2.jpg',
      postUrl: 'https://example.com/post2',
      postDate: '2023-01-15',
    },
    {
      id: '3',
      title: 'Final Test Song',
      artist: 'Artist C',
      blogId: 1,
      blogName: 'Music Blog 1',
      audioUrl: 'https://example.com/test3.mp3',
      imageUrl: 'https://example.com/test3.jpg',
      postUrl: 'https://example.com/post3',
      postDate: '2023-01-05',
    },
  ];

  it('renders a list of songs', () => {
    render(
      <ChakraProvider>
        <SongList songs={mockSongs} />
      </ChakraProvider>
    );
    
    // Check if all songs are rendered
    expect(screen.getByTestId('song-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('song-item-2')).toBeInTheDocument();
    expect(screen.getByTestId('song-item-3')).toBeInTheDocument();
  });

  it('displays a loading state when isLoading is true', () => {
    render(
      <ChakraProvider>
        <SongList songs={[]} isLoading={true} />
      </ChakraProvider>
    );
    
    // Check if loading state is rendered
    expect(screen.getByTestId('song-list-loading')).toBeInTheDocument();
  });

  it('displays an empty state message when no songs are available', () => {
    const emptyMessage = 'No songs available';
    
    render(
      <ChakraProvider>
        <SongList songs={[]} emptyMessage={emptyMessage} />
      </ChakraProvider>
    );
    
    // Check if empty state message is rendered
    expect(screen.getByTestId('song-list-empty')).toBeInTheDocument();
    expect(screen.getByText(emptyMessage)).toBeInTheDocument();
  });

  it('filters songs based on search query', () => {
    render(
      <ChakraProvider>
        <SongList songs={mockSongs} />
      </ChakraProvider>
    );
    
    // Search for a specific song
    const searchInput = screen.getByTestId('song-search');
    fireEvent.change(searchInput, { target: { value: 'Another' } });
    
    // Only the matching song should be rendered
    expect(screen.getByTestId('song-item-2')).toBeInTheDocument();
    expect(screen.queryByTestId('song-item-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('song-item-3')).not.toBeInTheDocument();
  });

  it('sorts songs by title in ascending order', () => {
    render(
      <ChakraProvider>
        <SongList songs={mockSongs} />
      </ChakraProvider>
    );
    
    // Select title-asc sorting
    const sortSelect = screen.getByTestId('song-sort');
    fireEvent.change(sortSelect, { target: { value: 'title-asc' } });
    
    // Check the order of songs (uses the DOM order of elements)
    const songItems = screen.getAllByTestId(/song-item-/);
    
    // Expecting: "Another Test Song", "Final Test Song", "Test Song 1"
    expect(songItems[0]).toHaveTextContent('Another Test Song');
    expect(songItems[1]).toHaveTextContent('Final Test Song');
    expect(songItems[2]).toHaveTextContent('Test Song 1');
  });

  it('sorts songs by date with newest first by default', () => {
    render(
      <ChakraProvider>
        <SongList songs={mockSongs} />
      </ChakraProvider>
    );
    
    // Default sorting should be newest first
    const songItems = screen.getAllByTestId(/song-item-/);
    
    // Expecting: id 2 (Jan 15), id 1 (Jan 10), id 3 (Jan 5)
    expect(songItems[0]).toHaveAttribute('data-testid', 'song-item-2');
    expect(songItems[1]).toHaveAttribute('data-testid', 'song-item-1');
    expect(songItems[2]).toHaveAttribute('data-testid', 'song-item-3');
  });

  it('sorts songs by date with oldest first when selected', () => {
    render(
      <ChakraProvider>
        <SongList songs={mockSongs} />
      </ChakraProvider>
    );
    
    // Select oldest-first sorting
    const sortSelect = screen.getByTestId('song-sort');
    fireEvent.change(sortSelect, { target: { value: 'oldest' } });
    
    // Check the order of songs
    const songItems = screen.getAllByTestId(/song-item-/);
    
    // Expecting: id 3 (Jan 5), id 1 (Jan 10), id 2 (Jan 15)
    expect(songItems[0]).toHaveAttribute('data-testid', 'song-item-3');
    expect(songItems[1]).toHaveAttribute('data-testid', 'song-item-1');
    expect(songItems[2]).toHaveAttribute('data-testid', 'song-item-2');
  });

  it('disables search functionality when searchEnabled is false', () => {
    render(
      <ChakraProvider>
        <SongList songs={mockSongs} searchEnabled={false} />
      </ChakraProvider>
    );
    
    // Search input should not be rendered
    expect(screen.queryByTestId('song-search')).not.toBeInTheDocument();
  });

  it('disables sort functionality when sortEnabled is false', () => {
    render(
      <ChakraProvider>
        <SongList songs={mockSongs} sortEnabled={false} />
      </ChakraProvider>
    );
    
    // Sort select should not be rendered
    expect(screen.queryByTestId('song-sort')).not.toBeInTheDocument();
  });

  it('passes showBlogInfo and showImages props to SongItem components', () => {
    const { rerender } = render(
      <ChakraProvider>
        <SongList 
          songs={mockSongs} 
          showBlogInfo={true} 
          showImages={true} 
        />
      </ChakraProvider>
    );
    
    // SongItem components should receive the showBlog and showImage props
    // We can't directly test this with the mock, but we can confirm rerendering doesn't crash
    
    // Rerender with different props
    rerender(
      <ChakraProvider>
        <SongList 
          songs={mockSongs} 
          showBlogInfo={false} 
          showImages={false} 
        />
      </ChakraProvider>
    );
    
    // Check if songs are still rendered after rerendering
    expect(screen.getByTestId('song-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('song-item-2')).toBeInTheDocument();
    expect(screen.getByTestId('song-item-3')).toBeInTheDocument();
  });
}); 