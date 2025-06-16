
import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollProps {
  items: any[];
  itemsPerPage?: number;
}

export const useInfiniteScroll = ({ items, itemsPerPage = 100 }: UseInfiniteScrollProps) => {
  const [displayedItems, setDisplayedItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Reset when items change (e.g., after filtering)
  useEffect(() => {
    const initialItems = items.slice(0, itemsPerPage);
    setDisplayedItems(initialItems);
    setCurrentPage(1);
    setHasMore(items.length > itemsPerPage);
    setIsLoading(false);
    console.log('Reset infinite scroll:', { totalItems: items.length, initialItems: initialItems.length });
  }, [items, itemsPerPage]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) {
      console.log('Load more blocked:', { isLoading, hasMore });
      return;
    }

    console.log('Starting to load more items...', { currentPage, totalItems: items.length });
    setIsLoading(true);
    
    // Simulate a small delay to show loading state
    setTimeout(() => {
      const startIndex = currentPage * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newItems = items.slice(startIndex, endIndex);
      
      console.log('Loading more items:', { startIndex, endIndex, newItemsCount: newItems.length });
      
      if (newItems.length > 0) {
        setDisplayedItems(prev => {
          const combined = [...prev, ...newItems];
          console.log('Updated displayed items:', combined.length);
          return combined;
        });
        setCurrentPage(prev => prev + 1);
        setHasMore(endIndex < items.length);
      } else {
        setHasMore(false);
      }
      
      setIsLoading(false);
    }, 300);
  }, [items, currentPage, itemsPerPage, isLoading, hasMore]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = element;
    
    // Calculate how close we are to the bottom
    const scrollPosition = scrollTop + clientHeight;
    const threshold = 200; // Trigger when within 200px of bottom
    const isNearBottom = scrollPosition >= scrollHeight - threshold;
    
    console.log('Scroll event:', { 
      scrollTop: Math.round(scrollTop), 
      scrollHeight, 
      clientHeight, 
      scrollPosition: Math.round(scrollPosition),
      distanceFromBottom: Math.round(scrollHeight - scrollPosition),
      threshold,
      isNearBottom,
      isLoading,
      hasMore,
      displayedItemsCount: displayedItems.length,
      totalItemsCount: items.length
    });
    
    if (isNearBottom && !isLoading && hasMore) {
      console.log('🚀 Triggering infinite scroll load more...');
      loadMore();
    }
  }, [loadMore, isLoading, hasMore, displayedItems.length, items.length]);

  return {
    displayedItems,
    isLoading,
    hasMore,
    handleScroll
  };
};
