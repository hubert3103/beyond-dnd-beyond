
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Zap, TrendingUp, Plus } from 'lucide-react';
import AbilityScoreImprovementModal from './AbilityScoreImprovementModal';
import SpellSelectionModal from './SpellSelectionModal';

interface LevelUpModalProps {
  character: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (updatedCharacter: any) => void;
}

const LevelUpModal = ({ character, isOpen, onClose, onConfirm }: LevelUpModalProps) => {
  const [showAbilityImprovement, setShowAbilityImprovement] = useState(false);
  const [showSpellSelection, setShowSpellSelection] = useState(false);
  const [pendingAbilityImprovements, setPendingAbilityImprovements] = useState<{ [key: string]: number }>({});
  const [pendingSpells, setPendingSpells] = useState<any[]>([]);

  const newLevel = character.level + 1;
  const getsAbilityImprovement = [4, 8, 12, 16, 19, 20].includes(newLevel);
  const getsSpells = ['bard', 'sorcerer', 'warlock', 'wizard', 'cleric', 'druid'].includes(character.class_name?.toLowerCase());

  const calculateSpellSlots = (level: number, className: string) => {
    const spellSlotProgression: { [key: string]: { [key: number]: { [key: string]: number } } } = {
      'bard': {
        1: { '1': 2 }, 2: { '1': 3 }, 3: { '1': 4, '2': 2 }, 4: { '1': 4, '2': 3 },
        5: { '1': 4, '2': 3, '3': 2 }, 6: { '1': 4, '2': 3, '3': 3 }, 7: { '1': 4, '2': 3, '3': 3, '4': 1 },
        8: { '1': 4, '2': 3, '3': 3, '4': 2 }, 9: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 1 },
        10: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2 }
      },
      'sorcerer': {
        1: { '1': 2 }, 2: { '1': 3 }, 3: { '1': 4, '2': 2 }, 4: { '1': 4, '2': 3 },
        5: { '1': 4, '2': 3, '3': 2 }, 6: { '1': 4, '2': 3, '3': 3 }, 7: { '1': 4, '2': 3, '3': 3, '4': 1 },
        8: { '1': 4, '2': 3, '3': 3, '4': 2 }, 9: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 1 },
        10: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2 }
      },
      'wizard': {
        1: { '1': 2 }, 2: { '1': 3 }, 3: { '1': 4, '2': 2 }, 4: { '1': 4, '2': 3 },
        5: { '1': 4, '2': 3, '3': 2 }, 6: { '1': 4, '2': 3, '3': 3 }, 7: { '1': 4, '2': 3, '3': 3, '4': 1 },
        8: { '1': 4, '2': 3, '3': 3, '4': 2 }, 9: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 1 },
        10: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2 }
      },
      'warlock': {
        1: { '1': 1 }, 2: { '1': 2 }, 3: { '2': 2 }, 4: { '2': 2 },
        5: { '3': 2 }, 6: { '3': 2 }, 7: { '4': 2 }, 8: { '4': 2 },
        9: { '5': 2 }, 10: { '5': 2 }
      }
    };

    return spellSlotProgression[className.toLowerCase()]?.[level] || {};
  };

  const handleAbilityImprovementConfirm = (improvements: { [key: string]: number }) => {
    console.log('=== ABILITY IMPROVEMENT CONFIRMED ===');
    console.log('Improvements:', improvements);
    setPendingAbilityImprovements(improvements);
    setShowAbilityImprovement(false);
  };

  const handleSpellSelectionConfirm = (selectedSpells: any[]) => {
    console.log('=== SPELL SELECTION CONFIRMED ===');
    console.log('Selected spells:', selectedSpells);
    setPendingSpells(selectedSpells);
    setShowSpellSelection(false);
  };

  const handleLevelUpConfirm = () => {
    console.log('=== LEVEL UP CONFIRMATION START ===');
    console.log('Current character:', JSON.stringify(character, null, 2));
    console.log('Pending ability improvements:', pendingAbilityImprovements);
    console.log('Pending spells:', pendingSpells);

    // Deep clone the character to avoid mutations
    const updatedCharacter = JSON.parse(JSON.stringify(character));
    
    // Update level
    updatedCharacter.level = newLevel;
    console.log('✓ Level updated to:', newLevel);

    // Apply ability score improvements
    if (Object.keys(pendingAbilityImprovements).length > 0) {
      console.log('Applying ability improvements...');
      Object.entries(pendingAbilityImprovements).forEach(([ability, improvement]) => {
        if (improvement > 0) {
          const currentScore = updatedCharacter.abilities[ability]?.score || 10;
          const newScore = currentScore + improvement;
          const newModifier = Math.floor((newScore - 10) / 2);
          
          updatedCharacter.abilities[ability] = {
            ...updatedCharacter.abilities[ability],
            score: newScore,
            modifier: newModifier
          };
          
          console.log(`✓ ${ability}: ${currentScore} → ${newScore} (modifier: ${newModifier})`);
        }
      });
    }

    // Add new spells
    if (pendingSpells.length > 0) {
      console.log('Adding new spells...');
      const currentSpells = updatedCharacter.spells || [];
      const newSpells = [...currentSpells, ...pendingSpells];
      updatedCharacter.spells = newSpells;
      console.log(`✓ Spells updated: ${currentSpells.length} → ${newSpells.length}`);
      console.log('New spells added:', pendingSpells.map(s => s.name));
    }

    // Update spell slots
    if (getsSpells) {
      const newSpellSlots = calculateSpellSlots(newLevel, character.class_name);
      updatedCharacter.spellSlots = newSpellSlots;
      updatedCharacter.spell_slots = newSpellSlots; // Ensure both formats are updated
      console.log('✓ Spell slots updated:', newSpellSlots);
    }

    // Update hit points for new level
    const constitutionModifier = updatedCharacter.abilities.constitution?.modifier || 0;
    const hitDie = character.class_data?.hit_die || 8;
    const additionalHP = character.hit_point_type === 'fixed' 
      ? Math.floor(hitDie / 2) + 1 + constitutionModifier
      : Math.floor(Math.random() * hitDie) + 1 + constitutionModifier;

    const newMaxHP = updatedCharacter.hit_points.max + additionalHP;
    updatedCharacter.hit_points = {
      ...updatedCharacter.hit_points,
      max: newMaxHP,
      current: Math.min(updatedCharacter.hit_points.current + additionalHP, newMaxHP),
      hit_dice_remaining: newLevel
    };
    updatedCharacter.maxHP = newMaxHP;
    console.log('✓ Hit points updated:', updatedCharacter.hit_points);

    // Update proficiency bonus
    const newProficiencyBonus = Math.ceil(newLevel / 4) + 1;
    updatedCharacter.proficiencyBonus = newProficiencyBonus;
    console.log('✓ Proficiency bonus updated to:', newProficiencyBonus);

    console.log('=== FINAL UPDATED CHARACTER ===');
    console.log(JSON.stringify(updatedCharacter, null, 2));
    console.log('=== LEVEL UP CONFIRMATION END ===');

    // Pass the updated character to the parent
    onConfirm(updatedCharacter);
    
    // Reset state and close modal
    setPendingAbilityImprovements({});
    setPendingSpells([]);
    onClose();
  };

  const hasRequiredSelections = () => {
    const needsAbilityImprovement = getsAbilityImprovement && Object.keys(pendingAbilityImprovements).length === 0;
    const needsSpellSelection = getsSpells && pendingSpells.length === 0;
    return !needsAbilityImprovement && !needsSpellSelection;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Level Up!</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                Level {character.level} → {newLevel}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Choose your improvements for the new level
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              {getsAbilityImprovement && (
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Ability Score Improvement</div>
                    <Badge variant={Object.keys(pendingAbilityImprovements).length > 0 ? "default" : "secondary"}>
                      {Object.keys(pendingAbilityImprovements).length > 0 ? "Selected" : "Required"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Increase two ability scores by 1 each, or one by 2
                  </div>
                  {Object.keys(pendingAbilityImprovements).length > 0 && (
                    <div className="text-xs bg-green-50 p-2 rounded mb-2">
                      {Object.entries(pendingAbilityImprovements)
                        .filter(([_, value]) => value > 0)
                        .map(([ability, value]) => (
                          <div key={ability}>
                            {ability.charAt(0).toUpperCase() + ability.slice(1)}: +{value}
                          </div>
                        ))}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAbilityImprovement(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Choose Improvements
                  </Button>
                </div>
              )}

              {getsSpells && (
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Learn New Spells</div>
                    <Badge variant={pendingSpells.length > 0 ? "default" : "secondary"}>
                      {pendingSpells.length > 0 ? "Selected" : "Available"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Learn new spells for your class
                  </div>
                  {pendingSpells.length > 0 && (
                    <div className="text-xs bg-purple-50 p-2 rounded mb-2">
                      {pendingSpells.map((spell) => (
                        <div key={spell.name}>{spell.name}</div>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSpellSelection(true)}
                    className="w-full"
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Choose Spells
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleLevelUpConfirm} 
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!hasRequiredSelections()}
              >
                Confirm Level Up
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AbilityScoreImprovementModal
        character={character}
        isOpen={showAbilityImprovement}
        onClose={() => setShowAbilityImprovement(false)}
        onConfirm={handleAbilityImprovementConfirm}
      />

      <SpellSelectionModal
        character={character}
        newLevel={newLevel}
        isOpen={showSpellSelection}
        onClose={() => setShowSpellSelection(false)}
        onConfirm={handleSpellSelectionConfirm}
      />
    </>
  );
};

export default LevelUpModal;
