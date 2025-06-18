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
import { useHybridData } from '@/hooks/useHybridData';

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
  const { spells, isLoading } = useHybridData();

  const spellsToLearn = getSpellsToLearn();

  function getSpellsToLearn() {
    const className = character.class_name?.toLowerCase();
    const currentLevel = character.level;
    
    // Calculate spells known based on class and level
    const spellsKnownProgression: { [key: string]: { [key: number]: number } } = {
      bard: { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14 },
      sorcerer: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11 },
      warlock: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 10 },
      wizard: { 1: 6, 2: 8, 3: 10, 4: 12, 5: 14, 6: 16, 7: 18, 8: 20, 9: 22, 10: 24 }
    };

    if (className === 'wizard') {
      if (newLevel > currentLevel) {
        const levelsGained = newLevel - currentLevel;
        const spellsToLearn = levelsGained * 2;
        return spellsToLearn;
      }
      return 0;
    }

    if (spellsKnownProgression[className]) {
      const currentLevelSpells = spellsKnownProgression[className][currentLevel] || 0;
      const newLevelSpells = spellsKnownProgression[className][newLevel] || 0;
      const spellsToLearn = newLevelSpells - currentLevelSpells;
      
      return Math.max(0, spellsToLearn);
    }

    return 0;
  }

  useEffect(() => {
    if (isOpen && !isLoading && spells && spells.length > 0) {
      const className = character.class_name?.toLowerCase();
      
      console.log('Filtering spells for level up modal:', {
        className,
        currentLevel: character.level,
        newLevel,
        totalSpells: spells.length
      });
      
      // Enhanced spell lists for each class with more spells including higher levels
      const getSpellsForClass = (className: string) => {
        const basicSpellLists: { [key: string]: string[] } = {
          sorcerer: [
            // Cantrips
            'acid splash', 'chill touch', 'dancing lights', 'fire bolt', 'light', 'mage hand', 
            'minor illusion', 'poison spray', 'prestidigitation', 'ray of frost', 'shocking grasp',
            // 1st level
            'burning hands', 'charm person', 'comprehend languages', 'detect magic', 
            'disguise self', 'expeditious retreat', 'false life', 'feather fall', 'fog cloud',
            'jump', 'mage armor', 'magic missile', 'shield', 'silent image', 'sleep', 'thunderwave',
            // 2nd level spells for sorcerer
            'alter self', 'blindness/deafness', 'blur', 'cloud of daggers', 'crown of madness',
            'darkness', 'darkvision', 'detect thoughts', 'enhance ability', 'enlarge/reduce',
            'gust of wind', 'hold person', 'invisibility', 'knock', 'levitate', 'mirror image',
            'misty step', 'scorching ray', 'see invisibility', 'shatter', 'spider climb',
            'suggestion', 'web',
            // 3rd level spells for sorcerer
            'counterspell', 'daylight', 'dispel magic', 'fireball', 'fly', 'gaseous form',
            'haste', 'hypnotic pattern', 'lightning bolt', 'major image', 'protection from energy',
            'sleet storm', 'slow', 'tongues', 'water breathing',
            // 4th level spells for sorcerer
            'confusion', 'dimension door', 'greater invisibility', 'ice storm', 'polymorph',
            'stoneskin', 'wall of fire'
          ],
          wizard: [
            // Cantrips
            'acid splash', 'chill touch', 'dancing lights', 'fire bolt', 'light', 'mage hand',
            'minor illusion', 'poison spray', 'prestidigitation', 'ray of frost', 'shocking grasp',
            // 1st level
            'burning hands', 'charm person', 'comprehend languages', 'detect magic',
            'disguise self', 'expeditious retreat', 'false life', 'feather fall', 'find familiar',
            'fog cloud', 'grease', 'identify', 'jump', 'longstrider', 'mage armor', 'magic missile',
            'protection from evil and good', 'shield', 'silent image', 'sleep', 'thunderwave', 'unseen servant',
            // 2nd level spells for wizard
            'alter self', 'arcane lock', 'blindness/deafness', 'blur', 'cloud of daggers',
            'continual flame', 'darkness', 'darkvision', 'detect thoughts', 'enlarge/reduce',
            'flaming sphere', 'gentle repose', 'gust of wind', 'hold person', 'invisibility',
            'knock', 'levitate', 'locate object', 'magic mouth', 'magic weapon', 'melf\'s acid arrow',
            'mirror image', 'misty step', 'nystul\'s magic aura', 'ray of enfeeblement', 'rope trick',
            'scorching ray', 'see invisibility', 'shatter', 'spider climb', 'suggestion', 'web',
            // 3rd level spells for wizard
            'animate dead', 'bestow curse', 'blink', 'clairvoyance', 'counterspell', 'dispel magic',
            'fireball', 'fly', 'gaseous form', 'haste', 'hold person', 'hypnotic pattern',
            'lightning bolt', 'magic circle', 'major image', 'nondetection', 'phantom steed',
            'protection from energy', 'remove curse', 'sending', 'sleet storm', 'slow',
            'stinking cloud', 'tongues', 'vampiric touch', 'water breathing',
            // 4th level spells for wizard
            'arcane eye', 'banishment', 'black tentacles', 'blight', 'confusion', 'conjure minor elementals',
            'control water', 'dimension door', 'fabricate', 'fire shield', 'greater invisibility',
            'hallucinatory terrain', 'ice storm', 'locate creature', 'phantasmal killer',
            'polymorph', 'private sanctum', 'resilient sphere', 'secret chest', 'stone shape',
            'stoneskin', 'wall of fire'
          ],
          warlock: [
            // Cantrips
            'chill touch', 'mage hand', 'minor illusion', 'poison spray', 'prestidigitation',
            // 1st level
            'charm person', 'comprehend languages', 'expeditious retreat', 'protection from evil and good', 'unseen servant',
            // 2nd level spells for warlock
            'cloud of daggers', 'crown of madness', 'darkness', 'enthrall', 'hold person',
            'invisibility', 'mirror image', 'misty step', 'ray of enfeeblement', 'shatter',
            'spider climb', 'suggestion',
            // 3rd level spells for warlock
            'counterspell', 'dispel magic', 'fear', 'fly', 'gaseous form', 'hypnotic pattern',
            'magic circle', 'major image', 'remove curse', 'tongues', 'vampiric touch',
            // 4th level spells for warlock
            'banishment', 'blight', 'confusion', 'dimension door', 'hallucinatory terrain'
          ],
          bard: [
            // Cantrips
            'dancing lights', 'light', 'mage hand', 'minor illusion', 'prestidigitation',
            // 1st level
            'charm person', 'comprehend languages', 'detect magic', 'disguise self', 'feather fall',
            'identify', 'longstrider', 'silent image', 'sleep', 'thunderwave', 'unseen servant',
            // 2nd level spells for bard
            'animal messenger', 'blindness/deafness', 'calm emotions', 'cloud of daggers',
            'crown of madness', 'detect thoughts', 'enhance ability', 'enthrall', 'heat metal',
            'hold person', 'invisibility', 'knock', 'lesser restoration', 'locate animals or plants',
            'locate object', 'magic mouth', 'see invisibility', 'shatter', 'silence',
            'suggestion', 'zone of truth',
            // 3rd level spells for bard
            'bestow curse', 'clairvoyance', 'counterspell', 'dispel magic', 'fear', 'glyph of warding',
            'hypnotic pattern', 'leomund\'s tiny hut', 'major image', 'nondetection', 'plant growth',
            'sending', 'speak with dead', 'speak with plants', 'stinking cloud', 'tongues',
            // 4th level spells for bard
            'confusion', 'dimension door', 'freedom of movement', 'greater invisibility', 'hallucinatory terrain',
            'locate creature', 'polymorph'
          ]
        };

        return basicSpellLists[className] || [];
      };

      // Filter spells available to this class
      let classSpells = spells.filter((spell: any) => {
        // First check if the spell has proper class data from API
        if (spell.classes && Array.isArray(spell.classes)) {
          const spellClasses = spell.classes.map((c: any) => 
            typeof c === 'string' ? c.toLowerCase() : c.name?.toLowerCase()
          );
          
          const hasDirectMatch = spellClasses.some((spellClass: string) => {
            return spellClass === className || 
                   spellClass.includes(className) ||
                   className.includes(spellClass);
          });
          
          if (hasDirectMatch) return true;
        }

        // Fallback to our hardcoded spell lists if API data is incomplete
        const classSpellList = getSpellsForClass(className);
        return classSpellList.includes(spell.name.toLowerCase());
      });

      // Filter out spells already known
      const knownSpellNames = (character.spells || []).map((spell: any) => spell.name.toLowerCase());
      const unknownSpells = classSpells.filter((spell: any) => 
        !knownSpellNames.includes(spell.name.toLowerCase())
      );

      // Get spells of appropriate level - FIXED: Use correct max spell level calculation
      const maxSpellLevel = getMaxSpellLevel(newLevel, className);
      console.log('Max spell level for', className, 'at level', newLevel, ':', maxSpellLevel);
      
      const levelAppropriateSpells = unknownSpells.filter((spell: any) => {
        const spellLevel = parseInt(spell.level) || 0;
        const isAppropriate = spellLevel <= maxSpellLevel;
        
        if (spellLevel >= 3) {
          console.log('Higher level spell check:', {
            spellName: spell.name,
            spellLevel,
            maxSpellLevel,
            isAppropriate
          });
        }
        
        return isAppropriate;
      });
      
      console.log('Filtered spells:', {
        classSpells: classSpells.length,
        unknownSpells: unknownSpells.length,
        levelAppropriate: levelAppropriateSpells.length,
        level3Spells: levelAppropriateSpells.filter(s => parseInt(s.level) === 3).length,
        level4Spells: levelAppropriateSpells.filter(s => parseInt(s.level) === 4).length
      });
      
      setAvailableSpells(levelAppropriateSpells);
    } else if (isOpen && !isLoading && (!spells || spells.length === 0)) {
      setAvailableSpells([]);
    }
  }, [isOpen, spells, isLoading, character, newLevel]);

  const getMaxSpellLevel = (characterLevel: number, className: string) => {
    console.log('Getting max spell level for:', { characterLevel, className });
    
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
    // CORRECTED: Use proper D&D 5e spell slot progression
    if (characterLevel < 3) return 1;
    if (characterLevel < 5) return 2;
    if (characterLevel < 7) return 3;
    if (characterLevel < 9) return 4;
    return 5;
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
          </div>

          <Separator />

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <p>Loading spells...</p>
              </div>
            ) : availableSpells.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No spells available to learn at your level</p>
                <p className="text-xs mt-2">
                  {spells?.length ? `${spells.length} total spells loaded` : 'No spells loaded from data source'}
                </p>
                <p className="text-xs mt-1">
                  Max spell level for level {newLevel}: {getMaxSpellLevel(newLevel, character.class_name?.toLowerCase())}
                </p>
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
                          {spell.desc || spell.description}
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
