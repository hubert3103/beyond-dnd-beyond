
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

  // Use the values from the character's hit_points object
  const maxHP = character.hit_points?.max || character.maxHP || calculateMaxHP();
  const currentHP = character.hit_points?.current !== undefined ? character.hit_points.current : character.currentHP !== undefined ? character.currentHP : maxHP;
  const tempHP = character.hit_points?.temporary || character.tempHP || 0;

  // Get hit die information from class data with proper class mapping
  const getHitDie = () => {
    console.log('Character class data:', character.class_data);
    console.log('Character class name:', character.class_name);
    
    // Try to get hit die from class data first
    if (character.class_data?.hit_die) {
      console.log('Got hit die from class_data.hit_die:', character.class_data.hit_die);
      return character.class_data.hit_die;
    } else if (character.class_data?.hitDie) {
      console.log('Got hit die from class_data.hitDie:', character.class_data.hitDie);
      return character.class_data.hitDie;
    }
    
    // Fallback to class name mapping with correct hit dice
    if (character.class_name) {
      const classHitDice = {
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
        'sorcerer': 6,
        'wizard': 6  // Fixed: Wizard should have d6 hit die
      };
      
      const className = character.class_name.toLowerCase();
      const hitDie = classHitDice[className] || 8;
      console.log(`Using fallback hit die for ${character.class_name}:`, hitDie);
      return hitDie;
    }
    
    // Default fallback
    console.log('Using default hit die: 8');
    return 8;
  };
  
  const hitDie = getHitDie();
  console.log('Final hit die value:', hitDie);
  
  const hitDiceRemaining = character.hit_points?.hit_dice_remaining !== undefined ? character.hit_points.hit_dice_remaining : character.level;

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
          hit_dice_remaining: hitDiceRemaining - 1
        }
      };
      setCharacter(updatedCharacter);
      
      console.log(`Rolled ${roll} on d${hitDie} + ${conModifier} CON = ${healing} healing`);
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
