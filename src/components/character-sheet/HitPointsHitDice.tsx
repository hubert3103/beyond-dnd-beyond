
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

  // Define getHitDie function first to avoid hoisting issues
  const getHitDie = () => {
    // Try to get hit die from class data first
    if (character.class_data?.hit_die) {
      return character.class_data.hit_die;
    } else if (character.class_data?.hitDie) {
      return character.class_data.hitDie;
    }
    
    // Fallback to class name mapping with correct hit dice
    if (character.class_name) {
      const classHitDice: { [key: string]: number } = {
        'barbarian': 12,
        'fighter': 10,
        'paladin': 10,
        'ranger': 10,
        'bard': 8,
        'cleric': 8,
        'druid': 8,
        'monk': 8,
        'rogue': 8,
        'warlock': 8,
        'artificer': 8,
        'sorcerer': 6,  // Sorcerer uses d6
        'wizard': 6     // Wizard uses d6
      };
      
      const className = character.class_name.toLowerCase();
      const hitDie = classHitDice[className] || 8;
      return hitDie;
    }
    
    // Default fallback
    return 8;
  };

  // Calculate correct max HP based on character data
  const calculateCorrectMaxHP = () => {
    if (!character.class_data && !character.class_name) return 1;
    
    const conModifier = Math.floor((character.abilities.constitution?.score - 10) / 2);
    const hitDie = getHitDie();
    let maxHP = 0;

    console.log('=== HP CALCULATION DEBUG ===');
    console.log('Character level:', character.level);
    console.log('Class:', character.class_name);
    console.log('Hit die:', hitDie);
    console.log('CON modifier:', conModifier);
    console.log('Hit point type:', character.hit_point_type);

    // Level 1 HP
    if (character.hit_point_type === 'fixed') {
      maxHP = hitDie + conModifier;
      console.log('Level 1 HP (fixed):', maxHP);
    } else {
      // For rolled or average, use average calculation
      maxHP = Math.floor(hitDie / 2) + 1 + conModifier;
      console.log('Level 1 HP (average):', maxHP);
    }

    // Additional levels
    for (let level = 2; level <= character.level; level++) {
      let levelHP;
      if (character.hit_point_type === 'fixed') {
        levelHP = Math.floor(hitDie / 2) + 1 + conModifier;
      } else {
        levelHP = Math.floor(hitDie / 2) + 1 + conModifier;
      }
      maxHP += levelHP;
      console.log(`Level ${level} HP added:`, levelHP, 'Total:', maxHP);
    }

    const finalHP = Math.max(1, maxHP);
    console.log('Final calculated HP:', finalHP);
    return finalHP;
  };

  // Use calculated HP if current stored HP seems wrong
  const correctMaxHP = calculateCorrectMaxHP();
  const storedMaxHP = character.hit_points?.max || character.maxHP || 0;
  
  // If stored HP is wildly different from calculated HP, use calculated
  const shouldUseCalculated = Math.abs(storedMaxHP - correctMaxHP) > 10;
  const maxHP = shouldUseCalculated ? correctMaxHP : storedMaxHP;
  
  console.log('=== HP VALUES COMPARISON ===');
  console.log('Stored max HP:', storedMaxHP);
  console.log('Calculated max HP:', correctMaxHP);
  console.log('Using HP:', maxHP);
  console.log('Should use calculated:', shouldUseCalculated);

  const currentHP = character.hit_points?.current !== undefined ? 
    Math.min(character.hit_points.current, maxHP) : maxHP;
  const tempHP = character.hit_points?.temporary || character.tempHP || 0;

  const hitDie = getHitDie();
  const hitDiceRemaining = character.hit_points?.hit_dice_remaining !== undefined ? 
    character.hit_points.hit_dice_remaining : character.level;

  const rollHitDie = () => {
    if (hitDiceRemaining > 0) {
      const roll = Math.floor(Math.random() * hitDie) + 1;
      const conModifier = Math.floor((character.abilities.constitution.score - 10) / 2);
      const healing = Math.max(1, roll + conModifier); // Minimum 1 HP
      
      const newHP = Math.min(maxHP, currentHP + healing);
      const updatedCharacter = {
        ...character,
        currentHP: newHP,
        hit_points: {
          ...character.hit_points,
          current: newHP,
          max: maxHP, // Update max HP if we corrected it
          hit_dice_remaining: hitDiceRemaining - 1
        }
      };
      setCharacter(updatedCharacter);
    }
  };

  // If we corrected the HP, update the character automatically
  if (shouldUseCalculated && storedMaxHP !== correctMaxHP) {
    const correctedCharacter = {
      ...character,
      hit_points: {
        ...character.hit_points,
        max: correctMaxHP,
        current: Math.min(character.hit_points?.current || correctMaxHP, correctMaxHP)
      },
      maxHP: correctMaxHP
    };
    
    // Update character with corrected HP
    setTimeout(() => setCharacter(correctedCharacter), 100);
  }

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

          {/* Debug Info (temporary - can be removed) */}
          {shouldUseCalculated && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs">
              <div className="text-yellow-800">
                HP corrected: {storedMaxHP} → {correctMaxHP} (Level {character.level} {character.class_name} with d{hitDie})
              </div>
            </div>
          )}

          {/* Hit Dice */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Hit Dice</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium">
                    d{hitDie} Hit Dice
                  </div>
                  <div className="text-xs text-gray-600">
                    {hitDiceRemaining} / {character.level} remaining
                  </div>
                </div>
                <Button
                  onClick={rollHitDie}
                  disabled={hitDiceRemaining === 0}
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
                  style={{ width: `${(hitDiceRemaining / character.level) * 100}%` }}
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
