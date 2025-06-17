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
import { TrendingUp, Heart, Zap, Plus, Star } from 'lucide-react';
import AbilityScoreImprovementModal from './AbilityScoreImprovementModal';
import SpellSelectionModal from './SpellSelectionModal';

interface LevelUpModalProps {
  character: any;
  newLevel: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (updatedCharacter: any) => void;
}

const LevelUpModal = ({ character, newLevel, isOpen, onClose, onConfirm }: LevelUpModalProps) => {
  const [levelUpChanges, setLevelUpChanges] = useState<any>(null);
  const [showASIModal, setShowASIModal] = useState(false);
  const [showSpellModal, setShowSpellModal] = useState(false);
  const [abilityImprovements, setAbilityImprovements] = useState<{ [key: string]: number }>({});
  const [newSpells, setNewSpells] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && character && newLevel !== character.level) {
      calculateLevelUpChanges();
      setAbilityImprovements({});
      setNewSpells([]);
    }
  }, [isOpen, character, newLevel]);

  const calculateLevelUpChanges = () => {
    const changes: any = {
      totalHitPointIncrease: 0,
      proficiencyBonusIncrease: false,
      newFeatures: [],
      abilityScoreImprovements: 0,
      spellSlotsIncrease: {},
      spellsKnownIncrease: 0,
      levelsGained: newLevel - character.level,
      classFeatures: [],
      isLevelDown: newLevel < character.level
    };

    if (changes.isLevelDown) {
      // For level downs, calculate what the character should have at the new level
      changes.totalHitPointIncrease = calculateTotalHPAtLevel(newLevel) - (character.hit_points?.max || character.maxHP || 0);
      changes.proficiencyBonusIncrease = false; // Will be recalculated
      
      // No new features or improvements when leveling down
      changes.abilityScoreImprovements = 0;
      changes.spellsKnownIncrease = 0;
      changes.classFeatures = [];
    } else {
      // Calculate HP increase for leveling up
      const conModifier = Math.floor((character.abilities.constitution.score - 10) / 2);
      const hitDie = character.class_data?.hit_die || 8;
      
      for (let level = character.level + 1; level <= newLevel; level++) {
        if (character.hit_point_type === 'fixed') {
          // Fixed HP: average of hit die + 1 + CON modifier
          const hpGain = Math.floor(hitDie / 2) + 1 + conModifier;
          changes.totalHitPointIncrease += hpGain;
        } else {
          // Rolled HP: use average for now
          const hpGain = Math.floor(hitDie / 2) + 1 + conModifier;
          changes.totalHitPointIncrease += hpGain;
        }
      }

      // Check proficiency bonus increase
      const oldProfBonus = Math.ceil(character.level / 4) + 1;
      const newProfBonus = Math.ceil(newLevel / 4) + 1;
      changes.proficiencyBonusIncrease = newProfBonus > oldProfBonus;

      // Count ability score improvements
      const asiLevels = [4, 8, 12, 16, 19];
      for (let level = character.level + 1; level <= newLevel; level++) {
        if (asiLevels.includes(level)) {
          changes.abilityScoreImprovements++;
        }
      }

      // Get class features for new levels
      changes.classFeatures = getClassFeatures(character.level + 1, newLevel);

      // Calculate spell slot increases for spellcasters
      if (character.class_data?.spellcasting_ability) {
        const oldSpellSlots = calculateSpellSlots(character.level, character.class_name);
        const newSpellSlots = calculateSpellSlots(newLevel, character.class_name);
        
        for (let level = 1; level <= 9; level++) {
          const oldSlots = oldSpellSlots[`level_${level}`] || 0;
          const newSlots = newSpellSlots[`level_${level}`] || 0;
          if (newSlots > oldSlots) {
            changes.spellSlotsIncrease[`level_${level}`] = newSlots - oldSlots;
          }
        }

        // Calculate spells known increase
        changes.spellsKnownIncrease = calculateSpellsKnownIncrease(character.level, newLevel, character.class_name);
      }
    }

    setLevelUpChanges(changes);
  };

  const calculateTotalHPAtLevel = (level: number) => {
    const conModifier = Math.floor((character.abilities.constitution.score - 10) / 2);
    const hitDie = character.class_data?.hit_die || 8;
    
    // Level 1 HP: max hit die + CON modifier
    let totalHP = hitDie + conModifier;
    
    // Additional levels
    for (let i = 2; i <= level; i++) {
      if (character.hit_point_type === 'fixed') {
        totalHP += Math.floor(hitDie / 2) + 1 + conModifier;
      } else {
        totalHP += Math.floor(hitDie / 2) + 1 + conModifier;
      }
    }
    
    return totalHP;
  };

  const getClassFeatures = (fromLevel: number, toLevel: number) => {
    const className = character.class_name?.toLowerCase();
    const features: any[] = [];

    const classFeaturesByLevel: { [key: string]: { [key: number]: string[] } } = {
      fighter: {
        1: ['Fighting Style', 'Second Wind'],
        2: ['Action Surge'],
        3: ['Martial Archetype'],
        4: ['Ability Score Improvement'],
        5: ['Extra Attack'],
        6: ['Ability Score Improvement'],
        7: ['Martial Archetype Feature'],
        8: ['Ability Score Improvement'],
        9: ['Indomitable'],
        10: ['Martial Archetype Feature'],
        11: ['Extra Attack (2)'],
        12: ['Ability Score Improvement']
      },
      wizard: {
        1: ['Spellcasting', 'Arcane Recovery'],
        2: ['Arcane Tradition'],
        3: ['Cantrip Formulas'],
        4: ['Ability Score Improvement'],
        5: ['3rd-level Spells'],
        6: ['Arcane Tradition Feature'],
        7: ['4th-level Spells'],
        8: ['Ability Score Improvement'],
        9: ['5th-level Spells'],
        10: ['Arcane Tradition Feature']
      },
      rogue: {
        1: ['Expertise', 'Sneak Attack', 'Thieves\' Cant'],
        2: ['Cunning Action'],
        3: ['Roguish Archetype'],
        4: ['Ability Score Improvement'],
        5: ['Uncanny Dodge'],
        6: ['Expertise'],
        7: ['Evasion'],
        8: ['Ability Score Improvement'],
        9: ['Roguish Archetype Feature'],
        10: ['Ability Score Improvement']
      }
    };

    const classFeatures = classFeaturesByLevel[className] || {};

    for (let level = fromLevel; level <= toLevel; level++) {
      if (classFeatures[level]) {
        features.push(...classFeatures[level].map(feature => ({ level, feature })));
      }
    }

    return features;
  };

  const calculateSpellSlots = (level: number, className: string) => {
    const fullCasterSlots: { [key: number]: any } = {
      1: { level_1: 2 },
      2: { level_1: 3 },
      3: { level_1: 4, level_2: 2 },
      4: { level_1: 4, level_2: 3 },
      5: { level_1: 4, level_2: 3, level_3: 2 },
      6: { level_1: 4, level_2: 3, level_3: 3 },
      7: { level_1: 4, level_2: 3, level_3: 3, level_4: 1 },
      8: { level_1: 4, level_2: 3, level_3: 3, level_4: 2 },
      9: { level_1: 4, level_2: 3, level_3: 3, level_4: 3, level_5: 1 }
    };

    if (['wizard', 'sorcerer', 'warlock', 'bard', 'cleric', 'druid'].includes(className?.toLowerCase() || '')) {
      return fullCasterSlots[level] || {};
    }

    return {};
  };

  const calculateSpellsKnownIncrease = (oldLevel: number, newLevel: number, className: string) => {
    const spellsKnownProgression: { [key: string]: { [key: number]: number } } = {
      bard: { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14 },
      sorcerer: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11 },
      warlock: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 10 }
    };

    const progression = spellsKnownProgression[className?.toLowerCase()];
    if (!progression) return 0;

    const oldSpells = progression[oldLevel] || 0;
    const newSpells = progression[newLevel] || 0;
    return Math.max(0, newSpells - oldSpells);
  };

  const handleNext = () => {
    if (!levelUpChanges.isLevelDown && levelUpChanges.abilityScoreImprovements > 0 && Object.keys(abilityImprovements).length === 0) {
      setShowASIModal(true);
    } else if (!levelUpChanges.isLevelDown && levelUpChanges.spellsKnownIncrease > 0 && newSpells.length === 0) {
      setShowSpellModal(true);
    } else {
      handleConfirm();
    }
  };

  const handleASIConfirm = (improvements: { [key: string]: number }) => {
    setAbilityImprovements(improvements);
    setShowASIModal(false);
    
    if (levelUpChanges.spellsKnownIncrease > 0) {
      setShowSpellModal(true);
    } else {
      handleConfirm();
    }
  };

  const handleSpellConfirm = (selectedSpells: any[]) => {
    setNewSpells(selectedSpells);
    setShowSpellModal(false);
    handleConfirm();
  };

  const handleConfirm = () => {
    if (!levelUpChanges) return;

    let updatedCharacter;

    if (levelUpChanges.isLevelDown) {
      // For level downs, recalculate everything from scratch
      const newTotalHP = calculateTotalHPAtLevel(newLevel);
      const newProficiencyBonus = Math.ceil(newLevel / 4) + 1;
      
      // Reset abilities to base values (no ASI improvements beyond what the new level should have)
      const resetAbilities = { ...character.abilities };
      
      // Calculate how many ASI levels the character should have at the new level
      const asiLevels = [4, 8, 12, 16, 19];
      const allowedASILevels = asiLevels.filter(level => level <= newLevel);
      
      // For simplicity, we'll reset abilities to their original values
      // In a more complex system, you'd need to track original ability scores
      
      // Reset spell slots to what they should be at the new level
      const newSpellSlots = character.class_data?.spellcasting_ability 
        ? calculateSpellSlots(newLevel, character.class_name)
        : {};

      // Reset spells known (simplified - removes newest spells first)
      const spellsKnownProgression: { [key: string]: { [key: number]: number } } = {
        bard: { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14 },
        sorcerer: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11 },
        warlock: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 10 }
      };
      
      const progression = spellsKnownProgression[character.class_name?.toLowerCase()];
      const maxSpellsAtLevel = progression ? progression[newLevel] || 0 : 0;
      const resetSpells = character.spells ? character.spells.slice(0, maxSpellsAtLevel) : [];

      updatedCharacter = {
        ...character,
        level: newLevel,
        abilities: resetAbilities,
        hit_points: {
          ...character.hit_points,
          max: newTotalHP,
          current: Math.min((character.hit_points?.current !== undefined ? character.hit_points.current : character.currentHP || 0), newTotalHP),
        },
        maxHP: newTotalHP,
        currentHP: Math.min((character.hit_points?.current !== undefined ? character.hit_points.current : character.currentHP || 0), newTotalHP),
        proficiencyBonus: newProficiencyBonus,
        spellSlots: newSpellSlots,
        spells: resetSpells
      };
    } else {
      // Level up logic (existing code)
      const updatedAbilities = { ...character.abilities };
      Object.entries(abilityImprovements).forEach(([ability, improvement]) => {
        if (improvement > 0) {
          const newScore = updatedAbilities[ability].score + improvement;
          updatedAbilities[ability] = {
            ...updatedAbilities[ability],
            score: newScore,
            modifier: Math.floor((newScore - 10) / 2)
          };
        }
      });

      updatedCharacter = {
        ...character,
        level: newLevel,
        abilities: updatedAbilities,
        hit_points: {
          ...character.hit_points,
          max: (character.hit_points?.max || character.maxHP || 0) + levelUpChanges.totalHitPointIncrease,
          current: (character.hit_points?.current !== undefined ? character.hit_points.current : character.currentHP || 0) + levelUpChanges.totalHitPointIncrease,
        },
        maxHP: (character.hit_points?.max || character.maxHP || 0) + levelUpChanges.totalHitPointIncrease,
        currentHP: (character.hit_points?.current !== undefined ? character.hit_points.current : character.currentHP || 0) + levelUpChanges.totalHitPointIncrease,
        proficiencyBonus: Math.ceil(newLevel / 4) + 1,
        spellSlots: {
          ...character.spellSlots,
          ...Object.keys(levelUpChanges.spellSlotsIncrease).reduce((acc, key) => {
            acc[key] = (character.spellSlots?.[key] || 0) + levelUpChanges.spellSlotsIncrease[key];
            return acc;
          }, {} as any)
        },
        spells: [...(character.spells || []), ...newSpells]
      };
    }

    onConfirm(updatedCharacter);
    onClose();
  };

  if (!levelUpChanges) return null;

  const isLevelDown = levelUpChanges.isLevelDown;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>{isLevelDown ? 'Level Down' : 'Level Up!'}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${isLevelDown ? 'text-red-600' : 'text-green-600'}`}>
                Level {character.level} → {newLevel}
              </div>
              <div className="text-sm text-gray-600">
                {character.class_name} {isLevelDown ? 'regression' : 'advancement'} ({Math.abs(levelUpChanges.levelsGained)} level{Math.abs(levelUpChanges.levelsGained) > 1 ? 's' : ''})
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Hit Points</span>
                </div>
                <Badge variant={isLevelDown ? "destructive" : "secondary"}>
                  {isLevelDown ? '' : '+'}{levelUpChanges.totalHitPointIncrease}
                </Badge>
              </div>

              {isLevelDown && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-sm font-medium text-yellow-800">
                    Level Down Warning
                  </div>
                  <div className="text-xs text-yellow-600 mt-1">
                    This will reset your character's stats to match level {newLevel}. Some abilities, spells, and bonuses may be lost.
                  </div>
                </div>
              )}

              {!isLevelDown && levelUpChanges.proficiencyBonusIncrease && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Plus className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Proficiency Bonus</span>
                  </div>
                  <Badge variant="secondary">+1</Badge>
                </div>
              )}

              {!isLevelDown && Object.keys(levelUpChanges.spellSlotsIncrease).length > 0 && (
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

              {!isLevelDown && levelUpChanges.classFeatures.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">New Class Features</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    {levelUpChanges.classFeatures.map((feature: any, index: number) => (
                      <div key={index} className="text-xs">
                        Level {feature.level}: {feature.feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isLevelDown && levelUpChanges.abilityScoreImprovements > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-sm font-medium text-yellow-800">
                    {levelUpChanges.abilityScoreImprovements} Ability Score Improvement{levelUpChanges.abilityScoreImprovements > 1 ? 's' : ''} Available
                  </div>
                  <div className="text-xs text-yellow-600 mt-1">
                    You can increase abilities by a total of {levelUpChanges.abilityScoreImprovements * 2} points
                  </div>
                </div>
              )}

              {!isLevelDown && levelUpChanges.spellsKnownIncrease > 0 && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm font-medium text-purple-800">
                    Learn {levelUpChanges.spellsKnownIncrease} New Spell{levelUpChanges.spellsKnownIncrease > 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    Choose new spells for your spellbook
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleNext} 
                className={`flex-1 ${isLevelDown ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isLevelDown ? 'Confirm Level Down' : 
                 (levelUpChanges.abilityScoreImprovements > 0 || levelUpChanges.spellsKnownIncrease > 0 ? 'Continue' : 'Level Up!')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {!isLevelDown && (
        <>
          <AbilityScoreImprovementModal
            character={character}
            isOpen={showASIModal}
            onClose={() => setShowASIModal(false)}
            onConfirm={handleASIConfirm}
          />

          <SpellSelectionModal
            character={character}
            newLevel={newLevel}
            isOpen={showSpellModal}
            onClose={() => setShowSpellModal(false)}
            onConfirm={handleSpellConfirm}
          />
        </>
      )}
    </>
  );
};

export default LevelUpModal;
