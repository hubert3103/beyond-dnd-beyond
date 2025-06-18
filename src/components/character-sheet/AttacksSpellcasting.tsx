
import { useState } from 'react';
import { ChevronDown, ChevronRight, Sword } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface AttacksSpellcastingProps {
  character: any;
}

const AttacksSpellcasting = ({ character }: AttacksSpellcastingProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get attacks from character's equipment and class features
  const getCharacterAttacks = () => {
    const attacks = [];
    
    // Always add unarmed attack
    const strModifier = Math.floor((character.abilities.strength.score - 10) / 2);
    attacks.push({
      id: 'unarmed',
      name: 'Unarmed Strike',
      type: 'weapon',
      attackBonus: `+${strModifier + character.proficiencyBonus}`,
      damage: `1${strModifier >= 0 ? '+' : ''}${strModifier}`,
      damageType: 'bludgeoning',
      uses: null
    });
    
    // Helper function to determine if an item is a weapon
    const isWeapon = (item: any) => {
      // Check multiple possible indicators that this is a weapon
      return item.category === 'weapon' || 
             item.type === 'weapon' ||
             item.damage ||
             item.damage_dice ||
             (item.name && (
               item.name.toLowerCase().includes('sword') ||
               item.name.toLowerCase().includes('axe') ||
               item.name.toLowerCase().includes('bow') ||
               item.name.toLowerCase().includes('crossbow') ||
               item.name.toLowerCase().includes('dagger') ||
               item.name.toLowerCase().includes('mace') ||
               item.name.toLowerCase().includes('hammer') ||
               item.name.toLowerCase().includes('spear') ||
               item.name.toLowerCase().includes('club') ||
               item.name.toLowerCase().includes('staff') ||
               item.name.toLowerCase().includes('javelin')
             ));
    };

    // Helper function to create weapon attack
    const createWeaponAttack = (item: any) => {
      // Determine if weapon uses Dex or Str
      const usesDexterity = item.finesse || 
                           item.ranged || 
                           item.name?.toLowerCase().includes('bow') ||
                           item.name?.toLowerCase().includes('crossbow') ||
                           item.name?.toLowerCase().includes('dagger');
      
      const abilityModifier = usesDexterity ? 
        Math.floor((character.abilities.dexterity.score - 10) / 2) :
        Math.floor((character.abilities.strength.score - 10) / 2);
      
      // Get damage - handle multiple possible API data structures
      let damage = '1d4'; // Default fallback
      let damageType = 'bludgeoning'; // Default fallback
      
      // Check for Open5e API weapon structure
      if (item.damage && typeof item.damage === 'object') {
        if (item.damage.damage_dice) {
          damage = item.damage.damage_dice;
        }
        if (item.damage.damage_type) {
          damageType = item.damage.damage_type;
        }
      } 
      // Check for direct damage_dice property
      else if (item.damage_dice) {
        damage = item.damage_dice;
        damageType = item.damage_type || 'bludgeoning';
      }
      // Check for simple damage property
      else if (item.damage && typeof item.damage === 'string') {
        damage = item.damage;
        damageType = item.damage_type || 'bludgeoning';
      }
      // Check if damage is stored at root level with different naming
      else if (item.damage_die) {
        damage = item.damage_die;
        damageType = item.damage_type || 'bludgeoning';
      }
      
      // Special handling for known weapons by name if damage data is missing
      if (damage === '1d4' && item.name) {
        const weaponName = item.name.toLowerCase();
        if (weaponName.includes('greataxe')) {
          damage = '1d12';
          damageType = 'slashing';
        } else if (weaponName.includes('battleaxe')) {
          damage = '1d8';
          damageType = 'slashing';
        } else if (weaponName.includes('longsword')) {
          damage = '1d8';
          damageType = 'slashing';
        } else if (weaponName.includes('shortsword')) {
          damage = '1d6';
          damageType = 'piercing';
        } else if (weaponName.includes('dagger')) {
          damage = '1d4';
          damageType = 'piercing';
        } else if (weaponName.includes('club') || weaponName.includes('mace')) {
          damage = '1d4';
          damageType = 'bludgeoning';
        } else if (weaponName.includes('warhammer')) {
          damage = '1d8';
          damageType = 'bludgeoning';
        }
      }
      
      // Add ability modifier to damage if it's not already included
      const finalDamage = damage.includes('+') || damage.includes('-') ? 
        damage : 
        `${damage}${abilityModifier >= 0 ? '+' : ''}${abilityModifier}`;
      
      return {
        id: item.index || item.name,
        name: item.name,
        type: 'weapon',
        attackBonus: `+${abilityModifier + character.proficiencyBonus}`,
        damage: finalDamage,
        damageType: damageType,
        uses: null
      };
    };
    
    // Add weapon attacks from equipped starting equipment
    if (character.equipment?.starting_equipment) {
      character.equipment.starting_equipment.forEach((item: any) => {
        if (item.equipped && isWeapon(item)) {
          const weaponAttack = createWeaponAttack(item);
          attacks.push(weaponAttack);
        }
      });
    }

    // Add weapon attacks from equipped inventory items
    if (character.equipment?.inventory) {
      character.equipment.inventory.forEach((item: any) => {
        if (item.equipped && isWeapon(item)) {
          const weaponAttack = createWeaponAttack(item);
          attacks.push(weaponAttack);
        }
      });
    }

    return attacks;
  };

  const characterAttacks = getCharacterAttacks();

  const getDamageColor = (type: string) => {
    switch (type) {
      case 'slashing':
        return 'text-red-600';
      case 'piercing':
        return 'text-blue-600';
      case 'bludgeoning':
        return 'text-gray-700';
      default:
        return 'text-gray-700';
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
            <span className="text-lg font-semibold">Attacks</span>
            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4 space-y-3">
          {characterAttacks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No attacks available</p>
              <p className="text-sm">Equip weapons in your equipment to see them here</p>
            </div>
          ) : (
            characterAttacks.map((attack) => (
              <div
                key={attack.id}
                className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-600">
                      <Sword className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{attack.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Attack: {attack.attackBonus}</span>
                        <span className={getDamageColor(attack.damageType)}>
                          {attack.damage} {attack.damageType}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Attack
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default AttacksSpellcasting;
