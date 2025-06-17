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
  const [filters, setFilters] = useState({
    types: [] as string[],
    rarities: [] as string[]
  });
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [itemToAdd, setItemToAdd] = useState<Open5eEquipment | null>(null);

  // Memoize available sources for better performance
  const typeOptions = useMemo(() => {
    const types = new Set<string>();
    equipment.forEach(item => types.add(item.type));
    return Array.from(types).sort();
  }, [equipment]);

  const rarityOptions = useMemo(() => {
    const rarities = new Set<string>();
    equipment.forEach(item => rarities.add(item.rarity));
    return Array.from(rarities).sort();
  }, [equipment]);

  // Optimized filtering and sorting - only recalculates when dependencies change
  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filters.types.length > 0 && !filters.types.includes(item.type)) {
        return false;
      }
      if (filters.rarities.length > 0 && !filters.rarities.includes(item.rarity)) {
        return false;
      }
      return true;
    });
  }, [equipment, searchTerm, filters]);

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
        filters={filters}
        onFiltersChange={setFilters}
        typeOptions={typeOptions}
        rarityOptions={rarityOptions}
        isLoading={isLoading}
        totalItems={equipment.length}
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
          onAddToCharacter={handleAddToCharacter}
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
