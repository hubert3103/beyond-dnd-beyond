
import { useState, useMemo } from 'react';
import { useHybridData } from '../../hooks/useHybridData';
import { Open5eEquipment } from '../../services/open5eApi';
import ItemsHeader from './items/ItemsHeader';
import ItemsList from './items/ItemsList';
import ItemDetailModal from './items/ItemDetailModal';
import CharacterSelectModal from './items/CharacterSelectModal';
import { useCharacters } from '../../hooks/useCharacters';
import { useToast } from '@/hooks/use-toast';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

const ItemsTab = () => {
  const { equipment, isLoading, error } = useHybridData();
  const { characters, updateCharacter } = useCharacters();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Open5eEquipment | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'type'>('name');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [itemToAdd, setItemToAdd] = useState<Open5eEquipment | null>(null);

  // Memoize available sources for better performance
  const availableSources = useMemo(() => {
    const sources = new Set<string>();
    equipment.forEach(item => {
      if (item.document__slug) {
        sources.add(item.document__slug);
      }
    });
    return Array.from(sources).sort();
  }, [equipment]);

  // Handle source filter changes
  const handleSourceFilterChange = (source: string, checked: boolean) => {
    setSelectedSources(prev => {
      if (checked) {
        return [...prev, source];
      } else {
        return prev.filter(s => s !== source);
      }
    });
  };

  // Optimized filtering and sorting - only recalculates when dependencies change
  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (selectedSources.length > 0 && !selectedSources.includes(item.document__slug)) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity':
          return a.rarity.localeCompare(b.rarity);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
  }, [equipment, searchTerm, selectedSources, sortBy]);

  // Use infinite scroll hook
  const { displayedItems, isLoading: isLoadingMore, hasMore, handleScroll } = useInfiniteScroll({
    items: filteredEquipment,
    itemsPerPage: 50
  });

  const displayedEquipment = displayedItems as Open5eEquipment[];

  const handleAddToCharacter = (item: Open5eEquipment) => {
    if (characters.length === 0) {
      toast({
        title: "No Characters",
        description: "Create a character first to add equipment",
        variant: "destructive",
      });
      return;
    }

    if (characters.length === 1) {
      addItemToCharacter(characters[0].id, item);
    } else {
      setItemToAdd(item);
      setShowCharacterSelect(true);
    }
  };

  const addItemToCharacter = async (characterId: string, item: Open5eEquipment) => {
    try {
      const character = characters.find(c => c.id === characterId);
      if (!character) return;

      const equipment = character.equipment || { starting_equipment: [], inventory: [] };
      const newItem = {
        name: item.name,
        type: item.type,
        weight: parseFloat(item.weight) || 0,
        quantity: 1,
        equipped: false,
        rarity: item.rarity,
        category: item.category || item.type,
        ...item
      };

      const updatedEquipment = {
        ...equipment,
        inventory: [...(equipment.inventory || []), newItem]
      };

      await updateCharacter(characterId, { equipment: updatedEquipment });
      
      toast({
        title: "Item Added",
        description: `${item.name} added to ${character.name}'s inventory`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to character",
        variant: "destructive",
      });
    }
  };

  const handleCharacterSelect = async (characterId: string) => {
    if (itemToAdd) {
      await addItemToCharacter(characterId, itemToAdd);
      setItemToAdd(null);
      setShowCharacterSelect(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-[#1a1a1a] text-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Error Loading Equipment</h2>
            <p>{error}</p>
            <p className="text-sm text-gray-400 mt-2">Using hybrid data service</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] text-white">
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

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {showCharacterSelect && (
        <CharacterSelectModal
          characters={characters}
          onSelect={handleCharacterSelect}
          onClose={() => setShowCharacterSelect(false)}
          itemName={itemToAdd?.name || ''}
        />
      )}
    </div>
  );
};

export default ItemsTab;
