
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
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen && character && newLevel > character.level) {
      calculateLevelUpChanges();
      setCurrentStep(0);
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
      classFeatures: []
    };

    // Calculate total hit point increase for all levels
    const conModifier = Math.floor((character.abilities.constitution.score - 10) / 2);
    for (let level = character.level + 1; level <= newLevel; level++) {
      if (character.hit_point_type === 'fixed') {
        const hitDie = character.class_data?.hit_die || 8;
        changes.totalHitPointIncrease += Math.floor(hitDie / 2) + 1 + conModifier;
      } else {
        const hitDie = character.class_data?.hit_die || 8;
        changes.totalHitPointIncrease += Math.floor(hitDie / 2) + 1 + conModifier;
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

    setLevelUpChanges(changes);
  };

  const getClassFeatures = (fromLevel: number, toLevel: number) => {
    const className = character.class_name?.toLowerCase();
    const features: any[] = [];

    // Define class features by level (simplified version)
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
    // Same implementation as before
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
    if (levelUpChanges.abilityScoreImprovements > 0 && Object.keys(abilityImprovements).length === 0) {
      setShowASIModal(true);
    } else if (levelUpChanges.spellsKnownIncrease > 0 && newSpells.length === 0) {
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

    // Apply ability score improvements
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

    const updatedCharacter = {
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

    onConfirm(updatedCharacter);
    onClose();
  };

  if (!levelUpChanges) return null;

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
              <div className="text-sm text-gray-600">
                {character.class_name} advancement (+{levelUpChanges.levelsGained} levels)
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Hit Points</span>
                </div>
                <Badge variant="secondary">+{levelUpChanges.totalHitPointIncrease}</Badge>
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

              {levelUpChanges.classFeatures.length > 0 && (
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

              {levelUpChanges.abilityScoreImprovements > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-sm font-medium text-yellow-800">
                    {levelUpChanges.abilityScoreImprovements} Ability Score Improvement{levelUpChanges.abilityScoreImprovements > 1 ? 's' : ''} Available
                  </div>
                  <div className="text-xs text-yellow-600 mt-1">
                    You can increase abilities by a total of {levelUpChanges.abilityScoreImprovements * 2} points
                  </div>
                </div>
              )}

              {levelUpChanges.spellsKnownIncrease > 0 && (
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
              <Button onClick={handleNext} className="flex-1 bg-green-600 hover:bg-green-700">
                {levelUpChanges.abilityScoreImprovements > 0 || levelUpChanges.spellsKnownIncrease > 0 ? 'Continue' : 'Level Up!'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
  );
};

export default LevelUpModal;
