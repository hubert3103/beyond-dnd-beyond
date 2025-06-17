
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface PassiveScoresDefensesProps {
  character: any;
  setCharacter: (character: any) => void;
}

const PassiveScoresDefenses = ({ character, setCharacter }: PassiveScoresDefensesProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Function to recalculate AC based on equipped armor
  const calculateArmorClass = () => {
    const dexModifier = character.abilities?.dexterity?.modifier || 0;
    let baseAC = 10 + dexModifier;
    
    console.log('=== AC Calculation Debug ===');
    console.log('Character equipment:', character.equipment);
    console.log('Dex modifier:', dexModifier);
    console.log('Base AC (10 + dex):', baseAC);
    
    // Check for equipped armor in both starting_equipment and inventory
    let equippedArmor = null;
    
    // Check starting equipment first
    if (character.equipment?.starting_equipment) {
      console.log('Checking starting equipment:', character.equipment.starting_equipment);
      equippedArmor = character.equipment.starting_equipment.find((item: any) => {
        console.log('Checking item:', {
          name: item.name,
          category: item.category,
          type: item.type,
          equipped: item.equipped,
          ac: item.ac,
          ac_base: item.ac_base,
          weight: item.weight
        });
        return (item.category === 'armor' || item.type?.includes('armor')) && item.equipped;
      });
      if (equippedArmor) console.log('Found equipped armor in starting equipment:', equippedArmor);
    }
    
    // If no equipped armor found in starting equipment, check inventory
    if (!equippedArmor && character.equipment?.inventory) {
      console.log('Checking inventory:', character.equipment.inventory);
      equippedArmor = character.equipment.inventory.find((item: any) => {
        console.log('Checking inventory item:', {
          name: item.name,
          category: item.category,
          type: item.type,
          equipped: item.equipped,
          ac: item.ac,
          ac_base: item.ac_base,
          weight: item.weight
        });
        return (item.category === 'armor' || item.type?.includes('armor')) && item.equipped;
      });
      if (equippedArmor) console.log('Found equipped armor in inventory:', equippedArmor);
    }
    
    console.log('Final equipped armor found:', equippedArmor);
    
    if (equippedArmor) {
      // Check for AC value in multiple possible properties
      const armorAC = equippedArmor.ac || equippedArmor.ac_base;
      console.log('Armor AC value:', armorAC);
      console.log('Armor dex_bonus:', equippedArmor.dex_bonus);
      console.log('Armor max_dex_bonus:', equippedArmor.max_dex_bonus);
      
      if (armorAC && armorAC > 0) {
        if (equippedArmor.dex_bonus !== false) {
          const maxDexBonus = equippedArmor.max_dex_bonus || 999;
          baseAC = armorAC + Math.min(dexModifier, maxDexBonus);
          console.log('AC with dex bonus:', baseAC);
        } else {
          baseAC = armorAC;
          console.log('AC without dex bonus:', baseAC);
        }
      } else {
        console.log('No valid AC value found on armor item');
      }
    } else {
      console.log('No equipped armor found');
    }
    
    console.log('Final calculated AC:', baseAC);
    console.log('=== End AC Calculation ===');
    
    return baseAC;
  };

  // Update AC when equipment changes
  useEffect(() => {
    console.log('PassiveScoresDefenses useEffect triggered - equipment changed');
    const newAC = calculateArmorClass();
    if (newAC !== character.armorClass) {
      console.log('Updating AC from', character.armorClass, 'to', newAC);
      setCharacter({ ...character, armorClass: newAC });
    } else {
      console.log('AC unchanged, staying at:', character.armorClass);
    }
  }, [character.equipment]);

  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  const getPassivePerception = () => {
    if (!character?.abilities?.wisdom) return 10;
    const wisModifier = getModifier(character.abilities.wisdom.score || 10);
    const proficiencyBonus = character.proficiencyBonus || 2; // Assuming proficient in Perception
    return 10 + wisModifier + proficiencyBonus;
  };

  const getPassiveInvestigation = () => {
    if (!character?.abilities?.intelligence) return 10;
    const intModifier = getModifier(character.abilities.intelligence.score || 10);
    return 10 + intModifier;
  };

  const handleArmorClassChange = (value: string) => {
    setCharacter({ ...character, armorClass: parseInt(value) || 0 });
  };

  const handleSpeedChange = (value: string) => {
    setCharacter({ ...character, speed: parseInt(value) || 30 });
  };

  // Safety check for character data
  if (!character) {
    return (
      <div className="bg-white rounded-lg p-4">
        <p className="text-gray-500">Loading character data...</p>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-white rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-lg font-semibold">Passive Scores & Defenses</span>
            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4 space-y-4">
          {/* Passive Scores Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Passive Perception</div>
              <div className="text-lg font-bold">{getPassivePerception()}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Passive Investigation</div>
              <div className="text-lg font-bold">{getPassiveInvestigation()}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Proficiency Bonus</div>
              <div className="text-lg font-bold">+{character.proficiencyBonus || 2}</div>
            </div>
          </div>

          {/* Defense Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-600">Armor Class</label>
              <Input
                type="number"
                value={character.armorClass || 10}
                onChange={(e) => handleArmorClassChange(e.target.value)}
                className="text-center font-bold"
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Initiative</div>
              <div className="text-lg font-bold">
                {(character.initiative || 0) >= 0 ? '+' : ''}{character.initiative || 0}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600">Speed</label>
              <Input
                type="number"
                value={character.speed || 30}
                onChange={(e) => handleSpeedChange(e.target.value)}
                className="text-center font-bold"
              />
              <div className="text-xs text-gray-500 text-center">ft</div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default PassiveScoresDefenses;
