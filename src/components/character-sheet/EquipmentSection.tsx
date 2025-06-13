
import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const EquipmentSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Mock equipment data
  const [equipment] = useState([
    { id: 1, name: 'Leather Armor', quantity: 1, weight: 10, equipped: true },
    { id: 2, name: 'Scimitar', quantity: 1, weight: 3, equipped: true },
    { id: 3, name: 'Longbow', quantity: 1, weight: 2, equipped: true },
    { id: 4, name: 'Arrows', quantity: 60, weight: 3, equipped: false },
    { id: 5, name: 'Explorer\'s Pack', quantity: 1, weight: 10, equipped: false },
    { id: 6, name: 'Thieves\' Tools', quantity: 1, weight: 1, equipped: false },
    { id: 7, name: 'Gold Pieces', quantity: 150, weight: 0, equipped: false },
    { id: 8, name: 'Healing Potion', quantity: 3, weight: 1.5, equipped: false }
  ]);

  const totalWeight = equipment.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
  const carryingCapacity = 180; // Example for STR 12
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
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {equipment.map((item) => (
              <div
                key={item.id}
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
                      Qty: {item.quantity} • Weight: {item.weight} lbs each
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
