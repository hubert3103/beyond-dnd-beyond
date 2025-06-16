
import { useState } from 'react';
import { ChevronDown, ChevronRight, Zap, Circle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import SpellDetailModal from '../tabs/spells/SpellDetailModal';

interface SpellsSectionProps {
  character: any;
  setCharacter: (character: any) => void;
}

const SpellsSection = ({ character, setCharacter }: SpellsSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [selectedSpellForModal, setSelectedSpellForModal] = useState<any>(null);
  
  // Check if character is a spellcaster
  const isSpellcaster = () => {
    const spellcasterClasses = ['wizard', 'sorcerer', 'warlock', 'bard', 'cleric', 'druid', 'artificer', 'paladin', 'ranger'];
    return spellcasterClasses.includes(character.class_name?.toLowerCase() || '');
  };

  // Check if character needs to prepare spells
  const needsSpellPreparation = () => {
    const preparationClasses = ['wizard', 'cleric', 'druid', 'paladin', 'artificer'];
    return preparationClasses.includes(character.class_name?.toLowerCase() || '');
  };

  // Get spell slots based on class and level
  const getSpellSlots = () => {
    if (!isSpellcaster()) return {};
    
    const className = character.class_name?.toLowerCase();
    const level = character.level;
    
    // Initialize spell slots from character data or calculate default
    const storedSlots = character.spellSlots || {};
    const slots: { [key: number]: { max: number; used: number } } = {};
    
    if (level >= 1) {
      switch (className) {
        case 'wizard':
        case 'sorcerer':
        case 'bard':
        case 'cleric':
        case 'druid':
          if (level >= 1) slots[1] = { max: 2, used: storedSlots[1]?.used || 0 };
          if (level >= 3) slots[2] = { max: 1, used: storedSlots[2]?.used || 0 };
          if (level >= 5) slots[3] = { max: 1, used: storedSlots[3]?.used || 0 };
          if (level >= 7) slots[4] = { max: 1, used: storedSlots[4]?.used || 0 };
          if (level >= 9) slots[5] = { max: 1, used: storedSlots[5]?.used || 0 };
          break;
        case 'warlock':
          const warlockSlots = Math.min(4, Math.ceil(level / 2));
          const warlockLevel = level < 3 ? 1 : level < 5 ? 2 : level < 7 ? 3 : level < 9 ? 4 : 5;
          slots[warlockLevel] = { max: warlockSlots, used: storedSlots[warlockLevel]?.used || 0 };
          break;
        case 'paladin':
        case 'ranger':
          if (level >= 2) slots[1] = { max: 2, used: storedSlots[1]?.used || 0 };
          if (level >= 5) slots[2] = { max: 1, used: storedSlots[2]?.used || 0 };
          break;
      }
    }
    
    return slots;
  };

  // Get character's spells - handle both array format and the new spell objects
  const getCharacterSpells = () => {
    if (!character.spells || !isSpellcaster()) return {};
    
    const spellsByLevel: { [key: number]: any[] } = {};
    
    // Handle array of spell objects
    const spellsArray = Array.isArray(character.spells) ? character.spells : [];
    
    spellsArray.forEach((spell: any) => {
      // Handle both string level and number level
      const level = typeof spell.level === 'string' ? parseInt(spell.level) || 0 : (spell.level || 0);
      if (!spellsByLevel[level]) {
        spellsByLevel[level] = [];
      }
      spellsByLevel[level].push({
        ...spell,
        // Ensure prepared is a boolean
        prepared: spell.prepared === true || spell.prepared === 'true'
      });
    });
    
    return spellsByLevel;
  };

  if (!isSpellcaster()) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="bg-white rounded-lg overflow-hidden">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="text-lg font-semibold">Spells</span>
              {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4">
            <div className="text-center py-8 text-gray-500">
              <p>This character is not a spellcaster</p>
              <p className="text-sm">{character.class_name} does not have spellcasting abilities</p>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  const spellSlots = getSpellSlots();
  const characterSpells = getCharacterSpells();

  const spellLevels = [
    { level: 0, name: 'Cantrips' },
    { level: 1, name: '1st Level' },
    { level: 2, name: '2nd Level' },
    { level: 3, name: '3rd Level' },
    { level: 4, name: '4th Level' },
    { level: 5, name: '5th Level' }
  ].filter(level => level.level === 0 || spellSlots[level.level] || characterSpells[level.level]);

  const castSpell = (spellLevel: number) => {
    if (spellLevel === 0) {
      console.log('Cast cantrip - no spell slot used');
      return;
    }
    
    const slots = spellSlots[spellLevel];
    if (slots && slots.used < slots.max) {
      console.log(`Cast spell using level ${spellLevel} slot`);
      
      // Update spell slots
      const updatedSpellSlots = {
        ...character.spellSlots,
        [spellLevel]: {
          max: slots.max,
          used: slots.used + 1
        }
      };
      
      const updatedCharacter = {
        ...character,
        spellSlots: updatedSpellSlots
      };
      
      setCharacter(updatedCharacter);
    }
  };

  const toggleSpellPreparation = (spellIndex: number, spellLevel: number) => {
    const updatedSpells = [...character.spells];
    const spellsAtLevel = characterSpells[spellLevel];
    
    // Find the spell in the original array
    const spellToUpdate = spellsAtLevel[spellIndex];
    const originalIndex = updatedSpells.findIndex(spell => spell.name === spellToUpdate.name);
    
    if (originalIndex !== -1) {
      updatedSpells[originalIndex] = {
        ...updatedSpells[originalIndex],
        prepared: !updatedSpells[originalIndex].prepared
      };
      
      const updatedCharacter = {
        ...character,
        spells: updatedSpells
      };
      
      setCharacter(updatedCharacter);
      console.log(`${updatedSpells[originalIndex].prepared ? 'Prepared' : 'Unprepared'} spell: ${spellToUpdate.name}`);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-white rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-lg font-semibold">Spells</span>
            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4 space-y-4">
          {spellLevels.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No spells known</p>
              <p className="text-sm">Learn spells to see them here</p>
            </div>
          ) : (
            <>
              {/* Spell Level Tabs */}
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {spellLevels.map((level) => (
                  <Button
                    key={level.level}
                    variant={selectedLevel === level.level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLevel(level.level)}
                    className="whitespace-nowrap"
                  >
                    {level.name}
                    {level.level > 0 && spellSlots[level.level] && (
                      <span className="ml-1 text-xs">
                        ({spellSlots[level.level].max - spellSlots[level.level].used})
                      </span>
                    )}
                  </Button>
                ))}
              </div>

              {/* Spell Slots Display (for leveled spells) */}
              {selectedLevel > 0 && spellSlots[selectedLevel] && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {spellLevels.find(l => l.level === selectedLevel)?.name} Spell Slots
                    </span>
                    <span className="text-sm text-gray-600">
                      {spellSlots[selectedLevel].max - spellSlots[selectedLevel].used} / {spellSlots[selectedLevel].max}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    {Array.from({ length: spellSlots[selectedLevel].max }, (_, i) => (
                      <Circle
                        key={i}
                        className={`h-4 w-4 ${
                          i < spellSlots[selectedLevel].used
                            ? 'fill-gray-400 text-gray-400'
                            : 'fill-blue-600 text-blue-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Spells List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {characterSpells[selectedLevel]?.map((spell, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 ${
                      spell.prepared ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div 
                      className="flex items-center space-x-3 mb-2 cursor-pointer"
                      onClick={() => setSelectedSpellForModal(spell)}
                    >
                      <div className="text-gray-600">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                          <span>{spell.name}</span>
                          {spell.prepared && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Prepared
                            </span>
                          )}
                        </h4>
                        {spell.school && (
                          <p className="text-xs text-gray-500">{spell.school}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {needsSpellPreparation() && selectedLevel > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSpellPreparation(index, selectedLevel);
                          }}
                          className={spell.prepared ? "bg-blue-100 border-blue-300" : ""}
                        >
                          <BookOpen className="h-3 w-3 mr-1" />
                          {spell.prepared ? 'Unprepare' : 'Prepare'}
                        </Button>
                      )}
                      
                      {(selectedLevel === 0 || spell.prepared || !needsSpellPreparation()) && (
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            castSpell(selectedLevel);
                          }}
                          disabled={selectedLevel > 0 && spellSlots[selectedLevel]?.used >= spellSlots[selectedLevel]?.max}
                        >
                          Cast
                        </Button>
                      )}
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-4 text-gray-500">
                    <p>No spells at this level</p>
                  </div>
                )}
              </div>
            </>
          )}
        </CollapsibleContent>
      </div>

      {/* Spell Detail Modal */}
      {selectedSpellForModal && (
        <SpellDetailModal
          spell={selectedSpellForModal}
          onClose={() => setSelectedSpellForModal(null)}
        />
      )}
    </Collapsible>
  );
};

export default SpellsSection;
