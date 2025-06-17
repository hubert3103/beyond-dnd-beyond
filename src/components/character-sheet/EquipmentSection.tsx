import { useState } from 'react';
import { ChevronDown, ChevronRight, Package, Sword, Shield, Search, Trash2 } from 'lucide-react';
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
import { useHybridData } from '@/hooks/useHybridData';

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { equipment: apiEquipment, isLoading: equipmentLoading } = useHybridData();
  
  // Get equipment from character's starting equipment and inventory
  const getCharacterEquipment = () => {
    const characterEquipment = [];
    
    console.log('Getting equipment for character:', character.equipment);
    
    // Add starting equipment
    if (character.equipment?.starting_equipment) {
      console.log('Found starting equipment:', character.equipment.starting_equipment);
      character.equipment.starting_equipment.forEach((item: any) => {
        console.log('Processing starting equipment item:', {
          name: item.name,
          weight: item.weight,
          ac: item.ac,
          ac_base: item.ac_base,
          category: item.category,
          type: item.type
        });
        
        characterEquipment.push({
          id: item.name || item.index,
          name: item.name,
          quantity: item.quantity || 1,
          weight: item.weight || 0,
          equipped: item.equipped || false,
          source: 'Starting Equipment',
          category: item.category || item.type || 'adventuring-gear',
          ...item
        });
      });
    }

    // Add inventory items
    if (character.equipment?.inventory) {
      console.log('Found inventory:', character.equipment.inventory);
      character.equipment.inventory.forEach((item: any) => {
        console.log('Processing inventory item:', {
          name: item.name,
          weight: item.weight,
          ac: item.ac,
          ac_base: item.ac_base,
          category: item.category,
          type: item.type
        });
        
        characterEquipment.push({
          id: item.name || item.index,
          name: item.name,
          quantity: item.quantity || 1,
          weight: item.weight || 0,
          equipped: item.equipped || false,
          source: 'Inventory',
          category: item.category || item.type || 'adventuring-gear',
          ...item
        });
      });
    }

    console.log('Final equipment list with detailed info:', characterEquipment);
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
    if (!apiEquipment || equipmentLoading || !searchTerm.trim()) return [];
    
    let filtered = apiEquipment.filter((item: any) => {
      // Filter by category if not 'adventuring-gear' (which includes everything)
      if (newItemType !== 'adventuring-gear') {
        if (newItemType === 'weapon' && item.type !== 'weapon') return false;
        if (newItemType === 'armor' && !item.type.includes('armor') && item.type !== 'shield') return false;
        if (newItemType === 'tool' && !item.name.toLowerCase().includes('tool') && !item.type.includes('tool')) return false;
      }
      
      // Filter by search term
      const searchLower = searchTerm.toLowerCase();
      return item.name.toLowerCase().includes(searchLower) ||
             item.type.toLowerCase().includes(searchLower);
    });
    
    // Limit to first 10 results for better UX
    return filtered.slice(0, 10);
  };

  const suggestions = getEquipmentSuggestions();

  const selectEquipmentItem = (item: any) => {
    console.log('Selecting equipment item:', item);
    setSelectedEquipmentItem(item);
    setSearchTerm(item.name); // Set search term to the item name
    setNewItemName(item.name);
    setNewItemWeight(item.weight?.toString() || '0');
    setNewItemType(item.type === 'weapon' ? 'weapon' : 
                   item.type.includes('armor') || item.type === 'shield' ? 'armor' : 
                   'adventuring-gear');
    setShowSuggestions(false); // Hide suggestions after selection
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setNewItemName(value); // Also update item name
    setShowSuggestions(value.trim().length > 0); // Show suggestions when typing
    if (value.trim().length === 0) {
      setSelectedEquipmentItem(null);
    }
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

  const deleteItem = (itemId: string, source: string) => {
    if (!setCharacter) return;

    const updatedCharacter = { ...character };
    
    // Only allow deletion from inventory (not starting equipment)
    if (source === 'Inventory' && updatedCharacter.equipment?.inventory) {
      updatedCharacter.equipment.inventory = updatedCharacter.equipment.inventory.filter((item: any) => 
        (item.name || item.index) !== itemId
      );
      setCharacter(updatedCharacter);
    }
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
    setShowSuggestions(false);
    setShowAddItemDialog(false);
  };

  const resetForm = () => {
    setNewItemName('');
    setNewItemWeight('');
    setNewItemType('adventuring-gear');
    setSearchTerm('');
    setSelectedEquipmentItem(null);
    setShowSuggestions(false);
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
                    {item.source === 'Inventory' && setCharacter && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteItem(item.id, item.source)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
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

                  <div className="relative">
                    <label className="text-sm font-medium text-gray-700">
                      {equipmentLoading ? 'Loading equipment...' : 'Search & Select Item (Using hybrid data service)'}
                    </label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder={equipmentLoading ? "Loading..." : "Type to search for items or enter custom name..."}
                        className="pl-10"
                        disabled={equipmentLoading}
                        onFocus={() => setShowSuggestions(searchTerm.trim().length > 0)}
                      />
                    </div>
                    
                    {/* Equipment Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-lg z-50">
                        {suggestions.map((item: any, index) => (
                          <button
                            key={`${item.slug}-${index}`}
                            onClick={() => selectEquipmentItem(item)}
                            className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none"
                          >
                            <div className="font-medium text-sm text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-600">
                              {item.type} • {item.weight || 0} lbs
                              {item.rarity && item.rarity !== 'common' && ` • ${item.rarity}`}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {showSuggestions && searchTerm.trim() && suggestions.length === 0 && !equipmentLoading && (
                      <div className="absolute top-full left-0 right-0 mt-1 p-3 text-sm text-gray-500 border border-gray-200 rounded-md bg-white shadow-lg z-50">
                        No items found. You can still add "{searchTerm}" as a custom item.
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Weight (lbs)</label>
                    <Input
                      type="number"
                      value={newItemWeight}
                      onChange={(e) => setNewItemWeight(e.target.value)}
                      placeholder="0"
                      className="mt-1"
                      step="0.1"
                      min="0"
                    />
                  </div>

                  {selectedEquipmentItem && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-900">Selected: {selectedEquipmentItem.name}</div>
                      <div className="text-xs text-blue-700 mt-1">
                        {selectedEquipmentItem.type} • {selectedEquipmentItem.weight || 0} lbs
                        {selectedEquipmentItem.rarity && selectedEquipmentItem.rarity !== 'common' && ` • ${selectedEquipmentItem.rarity}`}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={addNewItem} 
                      className="flex-1" 
                      disabled={!searchTerm.trim()}
                    >
                      Add Item
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={resetForm}
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
