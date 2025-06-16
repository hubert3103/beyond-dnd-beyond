
import { useState, useMemo } from 'react';
import { useOpen5eData } from '../../hooks/useOpen5eData';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { open5eApi, Open5eEquipment } from '../../services/open5eApi';
import LoadingSpinner from '../character-creation/LoadingSpinner';
import ErrorMessage from '../character-creation/ErrorMessage';
import ItemsHeader from './items/ItemsHeader';
import ItemsList from './items/ItemsList';
import ItemDetailModal from './items/ItemDetailModal';
import CharacterSelectModal from './items/CharacterSelectModal';

const ItemsTab = () => {
  const { equipment, isLoading, error, refresh } = useOpen5eData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Open5eEquipment | null>(null);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [itemToAdd, setItemToAdd] = useState<Open5eEquipment | null>(null);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'type'>('rarity');

  // Memoize available sources for better performance
  const availableSources = useMemo(() => {
    const sources = open5eApi.getAvailableSources(equipment);
    console.log('Available sources:', sources);
    return sources;
  }, [equipment]);

  // Optimized rarity ordering function
  const getRarityOrder = (rarity: string) => {
    const rarityMap: Record<string, number> = {
      'common': 1,
      'uncommon': 2,
      'rare': 3,
      'very rare': 4,
      'legendary': 5,
      'artifact': 6
    };
    return rarityMap[rarity.toLowerCase()] || 0;
  };

  // Optimized filtering and sorting - only recalculates when dependencies change
  const filteredEquipment = useMemo(() => {
    console.log('Filtering and sorting equipment...');
    console.log('All equipment:', equipment.length);
    console.log('Selected sources:', selectedSources);
    
    if (!equipment.length) return [];
    
    let filtered = equipment;
    
    // Apply source filter - ONLY if sources are explicitly selected
    if (selectedSources.length > 0) {
      filtered = filtered.filter(item => selectedSources.includes(item.document__slug));
      console.log('Filtered by source:', filtered.length);
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.type.toLowerCase().includes(searchLower) ||
        item.rarity.toLowerCase().includes(searchLower)
      );
      console.log('Filtered by search:', filtered.length);
    }
    
    // Sort the results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity':
          const rarityA = getRarityOrder(a.rarity);
          const rarityB = getRarityOrder(b.rarity);
          if (rarityA !== rarityB) {
            return rarityA - rarityB;
          }
          // If same rarity, sort alphabetically by name
          return a.name.localeCompare(b.name);
        case 'type':
          if (a.type !== b.type) {
            return a.type.localeCompare(b.type);
          }
          // If same type, sort alphabetically by name
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    console.log('Final filtered equipment:', filtered.length);
    return filtered;
  }, [equipment, selectedSources, searchTerm, sortBy]);

  // Use infinite scroll hook
  const { displayedItems: displayedEquipment, isLoading: isLoadingMore, hasMore, handleScroll } = useInfiniteScroll({
    items: filteredEquipment,
    itemsPerPage: 100
  });

  const handleSourceFilterChange = (source: string, checked: boolean) => {
    setSelectedSources(prev => 
      checked 
        ? [...prev, source]
        : prev.filter(s => s !== source)
    );
  };

  const handleAddToCharacter = (item: Open5eEquipment) => {
    setItemToAdd(item);
    setShowCharacterSelect(true);
  };

  const handleCloseCharacterSelect = () => {
    setShowCharacterSelect(false);
    setItemToAdd(null);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading equipment data..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refresh} />;
  }

  return (
    <div className="flex flex-col h-full">
      <ItemsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        selectedSources={selectedSources}
        onSourceFilterChange={handleSourceFilterChange}
        availableSources={availableSources}
        displayedCount={displayedEquipment.length}
        filteredCount={filteredEquipment.length}
        totalCount={equipment.length}
      />

      <ItemsList
        displayedEquipment={displayedEquipment}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        handleScroll={handleScroll}
        onItemSelect={setSelectedItem}
        onAddToCharacter={handleAddToCharacter}
        filteredCount={filteredEquipment.length}
        totalCount={equipment.length}
      />

      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      <CharacterSelectModal
        isOpen={showCharacterSelect}
        onClose={handleCloseCharacterSelect}
        selectedItem={itemToAdd}
      />
    </div>
  );
};

export default ItemsTab;
