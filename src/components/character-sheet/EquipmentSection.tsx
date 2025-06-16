
import { useState } from 'react';
import { ChevronDown, ChevronRight, Package, Sword, Shield, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOpen5eData } from '@/hooks/useOpen5eData';

interface EquipmentSectionProps {
  character: any;
  setCharacter?: (character: any) => void;
}

const EquipmentSection = ({ character, setCharacter }: EquipmentSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemWeight, setNewItemWeight] = useState('');
  const [newItemType, setNewItemType] = useState('adventuring-gear');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipmentItem, setSelectedEquipmentItem] = useState<any>(null);
  
  const { equipment: apiEquipment, isLoading: equipmentLoading } = useOpen5eData();
  
  // Get equipment from character's starting equipment and inventory
  const getCharacterEquipment = () => {
    const characterEquipment = [];
    
    console.log('Getting equipment for character:', character.equipment);
    
    // Add starting equipment
    if (character.equipment?.starting_equipment) {
      console.log('Found starting equipment:', character.equipment.starting_equipment);
      character.equipment.starting_equipment.forEach((item: any) => {
        characterEquipment.push({
          id: item.name || item.index,
          name: item.name,
          quantity: item.quantity || 1,
          weight: item.weight || 0,
          equipped: item.equipped || false,
          source: 'Starting Equipment',
          category: item.category || 'adventuring-gear',
          ...item
        });
      });
    }

    // Add inventory items
    if (character.equipment?.inventory) {
      console.log('Found inventory:', character.equipment.inventory);
      character.equipment.inventory.forEach((item: any) => {
        characterEquipment.push({
          id: item.name || item.index,
          name: item.name,
          quantity: item.quantity || 1,
          weight: item.weight || 0,
          equipped: item.equipped || false,
          source: 'Inventory',
          category: item.category || 'adventuring-gear',
          ...item
        });
      });
    }

    console.log('Final equipment list:', characterEquipment);
    return characterEquipment;
  };

  const equipment = getCharacterEquipment();
  const totalWeight = equipment.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
  
  // Calculate carrying capacity based on Strength score
  const strScore = character.abilities.strength.score;
  const carryingCapacity = strScore * 15; // Base carrying capacity
  const isEncumbered = totalWeight > carryingCapacity;

  // Get filtered equipment suggestions based on category and search term
  const getEquipmentSuggestions = () => {
    if (!apiEquipment || equipmentLoading) return [];
    
    let filtered = apiEquipment.filter((item: any) => {
      // Filter by category if not 'adventuring-gear' (which includes everything)
      if (newItemType !== 'adventuring-gear') {
        if (newItemType === 'weapon' && item.type !== 'weapon') return false;
        if (newItemType === 'armor' && !item.type.includes('armor') && item.type !== 'shield') return false;
        if (newItemType === 'tool' && !item.name.toLowerCase().includes('tool') && !item.type.includes('tool')) return false;
      }
      
      // Filter by search term
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        return item.name.toLowerCase().includes(searchLower) ||
               item.type.toLowerCase().includes(searchLower);
      }
      
      return true;
    });
    
    // Limit to first 10 results for better UX
    return filtered.slice(0, 10);
  };

  const suggestions = getEquipmentSuggestions();

  const selectEquipmentItem = (item: any) => {
    setSelectedEquipmentItem(item);
    setNewItemName(item.name);
    setNewItemWeight(item.weight?.toString() || '0');
    setNewItemType(item.type === 'weapon' ? 'weapon' : 
                   item.type.includes('armor') || item.type === 'shield' ? 'armor' : 
                   'adventuring-gear');
    setSearchTerm('');
  };

  const toggleEquipped = (itemId: string) => {
    if (!setCharacter) return;

    const updatedCharacter = { ...character };
    
    // Find and toggle the item in starting equipment
    if (updatedCharacter.equipment?.starting_equipment) {
      updatedCharacter.equipment.starting_equipment = updatedCharacter.equipment.starting_equipment.map((item: any) => {
        if ((item.name || item.index) === itemId) {
          return { ...item, equipped: !item.equipped };
        }
        return item;
      });
    }

    // Find and toggle the item in inventory
    if (updatedCharacter.equipment?.inventory) {
      updatedCharacter.equipment.inventory = updatedCharacter.equipment.inventory.map((item: any) => {
        if ((item.name || item.index) === itemId) {
          return { ...item, equipped: !item.equipped };
        }
        return item;
      });
    }

    setCharacter(updatedCharacter);
  };

  const addNewItem = () => {
    if (!setCharacter || !newItemName.trim()) return;

    const newItem = {
      name: newItemName,
      index: newItemName.toLowerCase().replace(/\s+/g, '-'),
      category: newItemType,
      weight: parseFloat(newItemWeight) || 0,
      equipped: false,
      quantity: 1,
      // Include additional data from selected equipment item if available
      ...(selectedEquipmentItem && {
        damage: selectedEquipmentItem.damage_dice,
        damage_type: selectedEquipmentItem.damage_type,
        ac: selectedEquipmentItem.ac,
        rarity: selectedEquipmentItem.rarity,
        type: selectedEquipmentItem.type
      })
    };

    const updatedCharacter = { ...character };
    
    if (!updatedCharacter.equipment) {
      updatedCharacter.equipment = { starting_equipment: [], inventory: [] };
    }
    
    if (!updatedCharacter.equipment.inventory) {
      updatedCharacter.equipment.inventory = [];
    }

    updatedCharacter.equipment.inventory = [...updatedCharacter.equipment.inventory, newItem];
    
    setCharacter(updatedCharacter);
    
    // Reset form
    setNewItemName('');
    setNewItemWeight('');
    setNewItemType('adventuring-gear');
    setSearchTerm('');
    setSelectedEquipmentItem(null);
    setShowAddItemDialog(false);
  };

  const getItemIcon = (item: any) => {
    if (item.category === 'weapon') {
      return <Sword className="h-4 w-4" />;
    } else if (item.category === 'armor') {
      return <Shield className="h-4 w-4" />;
    }
    return <Package className="h-4 w-4" />;
  };

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
                      {getItemIcon(item)}
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
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {(item.weight * item.quantity).toFixed(1)} lbs
                      </div>
                    </div>
                    {(item.category === 'weapon' || item.category === 'armor') && setCharacter && (
                      <Button
                        size="sm"
                        variant={item.equipped ? "destructive" : "outline"}
                        onClick={() => toggleEquipped(item.id)}
                      >
                        {item.equipped ? 'Unequip' : 'Equip'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {setCharacter && (
            <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Package className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <Select value={newItemType} onValueChange={setNewItemType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adventuring-gear">Adventuring Gear</SelectItem>
                        <SelectItem value="weapon">Weapon</SelectItem>
                        <SelectItem value="armor">Armor</SelectItem>
                        <SelectItem value="tool">Tool</SelectItem>
                        <SelectItem value="consumable">Consumable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Search Equipment</label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Type to search for items..."
                        className="pl-10"
                      />
                    </div>
                    
                    {/* Equipment Suggestions */}
                    {searchTerm && suggestions.length > 0 && (
                      <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white">
                        {suggestions.map((item: any, index) => (
                          <button
                            key={index}
                            onClick={() => selectEquipmentItem(item)}
                            className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-xs text-gray-600">
                              {item.type} • {item.weight || 0} lbs
                              {item.rarity && ` • ${item.rarity}`}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {searchTerm && suggestions.length === 0 && !equipmentLoading && (
                      <div className="mt-2 p-3 text-sm text-gray-500 border border-gray-200 rounded-md">
                        No items found. You can still add a custom item below.
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Item Name</label>
                    <Input
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Enter or select item name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Weight (lbs)</label>
                    <Input
                      type="number"
                      value={newItemWeight}
                      onChange={(e) => setNewItemWeight(e.target.value)}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button onClick={addNewItem} className="flex-1" disabled={!newItemName.trim()}>
                      Add Item
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowAddItemDialog(false);
                        setNewItemName('');
                        setNewItemWeight('');
                        setNewItemType('adventuring-gear');
                        setSearchTerm('');
                        setSelectedEquipmentItem(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default EquipmentSection;
