import { queryClient } from './query-client';

describe('Query Client', () => {
  it('should be properly configured', () => {
    // Check that the queryClient is an object
    expect(queryClient).toBeTruthy();
    
    // Check that the queryClient exposes the expected methods
    expect(typeof queryClient.getQueryData).toBe('function');
    expect(typeof queryClient.setQueryData).toBe('function');
    expect(typeof queryClient.invalidateQueries).toBe('function');
    expect(typeof queryClient.prefetchQuery).toBe('function');
  });

  it('should have the correct default options', () => {
    // Get the defaultOptions from the queryClient
    const defaultOptions = (queryClient as any).defaultOptions;
    
    // Check queries configuration
    expect(defaultOptions.queries).toEqual(
      expect.objectContaining({
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
      })
    );
    
    // Check mutations configuration
    expect(defaultOptions.mutations).toEqual(
      expect.objectContaining({
        retry: 0,
      })
    );
  });

  it('should handle cache operations correctly', () => {
    // Set some test data
    const testKey = ['test'];
    const testData = { id: 1, name: 'Test' };
    
    // Set the data
    queryClient.setQueryData(testKey, testData);
    
    // Check that we can get the data back
    expect(queryClient.getQueryData(testKey)).toEqual(testData);
    
    // Remove the data
    queryClient.removeQueries(testKey);
    
    // Check that the data is gone
    expect(queryClient.getQueryData(testKey)).toBeUndefined();
  });

  // Reset the queryClient after tests
  afterAll(() => {
    queryClient.clear();
  });
}); 