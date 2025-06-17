
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
import { TrendingUp, Heart, Zap, Plus } from 'lucide-react';

interface LevelUpModalProps {
  character: any;
  newLevel: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (updatedCharacter: any) => void;
}

const LevelUpModal = ({ character, newLevel, isOpen, onClose, onConfirm }: LevelUpModalProps) => {
  const [levelUpChanges, setLevelUpChanges] = useState<any>(null);
  const [selectedChoices, setSelectedChoices] = useState<any>({});

  useEffect(() => {
    if (isOpen && character && newLevel > character.level) {
      calculateLevelUpChanges();
    }
  }, [isOpen, character, newLevel]);

  const calculateLevelUpChanges = () => {
    const changes: any = {
      hitPointIncrease: 0,
      proficiencyBonusIncrease: false,
      newFeatures: [],
      abilityScoreImprovement: false,
      spellSlotsIncrease: {},
      spellsKnownIncrease: 0,
    };

    // Calculate hit point increase
    const conModifier = Math.floor((character.abilities.constitution.score - 10) / 2);
    if (character.hit_point_type === 'fixed') {
      const hitDie = character.class_data?.hit_die || 8;
      changes.hitPointIncrease = Math.floor(hitDie / 2) + 1 + conModifier;
    } else {
      // For rolled or average, use average + con modifier
      const hitDie = character.class_data?.hit_die || 8;
      changes.hitPointIncrease = Math.floor(hitDie / 2) + 1 + conModifier;
    }

    // Check proficiency bonus increase
    const oldProfBonus = Math.ceil(character.level / 4) + 1;
    const newProfBonus = Math.ceil(newLevel / 4) + 1;
    changes.proficiencyBonusIncrease = newProfBonus > oldProfBonus;

    // Check for ability score improvement (levels 4, 8, 12, 16, 19)
    const asiLevels = [4, 8, 12, 16, 19];
    changes.abilityScoreImprovement = asiLevels.includes(newLevel);

    // Calculate spell slot increases for spellcasters
    if (character.class_data?.spellcasting_ability) {
      const spellcasterLevel = newLevel;
      const oldSpellSlots = calculateSpellSlots(character.level, character.class_name);
      const newSpellSlots = calculateSpellSlots(spellcasterLevel, character.class_name);
      
      for (let level = 1; level <= 9; level++) {
        const oldSlots = oldSpellSlots[`level_${level}`] || 0;
        const newSlots = newSpellSlots[`level_${level}`] || 0;
        if (newSlots > oldSlots) {
          changes.spellSlotsIncrease[`level_${level}`] = newSlots - oldSlots;
        }
      }
    }

    setLevelUpChanges(changes);
  };

  const calculateSpellSlots = (level: number, className: string) => {
    // Simplified spell slot calculation - full casters
    const fullCasterSlots: { [key: number]: any } = {
      1: { level_1: 2 },
      2: { level_1: 3 },
      3: { level_1: 4, level_2: 2 },
      4: { level_1: 4, level_2: 3 },
      5: { level_1: 4, level_2: 3, level_3: 2 },
      // Add more levels as needed
    };

    if (['wizard', 'sorcerer', 'warlock', 'bard', 'cleric', 'druid'].includes(className?.toLowerCase() || '')) {
      return fullCasterSlots[level] || {};
    }

    return {};
  };

  const handleConfirm = () => {
    if (!levelUpChanges) return;

    const updatedCharacter = {
      ...character,
      level: newLevel,
      hit_points: {
        ...character.hit_points,
        max: (character.hit_points?.max || character.maxHP || 0) + levelUpChanges.hitPointIncrease,
        current: (character.hit_points?.current !== undefined ? character.hit_points.current : character.currentHP || 0) + levelUpChanges.hitPointIncrease,
      },
      maxHP: (character.hit_points?.max || character.maxHP || 0) + levelUpChanges.hitPointIncrease,
      currentHP: (character.hit_points?.current !== undefined ? character.hit_points.current : character.currentHP || 0) + levelUpChanges.hitPointIncrease,
      proficiencyBonus: Math.ceil(newLevel / 4) + 1,
      spellSlots: {
        ...character.spellSlots,
        ...Object.keys(levelUpChanges.spellSlotsIncrease).reduce((acc, key) => {
          acc[key] = (character.spellSlots?.[key] || 0) + levelUpChanges.spellSlotsIncrease[key];
          return acc;
        }, {} as any)
      }
    };

    onConfirm(updatedCharacter);
    onClose();
  };

  if (!levelUpChanges) return null;

  return (
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
            <div className="text-sm text-gray-600">
              {character.class_name} advancement
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Hit Points</span>
              </div>
              <Badge variant="secondary">+{levelUpChanges.hitPointIncrease}</Badge>
            </div>

            {levelUpChanges.proficiencyBonusIncrease && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Proficiency Bonus</span>
                </div>
                <Badge variant="secondary">+1</Badge>
              </div>
            )}

            {Object.keys(levelUpChanges.spellSlotsIncrease).length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">New Spell Slots</span>
                </div>
                <div className="grid grid-cols-3 gap-2 ml-6">
                  {Object.entries(levelUpChanges.spellSlotsIncrease).map(([level, increase]) => (
                    <div key={level} className="text-xs">
                      Level {level.split('_')[1]}: +{increase as number}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {levelUpChanges.abilityScoreImprovement && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-sm font-medium text-yellow-800">
                  Ability Score Improvement Available
                </div>
                <div className="text-xs text-yellow-600 mt-1">
                  You can increase two ability scores by 1 each, or one ability score by 2.
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="flex-1 bg-green-600 hover:bg-green-700">
              Level Up!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LevelUpModal;
