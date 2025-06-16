
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
  }, [items, itemsPerPage]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) {
      console.log('Load more blocked:', { isLoading, hasMore });
      return;
    }

    console.log('Loading more items...', { currentPage, totalItems: items.length });
    setIsLoading(true);
    
    // Simulate a small delay to show loading state
    setTimeout(() => {
      const startIndex = currentPage * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newItems = items.slice(startIndex, endIndex);
      
      console.log('New items loaded:', { startIndex, endIndex, newItemsCount: newItems.length });
      
      if (newItems.length > 0) {
        setDisplayedItems(prev => [...prev, ...newItems]);
        setCurrentPage(prev => prev + 1);
        setHasMore(endIndex < items.length);
      } else {
        setHasMore(false);
      }
      
      setIsLoading(false);
    }, 200);
  }, [items, currentPage, itemsPerPage, isLoading, hasMore]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // More generous threshold - trigger when within 300px OR when very close to bottom
    const threshold = 300;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isNearBottom = distanceFromBottom <= threshold;
    const isAtBottom = Math.abs(distanceFromBottom) < 5; // Account for floating point precision
    
    console.log('Scroll event:', { 
      scrollTop, 
      scrollHeight, 
      clientHeight, 
      distanceFromBottom, 
      threshold,
      isNearBottom,
      isAtBottom,
      isLoading,
      hasMore
    });
    
    if ((isNearBottom || isAtBottom) && !isLoading && hasMore) {
      console.log('Triggering load more...');
      loadMore();
    }
  }, [loadMore, isLoading, hasMore]);

  return {
    displayedItems,
    isLoading,
    hasMore,
    handleScroll
  };
};
