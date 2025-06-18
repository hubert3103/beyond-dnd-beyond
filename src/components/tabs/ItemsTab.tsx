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
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [itemToAdd, setItemToAdd] = useState<Open5eEquipment | null>(null);

  // Function to normalize rarity values to standard D&D 5e rarities
  const normalizeRarity = (rarity: string): string => {
    if (!rarity) return 'common';
    
    const lowerRarity = rarity.toLowerCase();
    
    // Extract the primary rarity from complex descriptions
    if (lowerRarity.includes('artifact')) return 'artifact';
    if (lowerRarity.includes('legendary')) return 'legendary';
    if (lowerRarity.includes('very rare')) return 'very rare';
    if (lowerRarity.includes('rare')) return 'rare';
    if (lowerRarity.includes('uncommon')) return 'uncommon';
    if (lowerRarity.includes('common')) return 'common';
    
    // Handle edge cases
    if (lowerRarity.includes('varies')) return 'varies';
    
    // Default to common for unknown rarities
    return 'common';
  };

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

  // Memoize available rarities - now using normalized values
  const availableRarities = useMemo(() => {
    const rarities = new Set<string>();
    equipment.forEach(item => {
      const normalizedRarity = normalizeRarity(item.rarity);
      rarities.add(normalizedRarity);
    });
    
    // Define the standard order for D&D 5e rarities
    const rarityOrder = ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact', 'varies'];
    
    return rarityOrder.filter(rarity => rarities.has(rarity));
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

  // Handle rarity filter changes
  const handleRarityFilterChange = (rarity: string, checked: boolean) => {
    setSelectedRarities(prev => {
      if (checked) {
        return [...prev, rarity];
      } else {
        return prev.filter(r => r !== rarity);
      }
    });
  };

  // Optimized filtering and sorting - now using normalized rarity for filtering
  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (selectedSources.length > 0 && !selectedSources.includes(item.document__slug)) {
        return false;
      }
      if (selectedRarities.length > 0) {
        const normalizedRarity = normalizeRarity(item.rarity);
        if (!selectedRarities.includes(normalizedRarity)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      // Default sort by name
      return a.name.localeCompare(b.name);
    });
  }, [equipment, searchTerm, selectedSources, selectedRarities]);

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
        weight: typeof item.weight === 'string' ? parseFloat(item.weight) || 0 : (item.weight || 0),
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
        selectedSources={selectedSources}
        onSourceFilterChange={handleSourceFilterChange}
        availableSources={availableSources}
        selectedRarities={selectedRarities}
        onRarityFilterChange={handleRarityFilterChange}
        availableRarities={availableRarities}
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
          isOpen={showCharacterSelect}
          onClose={() => setShowCharacterSelect(false)}
          selectedItem={itemToAdd}
        />
      )}
    </div>
  );
};

export default ItemsTab;
