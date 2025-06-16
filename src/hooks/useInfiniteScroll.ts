
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
  }, [items, itemsPerPage]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    
    // Simulate a small delay to show loading state
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = nextPage * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newItems = items.slice(itemsPerPage * currentPage, endIndex);
      
      if (newItems.length > 0) {
        setDisplayedItems(prev => [...prev, ...newItems]);
        setCurrentPage(nextPage);
        setHasMore(endIndex < items.length);
      } else {
        setHasMore(false);
      }
      
      setIsLoading(false);
    }, 200);
  }, [items, currentPage, itemsPerPage, isLoading, hasMore]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const threshold = 100; // Load more when 100px from bottom
    
    if (scrollHeight - scrollTop <= clientHeight + threshold) {
      loadMore();
    }
  }, [loadMore]);

  return {
    displayedItems,
    isLoading,
    hasMore,
    handleScroll
  };
};
