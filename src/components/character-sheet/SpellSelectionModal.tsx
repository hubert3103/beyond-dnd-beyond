
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Zap } from 'lucide-react';
import { useOpen5eData } from '@/hooks/useOpen5eData';

interface SpellSelectionModalProps {
  character: any;
  newLevel: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedSpells: any[]) => void;
}

const SpellSelectionModal = ({ character, newLevel, isOpen, onClose, onConfirm }: SpellSelectionModalProps) => {
  const [selectedSpells, setSelectedSpells] = useState<any[]>([]);
  const [availableSpells, setAvailableSpells] = useState<any[]>([]);
  const { spells } = useOpen5eData();

  const spellsToLearn = getSpellsToLearn();

  function getSpellsToLearn() {
    const className = character.class_name?.toLowerCase();
    const currentLevel = character.level;
    
    console.log('Calculating spells to learn for:', className, 'from level', currentLevel, 'to', newLevel);
    
    // Calculate spells known based on class and level
    const spellsKnownProgression: { [key: string]: { [key: number]: number } } = {
      bard: { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14 },
      sorcerer: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11 },
      warlock: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 10 },
      // Wizards learn 2 spells per level (except at level 1 where they start with 6)
      wizard: { 1: 6, 2: 8, 3: 10, 4: 12, 5: 14, 6: 16, 7: 18, 8: 20, 9: 22, 10: 24 }
    };

    if (className === 'wizard') {
      // Wizards learn 2 spells per level after 1st level
      if (newLevel > currentLevel) {
        const levelsGained = newLevel - currentLevel;
        const spellsToLearn = levelsGained * 2;
        console.log('Wizard should learn', spellsToLearn, 'spells for', levelsGained, 'levels gained');
        return spellsToLearn;
      }
      return 0;
    }

    if (spellsKnownProgression[className]) {
      const currentLevelSpells = spellsKnownProgression[className][currentLevel] || 0;
      const newLevelSpells = spellsKnownProgression[className][newLevel] || 0;
      const spellsToLearn = newLevelSpells - currentLevelSpells;
      
      console.log('Class:', className);
      console.log('Current level spells should be:', currentLevelSpells);
      console.log('New level spells should be:', newLevelSpells);
      console.log('Spells to learn:', spellsToLearn);
      
      return Math.max(0, spellsToLearn);
    }

    console.log('No progression found for class:', className);
    return 0;
  }

  useEffect(() => {
    if (isOpen && spells) {
      const className = character.class_name?.toLowerCase();
      
      // Create class mapping for spell filtering
      const classSpellMapping: { [key: string]: string[] } = {
        wizard: ['wizard'],
        sorcerer: ['sorcerer'],
        warlock: ['warlock'],
        bard: ['bard'],
        cleric: ['cleric'],
        druid: ['druid'],
        paladin: ['paladin'],
        ranger: ['ranger'],
        artificer: ['artificer']
      };
      
      // Filter spells available to this class
      const classSpells = spells.filter((spell: any) => {
        if (!spell.classes || !Array.isArray(spell.classes)) return false;
        
        const validClasses = classSpellMapping[className] || [];
        return spell.classes.some((spellClass: string) => {
          const normalizedSpellClass = spellClass.toLowerCase();
          return validClasses.some(validClass => normalizedSpellClass.includes(validClass));
        });
      });

      console.log(`Found ${classSpells.length} spells for ${className}`);

      // Filter out spells already known
      const knownSpellNames = (character.spells || []).map((spell: any) => spell.name);
      const unknownSpells = classSpells.filter((spell: any) => 
        !knownSpellNames.includes(spell.name)
      );

      // Get spells of appropriate level
      const maxSpellLevel = getMaxSpellLevel(newLevel, className);
      const levelAppropriateSpells = unknownSpells.filter((spell: any) => {
        const spellLevel = parseInt(spell.level) || 0;
        return spellLevel <= maxSpellLevel;
      });

      console.log(`Filtered to ${levelAppropriateSpells.length} available spells at level ${maxSpellLevel} and below`);
      setAvailableSpells(levelAppropriateSpells);
    }
  }, [isOpen, spells, character, newLevel]);

  const getMaxSpellLevel = (characterLevel: number, className: string) => {
    if (className === 'warlock') {
      if (characterLevel < 3) return 1;
      if (characterLevel < 5) return 2;
      if (characterLevel < 7) return 3;
      if (characterLevel < 9) return 4;
      return 5;
    }
    
    if (['paladin', 'ranger'].includes(className)) {
      if (characterLevel < 2) return 0;
      if (characterLevel < 5) return 1;
      if (characterLevel < 9) return 2;
      if (characterLevel < 13) return 3;
      if (characterLevel < 17) return 4;
      return 5;
    }
    
    // Full casters (wizard, sorcerer, bard, cleric, druid)
    return Math.ceil(characterLevel / 2);
  };

  const toggleSpellSelection = (spell: any) => {
    setSelectedSpells(prev => {
      const isSelected = prev.some(s => s.name === spell.name);
      if (isSelected) {
        return prev.filter(s => s.name !== spell.name);
      } else if (prev.length < spellsToLearn) {
        return [...prev, spell];
      }
      return prev;
    });
  };

  const handleConfirm = () => {
    console.log('Confirming spell selection:', selectedSpells);
    onConfirm(selectedSpells);
    setSelectedSpells([]);
    onClose();
  };

  if (spellsToLearn === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <span>Learn New Spells</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              Choose {spellsToLearn} New Spells
            </div>
            <div className="text-sm text-gray-600">
              Selected: {selectedSpells.length} / {spellsToLearn}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Debug: Level {character.level} → {newLevel}, Class: {character.class_name}
            </div>
          </div>

          <Separator />

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableSpells.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No spells available to learn at your level</p>
                <p className="text-xs mt-2">Loading spells... ({spells?.length || 0} total spells loaded)</p>
              </div>
            ) : (
              availableSpells.map((spell) => {
                const isSelected = selectedSpells.some(s => s.name === spell.name);
                const spellLevel = parseInt(spell.level) || 0;
                
                return (
                  <div
                    key={spell.name}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-purple-50 border-purple-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleSpellSelection(spell)}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        checked={isSelected}
                        disabled={!isSelected && selectedSpells.length >= spellsToLearn}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{spell.name}</h4>
                          <Badge variant="secondary">
                            {spellLevel === 0 ? 'Cantrip' : `Level ${spellLevel}`}
                          </Badge>
                          <Badge variant="outline">{spell.school}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {spell.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Separator />

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={selectedSpells.length !== spellsToLearn}
            >
              Learn Spells
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpellSelectionModal;
