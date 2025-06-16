
import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface EquipmentSectionProps {
  character: any;
}

const EquipmentSection = ({ character }: EquipmentSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get equipment from character's starting equipment and inventory
  const getCharacterEquipment = () => {
    const equipment = [];
    
    // Add starting equipment
    if (character.equipment?.starting_equipment) {
      character.equipment.starting_equipment.forEach((item: any) => {
        equipment.push({
          id: item.name || item.index,
          name: item.name,
          quantity: item.quantity || 1,
          weight: item.weight || 0,
          equipped: item.equipped || false,
          source: 'Starting Equipment'
        });
      });
    }

    // Add inventory items
    if (character.equipment?.inventory) {
      character.equipment.inventory.forEach((item: any) => {
        equipment.push({
          id: item.name || item.index,
          name: item.name,
          quantity: item.quantity || 1,
          weight: item.weight || 0,
          equipped: item.equipped || false,
          source: 'Inventory'
        });
      });
    }

    return equipment;
  };

  const equipment = getCharacterEquipment();
  const totalWeight = equipment.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
  
  // Calculate carrying capacity based on Strength score
  const strScore = character.abilities.strength.score;
  const carryingCapacity = strScore * 15; // Base carrying capacity
  const isEncumbered = totalWeight > carryingCapacity;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-white rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold">Equipment</span>
              <span className={`text-sm ${isEncumbered ? 'text-red-600' : 'text-gray-600'}`}>
                ({totalWeight} / {carryingCapacity} lbs)
              </span>
            </div>
            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4 space-y-3">
          {/* Weight Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Carrying Capacity</span>
              <span>{totalWeight} / {carryingCapacity} lbs</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isEncumbered ? 'bg-red-600' : 'bg-green-600'
                }`}
                style={{ width: `${Math.min((totalWeight / carryingCapacity) * 100, 100)}%` }}
              />
            </div>
            {isEncumbered && (
              <div className="text-xs text-red-600">⚠️ Encumbered! Movement speed reduced.</div>
            )}
          </div>

          {/* Equipment List */}
          {equipment.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No equipment found</p>
              <p className="text-sm">Equipment from character creation will appear here</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {equipment.map((item) => (
                <div
                  key={`${item.id}-${item.source}`}
                  className={`border rounded-lg p-3 flex items-center justify-between ${
                    item.equipped ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  } transition-colors`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-600">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                        <span>{item.name}</span>
                        {item.equipped && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Equipped
                          </span>
                        )}
                      </h4>
                      <div className="text-sm text-gray-600">
                        Qty: {item.quantity} • Weight: {item.weight} lbs each • {item.source}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {(item.weight * item.quantity).toFixed(1)} lbs
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => console.log('Add new item')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default EquipmentSection;
