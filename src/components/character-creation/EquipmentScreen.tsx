
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface EquipmentScreenProps {
  data: any;
  onUpdate: (updates: any) => void;
}

const EquipmentScreen = ({ data, onUpdate }: EquipmentScreenProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    startingEquipment: false,
    currentInventory: false,
    addItems: false,
    currency: false
  });

  const [equipmentData, setEquipmentData] = useState({
    startingEquipmentPackage: '',
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateEquipmentData = (updates: any) => {
    const newData = { ...equipmentData, ...updates };
    setEquipmentData(newData);
    onUpdate({ equipment: newData });
  };

  const getTotalWeight = () => {
    return equipmentData.inventory.reduce((total, item: any) => total + (item.weight || 0), 0);
  };

  const getTotalGoldValue = () => {
    const { cp, sp, ep, gp, pp } = equipmentData.currency;
    return cp * 0.01 + sp * 0.1 + ep * 0.5 + gp + pp * 10;
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Choose Equipment</h1>
      
      {/* Starting Equipment */}
      <Collapsible open={expandedSections.startingEquipment} onOpenChange={() => toggleSection('startingEquipment')}>
        <div className="border border-gray-200 rounded-lg">
          <CollapsibleTrigger className="w-full p-4 text-left">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gray-900">Starting Equipment</div>
              <div className="text-gray-400">
                {expandedSections.startingEquipment ? '▲' : '▼'}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 border-t border-gray-100">
              <Select 
                value={equipmentData.startingEquipmentPackage} 
                onValueChange={(value) => updateEquipmentData({ startingEquipmentPackage: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose starting equipment package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="explorer">Explorer's Pack</SelectItem>
                  <SelectItem value="dungeoneer">Dungeoneer's Pack</SelectItem>
                  <SelectItem value="entertainer">Entertainer's Pack</SelectItem>
                  <SelectItem value="scholar">Scholar's Pack</SelectItem>
                  <SelectItem value="equipment-a">Equipment Package A</SelectItem>
                  <SelectItem value="equipment-b">Equipment Package B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Current Inventory */}
      <Collapsible open={expandedSections.currentInventory} onOpenChange={() => toggleSection('currentInventory')}>
        <div className="border border-gray-200 rounded-lg">
          <CollapsibleTrigger className="w-full p-4 text-left">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Current Inventory ({equipmentData.inventory.length})</div>
                <div className="text-sm text-gray-600">Total Weight: {getTotalWeight()} lb</div>
              </div>
              <div className="text-gray-400">
                {expandedSections.currentInventory ? '▲' : '▼'}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 border-t border-gray-100">
              {equipmentData.inventory.length === 0 ? (
                <p className="text-gray-500 text-sm mt-2">No items in inventory</p>
              ) : (
                <div className="space-y-2 mt-2">
                  {equipmentData.inventory.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.weight} lb</div>
                      </div>
                      <button
                        onClick={() => {
                          const newInventory = equipmentData.inventory.filter((_, i) => i !== index);
                          updateEquipmentData({ inventory: newInventory });
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Add Items */}
      <Collapsible open={expandedSections.addItems} onOpenChange={() => toggleSection('addItems')}>
        <div className="border border-gray-200 rounded-lg">
          <CollapsibleTrigger className="w-full p-4 text-left">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gray-900">Add Items</div>
              <div className="text-gray-400">
                {expandedSections.addItems ? '▲' : '▼'}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
              <div className="relative mt-2">
                <Input
                  placeholder="Search for items to add..."
                  className="pl-10"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <img 
                    src="/searchIcon.svg" 
                    alt="Search"
                    className="w-4 h-4"
                    style={{ filter: 'invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)' }}
                  />
                </div>
              </div>
              
              {/* Sample items that could be added */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Common Items</div>
                {[
                  { name: 'Backpack', weight: 5, rarity: 'Common' },
                  { name: 'Bedroll', weight: 7, rarity: 'Common' },
                  { name: 'Rope (50 feet)', weight: 10, rarity: 'Common' },
                  { name: 'Rations (1 day)', weight: 2, rarity: 'Common' }
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const newInventory = [...equipmentData.inventory, item];
                      updateEquipmentData({ inventory: newInventory });
                    }}
                    className="w-full flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded mr-3 flex items-center justify-center">
                      <span className="text-gray-600 text-lg">+</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.weight} lb</div>
                    </div>
                    <div className="text-sm text-gray-600">{item.rarity}</div>
                  </button>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Currency */}
      <Collapsible open={expandedSections.currency} onOpenChange={() => toggleSection('currency')}>
        <div className="border border-gray-200 rounded-lg">
          <CollapsibleTrigger className="w-full p-4 text-left">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Currency</div>
                <div className="text-sm text-gray-600">Total in GP: {getTotalGoldValue().toFixed(2)}</div>
              </div>
              <div className="text-gray-400">
                {expandedSections.currency ? '▲' : '▼'}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label className="text-sm text-gray-600">Copper Pieces (CP)</Label>
                  <Input
                    type="number"
                    value={equipmentData.currency.cp}
                    onChange={(e) => updateEquipmentData({
                      currency: { ...equipmentData.currency, cp: parseInt(e.target.value) || 0 }
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Silver Pieces (SP)</Label>
                  <Input
                    type="number"
                    value={equipmentData.currency.sp}
                    onChange={(e) => updateEquipmentData({
                      currency: { ...equipmentData.currency, sp: parseInt(e.target.value) || 0 }
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Electrum Pieces (EP)</Label>
                  <Input
                    type="number"
                    value={equipmentData.currency.ep}
                    onChange={(e) => updateEquipmentData({
                      currency: { ...equipmentData.currency, ep: parseInt(e.target.value) || 0 }
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Gold Pieces (GP)</Label>
                  <Input
                    type="number"
                    value={equipmentData.currency.gp}
                    onChange={(e) => updateEquipmentData({
                      currency: { ...equipmentData.currency, gp: parseInt(e.target.value) || 0 }
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-gray-600">Platinum Pieces (PP)</Label>
                <Input
                  type="number"
                  value={equipmentData.currency.pp}
                  onChange={(e) => updateEquipmentData({
                    currency: { ...equipmentData.currency, pp: parseInt(e.target.value) || 0 }
                  })}
                  className="mt-1"
                />
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};

export default EquipmentScreen;
