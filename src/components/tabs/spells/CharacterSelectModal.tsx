
import { useState, useEffect } from 'react';
import { useCharacters } from '../../../hooks/useCharacters';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Open5eSpell } from '../../../services/open5eApi';

interface CharacterSelectModalProps {
  onClose: () => void;
  selectedSpell?: Open5eSpell | null;
}

const CharacterSelectModal = ({ onClose, selectedSpell }: CharacterSelectModalProps) => {
  const { characters, loading, updateCharacter } = useCharacters();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const addSpellToCharacter = async (characterId: string) => {
    if (!selectedSpell) {
      toast({
        title: "Error",
        description: "No spell selected",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      // Get the character's current spells
      const character = characters.find(c => c.id === characterId);
      if (!character) {
        throw new Error('Character not found');
      }

      const currentSpells = character.spells || [];
      
      // Check if spell is already known
      const spellExists = currentSpells.some((spell: any) => 
        spell.name === selectedSpell.name || spell.slug === selectedSpell.slug
      );

      if (spellExists) {
        toast({
          title: "Info",
          description: `${character.name} already knows ${selectedSpell.name}`,
        });
        onClose();
        return;
      }

      // Create the spell object to add
      const spellToAdd = {
        name: selectedSpell.name,
        level: selectedSpell.level,
        school: selectedSpell.school,
        casting_time: selectedSpell.casting_time,
        range: selectedSpell.range,
        components: selectedSpell.components,
        duration: selectedSpell.duration,
        description: selectedSpell.desc?.join('\n') || '',
        classes: selectedSpell.classes,
        prepared: false, // Default to not prepared
        slug: selectedSpell.slug,
        source: 'added'
      };

      // Add to spells list
      const updatedSpells = [...currentSpells, spellToAdd];

      // Update the character
      await updateCharacter(characterId, { spells: updatedSpells });

      toast({
        title: "Success",
        description: `${selectedSpell.name} added to ${character.name}'s spell list`,
      });

      onClose();
    } catch (error) {
      console.error('Error adding spell to character:', error);
      toast({
        title: "Error",
        description: "Failed to add spell to character",
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
          Add {selectedSpell?.name} to Character
        </h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading characters...</span>
          </div>
        ) : characters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No characters found</p>
            <p className="text-sm">Create a character first to add spells</p>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {characters.map((character) => (
              <button
                key={character.id}
                onClick={() => addSpellToCharacter(character.id)}
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
