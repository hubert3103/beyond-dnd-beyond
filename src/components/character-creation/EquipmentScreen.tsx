import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useOpen5eData } from '@/hooks/useOpen5eData';

interface EquipmentScreenProps {
  data: any;
  onUpdate: (updates: any) => void;
}

const EquipmentScreen = ({ data, onUpdate }: EquipmentScreenProps) => {
  const { equipment, isLoading } = useOpen5eData();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    weapons: true,
    armor: true,
    startingEquipment: false,
    currentInventory: false,
    addItems: false,
    currency: false
  });

  const [equipmentData, setEquipmentData] = useState({
    selectedWeapons: [],
    selectedArmor: [],
    startingEquipmentPackage: '',
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }
  });

  // Get character proficiencies from species and class
  const getCharacterProficiencies = () => {
    const proficiencies = new Set<string>();
    
    console.log('Getting proficiencies for:', { species: data.species?.name, class: data.class?.name });
    
    // Add species proficiencies
    if (data.species?.proficiencies) {
      const speciesProficiencies = data.species.proficiencies.toLowerCase();
      console.log('Species proficiencies:', speciesProficiencies);
      
      // Check for weapon proficiencies
      if (speciesProficiencies.includes('simple weapon') || speciesProficiencies.includes('simple-weapon')) {
        proficiencies.add('simple');
      }
      if (speciesProficiencies.includes('martial weapon') || speciesProficiencies.includes('martial-weapon')) {
        proficiencies.add('martial');
      }
      
      // Check for armor proficiencies
      if (speciesProficiencies.includes('light armor') || speciesProficiencies.includes('light-armor')) {
        proficiencies.add('light-armor');
      }
      if (speciesProficiencies.includes('medium armor') || speciesProficiencies.includes('medium-armor')) {
        proficiencies.add('medium-armor');
      }
      if (speciesProficiencies.includes('heavy armor') || speciesProficiencies.includes('heavy-armor')) {
        proficiencies.add('heavy-armor');
      }
      if (speciesProficiencies.includes('shield')) {
        proficiencies.add('shield');
      }
      
      // Add specific weapon proficiencies (common racial weapons)
      const specificWeapons = ['longsword', 'shortbow', 'longbow', 'rapier', 'shortsword', 'scimitar', 'handaxe', 'light hammer', 'javelin'];
      specificWeapons.forEach(weapon => {
        if (speciesProficiencies.includes(weapon)) {
          proficiencies.add(weapon);
        }
      });
    }
    
    // Add class proficiencies - Fighter gets extensive proficiencies
    if (data.class?.name?.toLowerCase() === 'fighter') {
      proficiencies.add('simple');
      proficiencies.add('martial');
      proficiencies.add('light-armor');
      proficiencies.add('medium-armor');
      proficiencies.add('heavy-armor');
      proficiencies.add('shield');
    } else if (data.class?.prof_weapons) {
      const classProficiencies = data.class.prof_weapons.toLowerCase();
      console.log('Class weapon proficiencies:', classProficiencies);
      
      if (classProficiencies.includes('simple weapon') || classProficiencies.includes('simple-weapon')) {
        proficiencies.add('simple');
      }
      if (classProficiencies.includes('martial weapon') || classProficiencies.includes('martial-weapon')) {
        proficiencies.add('martial');
      }
    }
    
    if (data.class?.prof_armor) {
      const armorProficiencies = data.class.prof_armor.toLowerCase();
      console.log('Class armor proficiencies:', armorProficiencies);
      
      if (armorProficiencies.includes('light armor') || armorProficiencies.includes('light-armor')) {
        proficiencies.add('light-armor');
      }
      if (armorProficiencies.includes('medium armor') || armorProficiencies.includes('medium-armor')) {
        proficiencies.add('medium-armor');
      }
      if (armorProficiencies.includes('heavy armor') || armorProficiencies.includes('heavy-armor')) {
        proficiencies.add('heavy-armor');
      }
      if (armorProficiencies.includes('shield')) {
        proficiencies.add('shield');
      }
    }
    
    console.log('Final character proficiencies:', Array.from(proficiencies));
    return proficiencies;
  };

  // Filter weapons based on proficiencies
  const availableWeapons = useMemo(() => {
    if (!equipment.length) return [];
    
    const proficiencies = getCharacterProficiencies();
    
    // Simple weapons list
    const simpleWeapons = [
      'club', 'dagger', 'dart', 'javelin', 'mace', 'quarterstaff', 'sickle', 'spear', 
      'light-crossbow', 'shortbow', 'sling', 'greatclub', 'handaxe', 'light-hammer'
    ];
    
    // Martial weapons list  
    const martialWeapons = [
      'battleaxe', 'flail', 'glaive', 'greataxe', 'greatsword', 'halberd', 'lance', 
      'longsword', 'maul', 'morningstar', 'pike', 'rapier', 'scimitar', 'shortsword', 
      'trident', 'war-pick', 'warhammer', 'whip', 'blowgun', 'hand-crossbow', 
      'heavy-crossbow', 'longbow', 'net'
    ];
    
    const weapons = equipment.filter(item => item.type === 'weapon');
    console.log('All weapons found:', weapons.length);
    
    const availableWeapons = weapons.filter(weapon => {
      const weaponSlug = weapon.slug.toLowerCase();
      
      // Check if proficient with this specific weapon
      if (proficiencies.has(weaponSlug)) return true;
      
      // Check if proficient with simple weapons and this is a simple weapon
      if (proficiencies.has('simple')) {
        const isSimple = simpleWeapons.some(simpleWeapon => 
          weaponSlug.includes(simpleWeapon) || simpleWeapon.includes(weaponSlug)
        );
        if (isSimple) return true;
      }
      
      // Check if proficient with martial weapons and this is a martial weapon
      if (proficiencies.has('martial')) {
        const isMartial = martialWeapons.some(martialWeapon => 
          weaponSlug.includes(martialWeapon) || martialWeapon.includes(weaponSlug)
        );
        if (isMartial) return true;
      }
      
      return false;
    });
    
    console.log('Available weapons after filtering:', availableWeapons.length);
    return availableWeapons;
  }, [equipment, data.species, data.class]);

  // Filter armor based on proficiencies
  const availableArmor = useMemo(() => {
    if (!equipment.length) return [];
    
    const proficiencies = getCharacterProficiencies();
    
    const armor = equipment.filter(item => 
      item.type.includes('armor') || item.type === 'shield' || item.name.toLowerCase().includes('armor') || item.name.toLowerCase().includes('shield')
    );
    console.log('All armor found:', armor.length);
    
    const availableArmor = armor.filter(armorItem => {
      const itemName = armorItem.name.toLowerCase();
      const itemType = armorItem.type.toLowerCase();
      
      // Check for shield
      if (itemName.includes('shield') && proficiencies.has('shield')) return true;
      
      // Check armor types
      if ((itemType.includes('light') || itemName.includes('leather') || itemName.includes('padded') || itemName.includes('studded')) && proficiencies.has('light-armor')) return true;
      if ((itemType.includes('medium') || itemName.includes('hide') || itemName.includes('chain shirt') || itemName.includes('scale mail') || itemName.includes('breastplate') || itemName.includes('half plate')) && proficiencies.has('medium-armor')) return true;
      if ((itemType.includes('heavy') || itemName.includes('ring mail') || itemName.includes('chain mail') || itemName.includes('splint') || itemName.includes('plate')) && proficiencies.has('heavy-armor')) return true;
      
      return false;
    });
    
    console.log('Available armor after filtering:', availableArmor.length);
    return availableArmor;
  }, [equipment, data.species, data.class]);

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

  const addWeapon = (weaponSlug: string) => {
    const weapon = availableWeapons.find(w => w.slug === weaponSlug);
    if (weapon && !equipmentData.selectedWeapons.find(w => w.slug === weaponSlug)) {
      const newWeapons = [...equipmentData.selectedWeapons, weapon];
      updateEquipmentData({ selectedWeapons: newWeapons });
    }
  };

  const removeWeapon = (weaponSlug: string) => {
    const newWeapons = equipmentData.selectedWeapons.filter(w => w.slug !== weaponSlug);
    updateEquipmentData({ selectedWeapons: newWeapons });
  };

  const addArmor = (armorSlug: string) => {
    const armor = availableArmor.find(a => a.slug === armorSlug);
    if (armor && !equipmentData.selectedArmor.find(a => a.slug === armorSlug)) {
      const newArmor = [...equipmentData.selectedArmor, armor];
      updateEquipmentData({ selectedArmor: newArmor });
    }
  };

  const removeArmor = (armorSlug: string) => {
    const newArmor = equipmentData.selectedArmor.filter(a => a.slug !== armorSlug);
    updateEquipmentData({ selectedArmor: newArmor });
  };

  const getTotalWeight = () => {
    let total = 0;
    total += equipmentData.selectedWeapons.reduce((sum, weapon) => sum + (weapon.weight || 0), 0);
    total += equipmentData.selectedArmor.reduce((sum, armor) => sum + (armor.weight || 0), 0);
    total += equipmentData.inventory.reduce((sum, item: any) => sum + (item.weight || 0), 0);
    return total;
  };

  const getTotalGoldValue = () => {
    const { cp, sp, ep, gp, pp } = equipmentData.currency;
    return cp * 0.01 + sp * 0.1 + ep * 0.5 + gp + pp * 10;
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading equipment options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Choose Equipment</h1>
      
      {/* Debug info */}
      <div className="text-xs text-gray-500">
        Debug: {availableWeapons.length} weapons, {availableArmor.length} armor available
      </div>
      
      {/* Weapons Selection */}
      <Collapsible open={expandedSections.weapons} onOpenChange={() => toggleSection('weapons')}>
        <div className="border border-gray-200 rounded-lg">
          <CollapsibleTrigger className="w-full p-4 text-left">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Weapons ({equipmentData.selectedWeapons.length})</div>
                <div className="text-sm text-gray-600">Choose weapons you're proficient with ({availableWeapons.length} available)</div>
              </div>
              <div className="text-gray-400">
                {expandedSections.weapons ? '▲' : '▼'}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 border-t border-gray-100 space-y-3">
              {availableWeapons.length > 0 ? (
                <Select onValueChange={addWeapon}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Add a weapon..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWeapons.map((weapon) => (
                      <SelectItem key={weapon.slug} value={weapon.slug}>
                        {weapon.name} {weapon.weight && `(${weapon.weight} lbs)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-gray-500 text-sm mt-2">No weapons available with your current proficiencies</p>
              )}
              
              {equipmentData.selectedWeapons.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Selected Weapons:</div>
                  {equipmentData.selectedWeapons.map((weapon) => (
                    <div key={weapon.slug} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{weapon.name}</div>
                        <div className="text-sm text-gray-600">{weapon.weight || 0} lbs</div>
                      </div>
                      <button
                        onClick={() => removeWeapon(weapon.slug)}
                        className="text-red-600 hover:text-red-800 text-sm"
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

      {/* Armor Selection */}
      <Collapsible open={expandedSections.armor} onOpenChange={() => toggleSection('armor')}>
        <div className="border border-gray-200 rounded-lg">
          <CollapsibleTrigger className="w-full p-4 text-left">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Armor ({equipmentData.selectedArmor.length})</div>
                <div className="text-sm text-gray-600">Choose armor and shields you're proficient with ({availableArmor.length} available)</div>
              </div>
              <div className="text-gray-400">
                {expandedSections.armor ? '▲' : '▼'}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 border-t border-gray-100 space-y-3">
              {availableArmor.length > 0 ? (
                <Select onValueChange={addArmor}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Add armor or shield..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableArmor.map((armor) => (
                      <SelectItem key={armor.slug} value={armor.slug}>
                        {armor.name} {armor.weight && `(${armor.weight} lbs)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-gray-500 text-sm mt-2">No armor available with your current proficiencies</p>
              )}
              
              {equipmentData.selectedArmor.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Selected Armor:</div>
                  {equipmentData.selectedArmor.map((armor) => (
                    <div key={armor.slug} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{armor.name}</div>
                        <div className="text-sm text-gray-600">{armor.weight || 0} lbs</div>
                      </div>
                      <button
                        onClick={() => removeArmor(armor.slug)}
                        className="text-red-600 hover:text-red-800 text-sm"
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

      {/* Starting Equipment */}
      <Collapsible open={expandedSections.startingEquipment} onOpenChange={() => toggleSection('startingEquipment')}>
        <div className="border border-gray-200 rounded-lg">
          <CollapsibleTrigger className="w-full p-4 text-left">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gray-900">Starting Equipment Package</div>
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

      {/* Equipment Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Equipment Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Weapons: {equipmentData.selectedWeapons.length}</div>
            <div className="text-gray-600">Armor: {equipmentData.selectedArmor.length}</div>
          </div>
          <div>
            <div className="text-gray-600">Total Weight: {getTotalWeight().toFixed(1)} lbs</div>
            <div className="text-gray-600">Total Value: {getTotalGoldValue().toFixed(2)} GP</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentScreen;
