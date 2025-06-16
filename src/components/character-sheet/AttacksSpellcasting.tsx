
import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Sword, Zap } from 'lucide-react';
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
    
    // Add weapon attacks from equipment
    if (character.equipment?.starting_equipment) {
      character.equipment.starting_equipment.forEach((item: any) => {
        if (item.category === 'weapon') {
          const abilityModifier = item.finesse || item.ranged ? 
            Math.floor((character.abilities.dexterity.score - 10) / 2) :
            Math.floor((character.abilities.strength.score - 10) / 2);
          
          attacks.push({
            id: item.name,
            name: item.name,
            type: 'weapon',
            attackBonus: `+${abilityModifier + character.proficiencyBonus}`,
            damage: item.damage || '1d4',
            damageType: item.damage_type || 'bludgeoning',
            uses: null
          });
        }
      });
    }

    // Add cantrips and spells if character is a spellcaster
    if (character.spells && character.spells.length > 0) {
      character.spells.forEach((spell: any) => {
        if (spell.prepared || spell.level === 0) { // Cantrips are always available
          const spellModifier = getSpellcastingModifier();
          attacks.push({
            id: spell.name,
            name: spell.name,
            type: spell.level === 0 ? 'cantrip' : 'spell',
            attackBonus: spell.attack_type === 'ranged' ? `+${spellModifier + character.proficiencyBonus}` : null,
            damage: spell.damage || 'Special',
            damageType: spell.damage_type || 'magical',
            uses: spell.level === 0 ? null : { current: spell.uses_remaining || 0, max: spell.uses_max || 1 }
          });
        }
      });
    }

    return attacks;
  };

  // Get spellcasting ability modifier based on class
  const getSpellcastingModifier = () => {
    const className = character.class_name?.toLowerCase();
    switch (className) {
      case 'wizard':
      case 'artificer':
        return Math.floor((character.abilities.intelligence.score - 10) / 2);
      case 'cleric':
      case 'druid':
      case 'ranger':
        return Math.floor((character.abilities.wisdom.score - 10) / 2);
      case 'bard':
      case 'paladin':
      case 'sorcerer':
      case 'warlock':
        return Math.floor((character.abilities.charisma.score - 10) / 2);
      default:
        return 0;
    }
  };

  const characterAttacks = getCharacterAttacks();

  const getIcon = (type: string) => {
    switch (type) {
      case 'weapon':
        return <Sword className="h-4 w-4" />;
      case 'spell':
      case 'cantrip':
        return <Zap className="h-4 w-4" />;
      default:
        return <Sword className="h-4 w-4" />;
    }
  };

  const getDamageColor = (type: string) => {
    switch (type) {
      case 'healing':
        return 'text-green-600';
      case 'fire':
        return 'text-red-600';
      case 'cold':
        return 'text-blue-600';
      case 'lightning':
        return 'text-yellow-600';
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
            <span className="text-lg font-semibold">Attacks & Spellcasting</span>
            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4 space-y-3">
          {characterAttacks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No attacks or spells available</p>
              <p className="text-sm">Add weapons to your equipment or learn spells to see them here</p>
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
                      {getIcon(attack.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{attack.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {attack.attackBonus && (
                          <span>Attack: {attack.attackBonus}</span>
                        )}
                        <span className={getDamageColor(attack.damageType)}>
                          {attack.damage} {attack.damageType}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {attack.uses && (
                      <div className="text-xs text-gray-600">
                        {attack.uses.current}/{attack.uses.max}
                      </div>
                    )}
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      disabled={attack.uses && attack.uses.current === 0}
                    >
                      {attack.type === 'weapon' ? 'Attack' : 'Cast'}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => console.log('Add new attack/spell')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default AttacksSpellcasting;
