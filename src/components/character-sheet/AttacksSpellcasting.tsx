
import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Sword, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const AttacksSpellcasting = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Mock attacks and spells data
  const [attacks] = useState([
    {
      id: 1,
      name: 'Scimitar',
      type: 'weapon',
      attackBonus: '+7',
      damage: '1d6+3',
      damageType: 'slashing',
      uses: null
    },
    {
      id: 2,
      name: 'Longbow',
      type: 'weapon',
      attackBonus: '+7',
      damage: '1d8+3',
      damageType: 'piercing',
      uses: null
    },
    {
      id: 3,
      name: 'Thorn Whip',
      type: 'cantrip',
      attackBonus: '+8',
      damage: '2d6',
      damageType: 'piercing',
      uses: null
    },
    {
      id: 4,
      name: 'Cure Wounds',
      type: 'spell',
      attackBonus: null,
      damage: '1d8+4',
      damageType: 'healing',
      uses: { current: 3, max: 4 }
    }
  ]);

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
          {attacks.map((attack) => (
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
          ))}
          
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
