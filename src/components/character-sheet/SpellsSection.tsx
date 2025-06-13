
import { useState } from 'react';
import { ChevronDown, ChevronRight, Zap, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const SpellsSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(0);
  
  // Mock spell data
  const [spellSlots] = useState({
    0: { max: 4, used: 0 }, // Cantrips
    1: { max: 4, used: 1 },
    2: { max: 3, used: 2 },
    3: { max: 3, used: 0 },
    4: { max: 3, used: 1 },
    5: { max: 1, used: 0 }
  });

  const [spells] = useState({
    0: [ // Cantrips
      { name: 'Druidcraft', prepared: true },
      { name: 'Thorn Whip', prepared: true },
      { name: 'Guidance', prepared: true },
      { name: 'Mending', prepared: true }
    ],
    1: [
      { name: 'Cure Wounds', prepared: true },
      { name: 'Entangle', prepared: true },
      { name: 'Faerie Fire', prepared: true },
      { name: 'Goodberry', prepared: false }
    ],
    2: [
      { name: 'Heat Metal', prepared: true },
      { name: 'Pass without Trace', prepared: true },
      { name: 'Barkskin', prepared: false }
    ],
    3: [
      { name: 'Call Lightning', prepared: true },
      { name: 'Conjure Animals', prepared: true },
      { name: 'Dispel Magic', prepared: false }
    ],
    4: [
      { name: 'Wall of Fire', prepared: true },
      { name: 'Ice Storm', prepared: false }
    ],
    5: [
      { name: 'Tree Stride', prepared: true }
    ]
  });

  const spellLevels = [
    { level: 0, name: 'Cantrips' },
    { level: 1, name: '1st Level' },
    { level: 2, name: '2nd Level' },
    { level: 3, name: '3rd Level' },
    { level: 4, name: '4th Level' },
    { level: 5, name: '5th Level' }
  ];

  const castSpell = (spellLevel: number) => {
    if (spellLevel === 0) return; // Cantrips don't use slots
    
    const slots = spellSlots[spellLevel as keyof typeof spellSlots];
    if (slots && slots.used < slots.max) {
      console.log(`Cast spell using level ${spellLevel} slot`);
      // In real implementation, would update spell slots
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
                {level.level > 0 && spellSlots[level.level as keyof typeof spellSlots] && (
                  <span className="ml-1 text-xs">
                    ({spellSlots[level.level as keyof typeof spellSlots].max - spellSlots[level.level as keyof typeof spellSlots].used})
                  </span>
                )}
              </Button>
            ))}
          </div>

          {/* Spell Slots Display (for leveled spells) */}
          {selectedLevel > 0 && spellSlots[selectedLevel as keyof typeof spellSlots] && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {spellLevels.find(l => l.level === selectedLevel)?.name} Spell Slots
                </span>
                <span className="text-sm text-gray-600">
                  {spellSlots[selectedLevel as keyof typeof spellSlots].max - spellSlots[selectedLevel as keyof typeof spellSlots].used} / {spellSlots[selectedLevel as keyof typeof spellSlots].max}
                </span>
              </div>
              <div className="flex space-x-1">
                {Array.from({ length: spellSlots[selectedLevel as keyof typeof spellSlots].max }, (_, i) => (
                  <Circle
                    key={i}
                    className={`h-4 w-4 ${
                      i < spellSlots[selectedLevel as keyof typeof spellSlots].used
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
            {spells[selectedLevel as keyof typeof spells]?.map((spell, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 flex items-center justify-between ${
                  spell.prepared ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                } transition-colors`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-gray-600">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                      <span>{spell.name}</span>
                      {spell.prepared && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Prepared
                        </span>
                      )}
                    </h4>
                  </div>
                </div>
                
                {spell.prepared && (
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => castSpell(selectedLevel)}
                    disabled={selectedLevel > 0 && spellSlots[selectedLevel as keyof typeof spellSlots]?.used >= spellSlots[selectedLevel as keyof typeof spellSlots]?.max}
                  >
                    Cast
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default SpellsSection;
