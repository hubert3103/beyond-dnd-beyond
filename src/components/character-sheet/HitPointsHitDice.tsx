
import { useState } from 'react';
import { ChevronDown, ChevronRight, Dice6 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface HitPointsHitDiceProps {
  character: any;
  setCharacter: (character: any) => void;
}

const HitPointsHitDice = ({ character, setCharacter }: HitPointsHitDiceProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hitDice] = useState({
    total: character.level,
    remaining: Math.floor(character.level * 0.6), // Mock remaining dice
    dieType: 'd8' // For Druids
  });

  const rollHitDie = () => {
    if (hitDice.remaining > 0) {
      // Simulate rolling a hit die + CON modifier
      const roll = Math.floor(Math.random() * 8) + 1;
      const conModifier = Math.floor((character.abilities.constitution.score - 10) / 2);
      const healing = roll + conModifier;
      
      const newHP = Math.min(character.maxHP, character.currentHP + healing);
      setCharacter({ ...character, currentHP: newHP });
      
      console.log(`Rolled ${roll} + ${conModifier} CON = ${healing} healing`);
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
            <span className="text-lg font-semibold">Hit Points & Hit Dice</span>
            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4 space-y-4">
          {/* Hit Points Display */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Current HP</div>
              <div className="text-xl font-bold text-red-600">{character.currentHP}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Max HP</div>
              <div className="text-xl font-bold">{character.maxHP}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Temp HP</div>
              <div className="text-xl font-bold text-blue-600">{character.tempHP}</div>
            </div>
          </div>

          {/* Hit Dice */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Hit Dice</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium">
                    {hitDice.dieType} Hit Dice
                  </div>
                  <div className="text-xs text-gray-600">
                    {hitDice.remaining} / {hitDice.total} remaining
                  </div>
                </div>
                <Button
                  onClick={rollHitDie}
                  disabled={hitDice.remaining === 0}
                  className="bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  <Dice6 className="h-4 w-4 mr-1" />
                  Roll
                </Button>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(hitDice.remaining / hitDice.total) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Death Saves (if HP is 0) */}
          {character.currentHP === 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">Death Saving Throws</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-green-600">Successes</div>
                  <div className="flex space-x-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-4 h-4 border-2 border-green-600 rounded-full" />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-red-600">Failures</div>
                  <div className="flex space-x-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-4 h-4 border-2 border-red-600 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default HitPointsHitDice;
