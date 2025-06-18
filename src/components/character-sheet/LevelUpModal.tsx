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

  // Define ASI levels constant
  const asiLevels = [4, 8, 12, 16, 19];

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
      const newTotalHP = calculateTotalHPAtLevel(newLevel);
      const currentMaxHP = character.hit_points?.max || character.maxHP || 0;
      changes.totalHitPointIncrease = newTotalHP - currentMaxHP;
      changes.proficiencyBonusIncrease = false;
      
      changes.abilityScoreImprovements = 0;
      changes.spellsKnownIncrease = 0;
      changes.classFeatures = [];
    } else {
      const conModifier = Math.floor((character.abilities.constitution.score - 10) / 2);
      const hitDie = character.class_data?.hit_die || 8;
      
      for (let level = character.level + 1; level <= newLevel; level++) {
        if (character.hit_point_type === 'fixed') {
          const hpGain = Math.floor(hitDie / 2) + 1 + conModifier;
          changes.totalHitPointIncrease += hpGain;
        } else if (character.hit_point_type === 'rolled') {
          const hpGain = Math.floor(hitDie / 2) + 1 + conModifier;
          changes.totalHitPointIncrease += hpGain;
        } else {
          const hpGain = Math.floor(hitDie / 2) + 1 + conModifier;
          changes.totalHitPointIncrease += hpGain;
        }
      }

      const oldProfBonus = Math.ceil(character.level / 4) + 1;
      const newProfBonus = Math.ceil(newLevel / 4) + 1;
      changes.proficiencyBonusIncrease = newProfBonus > oldProfBonus;

      for (let level = character.level + 1; level <= newLevel; level++) {
        if (asiLevels.includes(level)) {
          changes.abilityScoreImprovements++;
        }
      }

      changes.classFeatures = getClassFeatures(character.level + 1, newLevel);

      if (isSpellcaster(character.class_name)) {
        const oldSpellSlots = calculateSpellSlots(character.level, character.class_name);
        const newSpellSlots = calculateSpellSlots(newLevel, character.class_name);
        
        for (let level = 1; level <= 9; level++) {
          const oldSlots = oldSpellSlots[`level_${level}`] || 0;
          const newSlots = newSpellSlots[`level_${level}`] || 0;
          if (newSlots > oldSlots) {
            changes.spellSlotsIncrease[`level_${level}`] = newSlots - oldSlots;
          }
        }

        changes.spellsKnownIncrease = calculateSpellsKnownIncrease(character.level, newLevel, character.class_name);
      }
    }

    console.log('Calculated level up changes:', changes);
    setLevelUpChanges(changes);
  };

  const isSpellcaster = (className: string) => {
    const spellcasterClasses = ['wizard', 'sorcerer', 'warlock', 'bard', 'cleric', 'druid', 'artificer', 'paladin', 'ranger'];
    return spellcasterClasses.includes(className?.toLowerCase() || '');
  };

  const calculateTotalHPAtLevel = (level: number) => {
    const conModifier = Math.floor((character.abilities.constitution.score - 10) / 2);
    const hitDie = character.class_data?.hit_die || 8;
    
    let totalHP = hitDie + conModifier;
    
    for (let i = 2; i <= level; i++) {
      if (character.hit_point_type === 'fixed') {
        totalHP += Math.floor(hitDie / 2) + 1 + conModifier;
      } else if (character.hit_point_type === 'rolled') {
        totalHP += Math.floor(hitDie / 2) + 1 + conModifier;
      } else {
        totalHP += Math.floor(hitDie / 2) + 1 + conModifier;
      }
    }
    
    return Math.max(1, totalHP);
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
      },
      sorcerer: {
        1: ['Spellcasting', 'Sorcerous Origin'],
        2: ['Font of Magic'],
        3: ['Metamagic'],
        4: ['Ability Score Improvement'],
        5: ['3rd-level Spells'],
        6: ['Sorcerous Origin Feature'],
        7: ['4th-level Spells'],
        8: ['Ability Score Improvement'],
        9: ['5th-level Spells'],
        10: ['Metamagic']
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

    if (className?.toLowerCase() === 'wizard') {
      if (newLevel > oldLevel) {
        const levelsGained = newLevel - oldLevel;
        return levelsGained * 2; // 2 spells per level
      }
      return 0;
    }

    const progression = spellsKnownProgression[className?.toLowerCase()];
    if (!progression) return 0;

    const oldSpells = progression[oldLevel] || 0;
    const newSpells = progression[newLevel] || 0;
    return Math.max(0, newSpells - oldSpells);
  };

  const handleNext = () => {
    console.log('Handle next - ASI:', levelUpChanges?.abilityScoreImprovements, 'Spells:', levelUpChanges?.spellsKnownIncrease);
    
    if (!levelUpChanges) return;
    
    // Check if we need ASI and haven't selected them yet
    if (!levelUpChanges.isLevelDown && levelUpChanges.abilityScoreImprovements > 0 && Object.keys(abilityImprovements).length === 0) {
      console.log('Showing ASI modal');
      setShowASIModal(true);
      return;
    }
    
    // Check if we need spells and haven't selected them yet
    if (!levelUpChanges.isLevelDown && levelUpChanges.spellsKnownIncrease > 0 && newSpells.length === 0) {
      console.log('Showing spell modal');
      setShowSpellModal(true);
      return;
    }
    
    // Otherwise proceed to confirm
    console.log('Proceeding to confirm');
    handleConfirm();
  };

  const handleASIConfirm = (improvements: { [key: string]: number }) => {
    console.log('ASI confirmed:', improvements);
    setAbilityImprovements(improvements);
    setShowASIModal(false);
    
    // After ASI, check if we still need spells
    if (levelUpChanges?.spellsKnownIncrease > 0) {
      console.log('After ASI, showing spell modal');
      setShowSpellModal(true);
    } else {
      console.log('After ASI, confirming directly');
      // Use setTimeout to allow state to update properly
      setTimeout(() => {
        handleConfirm();
      }, 100);
    }
  };

  const handleSpellConfirm = (selectedSpells: any[]) => {
    console.log('Spells confirmed:', selectedSpells);
    setNewSpells(selectedSpells);
    setShowSpellModal(false);
    
    // After spells, go directly to confirm
    setTimeout(() => {
      handleConfirm();
    }, 100);
  };

  const handleConfirm = () => {
    if (!levelUpChanges) return;

    console.log('Confirming level up with improvements:', abilityImprovements, 'and spells:', newSpells);

    let updatedCharacter;

    if (levelUpChanges.isLevelDown) {
      const newTotalHP = calculateTotalHPAtLevel(newLevel);
      const newProficiencyBonus = Math.ceil(newLevel / 4) + 1;
      
      const resetAbilities = { ...character.abilities };
      
      const allowedASILevels = asiLevels.filter(level => level <= newLevel);
      
      const newSpellSlots = isSpellcaster(character.class_name) 
        ? calculateSpellSlots(newLevel, character.class_name)
        : {};

      // Calculate maximum spells allowed at this level
      const className = character.class_name?.toLowerCase();
      let maxSpellsAtLevel = 0;
      
      if (className === 'wizard') {
        // Wizards start with 6 spells at level 1, then gain 2 per level
        maxSpellsAtLevel = 6 + ((newLevel - 1) * 2);
      } else {
        // Other spellcasters use the spells known progression
        const spellsKnownProgression: { [key: string]: { [key: number]: number } } = {
          bard: { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14 },
          sorcerer: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11 },
          warlock: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 10 }
        };
        
        const progression = spellsKnownProgression[className];
        maxSpellsAtLevel = progression?.[newLevel] || 0;
      }

      const limitedSpells = character.spells ? character.spells.slice(0, maxSpellsAtLevel) : [];
      
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
        spells: limitedSpells
      };
    } else {
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

      const newMaxHP = (character.hit_points?.max || character.maxHP || 0) + levelUpChanges.totalHitPointIncrease;
      const newCurrentHP = (character.hit_points?.current !== undefined ? character.hit_points.current : character.currentHP || 0) + levelUpChanges.totalHitPointIncrease;

      const updatedSpellSlots = { ...character.spellSlots };
      Object.entries(levelUpChanges.spellSlotsIncrease).forEach(([key, increase]) => {
        updatedSpellSlots[key] = (character.spellSlots?.[key] || 0) + (increase as number);
      });

      updatedCharacter = {
        ...character,
        level: newLevel,
        abilities: updatedAbilities,
        hit_points: {
          current: newCurrentHP,
          max: newMaxHP,
          temporary: character.hit_points?.temporary || 0,
          hit_dice_remaining: character.hit_points?.hit_dice_remaining || character.level
        },
        maxHP: newMaxHP,
        currentHP: newCurrentHP,
        proficiencyBonus: Math.ceil(newLevel / 4) + 1,
        spellSlots: updatedSpellSlots,
        spells: [...(character.spells || []), ...newSpells]
      };
    }

    console.log('Final updated character:', updatedCharacter);
    onConfirm(updatedCharacter);
    onClose();
  };

  const canProceed = () => {
    if (!levelUpChanges) return false;
    
    const isLevelDown = levelUpChanges.isLevelDown;
    
    if (isLevelDown) return true;
    
    const needsASI = levelUpChanges.abilityScoreImprovements > 0;
    const needsSpells = levelUpChanges.spellsKnownIncrease > 0;
    const hasSelectedASI = Object.keys(abilityImprovements).length > 0;
    const hasSelectedSpells = newSpells.length > 0;
    
    if (needsASI && !hasSelectedASI) {
      return true;
    }
    
    if (needsSpells && !hasSelectedSpells) {
      return true;
    }
    
    return true;
  };

  const getButtonText = () => {
    if (!levelUpChanges) return 'Continue';
    
    const isLevelDown = levelUpChanges.isLevelDown;
    
    if (isLevelDown) {
      return 'Confirm Level Down';
    }
    
    const needsASI = levelUpChanges.abilityScoreImprovements > 0;
    const needsSpells = levelUpChanges.spellsKnownIncrease > 0;
    const hasSelectedASI = Object.keys(abilityImprovements).length > 0;
    const hasSelectedSpells = newSpells.length > 0;
    
    if (needsASI && !hasSelectedASI) {
      return 'Choose Ability Scores';
    }
    
    if (needsSpells && !hasSelectedSpells) {
      return 'Choose Spells';
    }
    
    return 'Level Up!';
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
                  {Object.keys(abilityImprovements).length > 0 && (
                    <div className="text-xs text-green-600 mt-1">
                      ✓ Ability improvements selected
                    </div>
                  )}
                </div>
              )}

              {!isLevelDown && levelUpChanges.spellsKnownIncrease > 0 && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm font-medium text-purple-800">
                    Learn {levelUpChanges.spellsKnownIncrease} New Spell{levelUpChanges.spellsKnownIncrease > 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    {character.class_name?.toLowerCase() === 'wizard' ? 'Choose new spells for your spellbook' : 'Choose new spells for your spell list'}
                  </div>
                  {newSpells.length > 0 && (
                    <div className="text-xs text-green-600 mt-1">
                      ✓ {newSpells.length} spell{newSpells.length > 1 ? 's' : ''} selected
                    </div>
                  )}
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
                disabled={!canProceed()}
              >
                {getButtonText()}
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
