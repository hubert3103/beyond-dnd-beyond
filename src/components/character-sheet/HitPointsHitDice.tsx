
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

  // Calculate hit points based on character creation choices
  const calculateMaxHP = () => {
    if (!character.class_data) return 1;
    
    const classData = character.class_data;
    const conModifier = Math.floor((character.abilities.constitution.score - 10) / 2);
    let maxHP = 0;

    // Base HP at level 1
    if (character.hit_point_type === 'fixed') {
      maxHP = classData.hit_die + conModifier;
    } else {
      // For rolled or manual entry, use stored value or calculate average
      maxHP = character.hit_points?.max || Math.floor(classData.hit_die / 2) + 1 + conModifier;
    }

    // Add HP for additional levels (if above level 1)
    for (let level = 2; level <= character.level; level++) {
      if (character.hit_point_type === 'fixed') {
        maxHP += Math.floor(classData.hit_die / 2) + 1 + conModifier;
      } else {
        // For other methods, use stored progression or calculate average
        maxHP += Math.floor(classData.hit_die / 2) + 1 + conModifier;
      }
    }

    return Math.max(1, maxHP);
  };

  // Use the values from the formatted character or calculate them
  const maxHP = character.maxHP || calculateMaxHP();
  const currentHP = character.currentHP !== undefined ? character.currentHP : maxHP;
  const tempHP = character.tempHP || 0;

  const [hitDice] = useState({
    total: character.level,
    remaining: character.hit_points?.hit_dice_remaining || character.level,
    dieType: character.class_data?.hit_die ? `d${character.class_data.hit_die}` : 'd8'
  });

  const rollHitDie = () => {
    if (hitDice.remaining > 0) {
      const dieSize = character.class_data?.hit_die || 8;
      const roll = Math.floor(Math.random() * dieSize) + 1;
      const conModifier = Math.floor((character.abilities.constitution.score - 10) / 2);
      const healing = Math.max(1, roll + conModifier); // Minimum 1 HP
      
      const newHP = Math.min(maxHP, currentHP + healing);
      const updatedCharacter = {
        ...character,
        currentHP: newHP,
        hit_points: {
          ...character.hit_points,
          current: newHP,
          hit_dice_remaining: hitDice.remaining - 1
        }
      };
      setCharacter(updatedCharacter);
      
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
              <div className="text-xl font-bold text-red-600">{currentHP}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Max HP</div>
              <div className="text-xl font-bold">{maxHP}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Temp HP</div>
              <div className="text-xl font-bold text-blue-600">{tempHP}</div>
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
          {currentHP === 0 && (
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
