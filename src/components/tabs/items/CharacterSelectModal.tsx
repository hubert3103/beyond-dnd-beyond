
import { useState, useEffect } from 'react';
import { useCharacters } from '../../../hooks/useCharacters';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Open5eEquipment } from '../../../services/open5eApi';

interface CharacterSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: Open5eEquipment | null;
}

const CharacterSelectModal = ({ isOpen, onClose, selectedItem }: CharacterSelectModalProps) => {
  const { characters, loading, updateCharacter } = useCharacters();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const addItemToCharacter = async (characterId: string) => {
    if (!selectedItem) {
      toast({
        title: "Error",
        description: "No item selected",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      // Get the character's current equipment
      const character = characters.find(c => c.id === characterId);
      if (!character) {
        throw new Error('Character not found');
      }

      const currentEquipment = character.equipment || { starting_equipment: [], inventory: [] };
      
      // Create the item object to add
      const itemToAdd = {
        name: selectedItem.name,
        type: selectedItem.type,
        rarity: selectedItem.rarity,
        cost: selectedItem.cost,
        weight: selectedItem.weight,
        description: selectedItem.desc?.join('\n') || '',
        equipped: false,
        category: selectedItem.category || 'item',
        ac: selectedItem.ac,
        damage: selectedItem.damage,
        damage_type: selectedItem.damage_type,
        damage_dice: selectedItem.damage_dice,
        requires_attunement: selectedItem.requires_attunement || false,
        index: selectedItem.slug,
        source: 'added'
      };

      // Add to inventory
      const updatedEquipment = {
        ...currentEquipment,
        inventory: [...(currentEquipment.inventory || []), itemToAdd]
      };

      // Update the character
      await updateCharacter(characterId, { equipment: updatedEquipment });

      toast({
        title: "Success",
        description: `${selectedItem.name} added to ${character.name}'s inventory`,
      });

      onClose();
    } catch (error) {
      console.error('Error adding item to character:', error);
      toast({
        title: "Error",
        description: "Failed to add item to character",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Add {selectedItem?.name} to Character
        </h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading characters...</span>
          </div>
        ) : characters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No characters found</p>
            <p className="text-sm">Create a character first to add items</p>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {characters.map((character) => (
              <button
                key={character.id}
                onClick={() => addItemToCharacter(character.id)}
                disabled={isAdding}
                className="w-full text-left p-3 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{character.name}</div>
                  <div className="text-sm text-gray-600">
                    Level {character.level} {character.class_name} {character.species_name}
                  </div>
                </div>
                {isAdding && <Loader2 className="h-4 w-4 animate-spin" />}
              </button>
            ))}
          </div>
        )}
        
        <Button
          onClick={onClose}
          variant="outline"
          className="w-full"
          disabled={isAdding}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CharacterSelectModal;
