
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import StandardArraySelector from './StandardArraySelector';
import PointBuySelector from './PointBuySelector';

interface AbilitiesScreenProps {
  data: any;
  onUpdate: (updates: any) => void;
}

const AbilitiesScreen = ({ data, onUpdate }: AbilitiesScreenProps) => {
  const [generationMethod, setGenerationMethod] = useState('standard-array');
  const [expandedAbilities, setExpandedAbilities] = useState<Record<string, boolean>>({});

  // Ensure abilities data structure is properly initialized
  const initializeAbilities = () => {
    const defaultAbility = { base: 10, bonus: 0, total: 10 };
    return {
      str: data.abilities?.str || defaultAbility,
      dex: data.abilities?.dex || defaultAbility,
      con: data.abilities?.con || defaultAbility,
      int: data.abilities?.int || defaultAbility,
      wis: data.abilities?.wis || defaultAbility,
      cha: data.abilities?.cha || defaultAbility
    };
  };

  // Initialize abilities if they're not properly structured
  useEffect(() => {
    if (!data.abilities || Object.keys(data.abilities).length === 0) {
      console.log('Initializing abilities data structure');
      const initializedAbilities = initializeAbilities();
      onUpdate({ abilities: initializedAbilities });
    } else {
      // Ensure all required properties exist for each ability
      const updatedAbilities = { ...data.abilities };
      let needsUpdate = false;
      
      Object.keys(initializeAbilities()).forEach(key => {
        if (!updatedAbilities[key] || typeof updatedAbilities[key].total === 'undefined') {
          console.log(`Fixing missing ability data for ${key}`);
          updatedAbilities[key] = {
            base: updatedAbilities[key]?.base || 10,
            bonus: updatedAbilities[key]?.bonus || 0,
            total: updatedAbilities[key]?.total || (updatedAbilities[key]?.base || 10) + (updatedAbilities[key]?.bonus || 0)
          };
          needsUpdate = true;
        }
      });
      
      if (needsUpdate) {
        console.log('Updating abilities with missing properties');
        onUpdate({ abilities: updatedAbilities });
      }
    }
  }, []);

  const abilities = [
    { id: 'str', name: 'STRENGTH', shortName: 'STR' },
    { id: 'dex', name: 'DEXTERITY', shortName: 'DEX' },
    { id: 'con', name: 'CONSTITUTION', shortName: 'CON' },
    { id: 'int', name: 'INTELLIGENCE', shortName: 'INT' },
    { id: 'wis', name: 'WISDOM', shortName: 'WIS' },
    { id: 'cha', name: 'CHARISMA', shortName: 'CHA' }
  ];

  // Calculate racial bonuses including subspecies
  const getRacialBonus = (abilityId: string) => {
    if (!data.species) return 0;
    
    // Base racial bonuses
    const racialBonuses: Record<string, Record<string, number>> = {
      'Human': { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
      'Elf': { dex: 2 },
      'Dwarf': { con: 2 },
      'Halfling': { dex: 2 },
      'Dragonborn': { str: 2, cha: 1 },
      'Gnome': { int: 2 },
      'Half-Elf': { cha: 2 },
      'Half-Orc': { str: 2, con: 1 },
      'Tiefling': { int: 1, cha: 2 }
    };
    
    const baseBonus = racialBonuses[data.species.name]?.[abilityId] || 0;
    const subspeciesBonus = data.species.subspeciesAbilityBonus?.[abilityId] || 0;
    
    return baseBonus + subspeciesBonus;
  };

  // Update abilities with racial bonuses when species changes
  useEffect(() => {
    if (data.species && data.abilities) {
      const newAbilities = { ...data.abilities };
      let hasChanges = false;
      
      Object.keys(newAbilities).forEach(key => {
        const racialBonus = getRacialBonus(key);
        const currentAbility = newAbilities[key] || { base: 10, bonus: 0, total: 10 };
        
        if (currentAbility.bonus !== racialBonus) {
          newAbilities[key] = {
            ...currentAbility,
            bonus: racialBonus,
            total: currentAbility.base + racialBonus
          };
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        onUpdate({ abilities: newAbilities });
      }
    }
  }, [data.species]);

  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const updateAbilityScore = (abilityId: string, field: 'base' | 'bonus', value: number) => {
    const newAbilities = { ...data.abilities };
    const currentAbility = newAbilities[abilityId] || { base: 10, bonus: 0, total: 10 };
    
    newAbilities[abilityId] = {
      ...currentAbility,
      [field]: value,
      total: field === 'base' ? value + currentAbility.bonus : currentAbility.base + value
    };
    onUpdate({ abilities: newAbilities });
  };

  const toggleAbility = (abilityId: string) => {
    setExpandedAbilities(prev => ({
      ...prev,
      [abilityId]: !prev[abilityId]
    }));
  };

  const handleGenerationMethodChange = (method: string) => {
    console.log('Changing generation method to:', method);
    setGenerationMethod(method);
    
    // Don't reset abilities automatically - let the specific components handle this
    // This prevents the auto-detection from switching back to manual
  };

  // Ensure we have valid abilities data before rendering
  const safeAbilities = data.abilities ? initializeAbilities() : initializeAbilities();

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Ability Scores</h1>
      
      {/* Character Context */}
      {(data.species || data.class) && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Character Context</h3>
          <div className="flex flex-wrap gap-2">
            {data.species && (
              <Badge variant="outline">
                Species: {data.species.name}
              </Badge>
            )}
            {data.class && (
              <Badge variant="outline">
                Class: {data.class.name}
              </Badge>
            )}
          </div>
          {data.species && (
            <p className="text-sm text-blue-700 mt-2">
              Your species provides ability score bonuses that are automatically applied.
            </p>
          )}
        </div>
      )}
      
      {/* Generation Method */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">Choose a generation method</Label>
        <Select value={generationMethod} onValueChange={handleGenerationMethodChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            <SelectItem value="standard-array">Standard Array</SelectItem>
            <SelectItem value="point-buy">Point Buy</SelectItem>
            <SelectItem value="roll">Roll 4d6 (Drop Lowest)</SelectItem>
            <SelectItem value="manual">Manual Entry</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Method-specific content */}
      {generationMethod === 'standard-array' && (
        <StandardArraySelector 
          abilities={safeAbilities} 
          onUpdate={(abilities) => onUpdate({ abilities })}
        />
      )}

      {generationMethod === 'point-buy' && (
        <PointBuySelector 
          abilities={safeAbilities} 
          onUpdate={(abilities) => onUpdate({ abilities })}
        />
      )}

      {generationMethod === 'roll' && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">Roll 4d6 (Drop Lowest)</h3>
          <p className="text-sm text-yellow-700 mb-3">
            Roll four 6-sided dice and record the total of the highest three dice for each ability score.
          </p>
          <p className="text-sm text-yellow-700">
            This method is not automated yet. Please use manual entry to input your rolled scores.
          </p>
        </div>
      )}

      {/* Score Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Current Ability Scores</h3>
        <div className="grid grid-cols-3 gap-4">
          {abilities.map((ability) => {
            const abilityData = safeAbilities[ability.id];
            const modifier = getModifier(abilityData.total);
            const racialBonus = getRacialBonus(ability.id);
            
            return (
              <div key={ability.id} className="text-center">
                <div className="font-semibold text-gray-900">{ability.shortName}</div>
                <div className="text-2xl font-bold">{abilityData.total}</div>
                <div className="text-sm text-gray-600">{formatModifier(modifier)}</div>
                {racialBonus > 0 && (
                  <div className="text-xs text-blue-600">+{racialBonus} racial</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual/Advanced Controls */}
      {generationMethod === 'manual' && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Manual Entry</h3>
          {abilities.map((ability) => {
            const abilityData = safeAbilities[ability.id];
            const modifier = getModifier(abilityData.total);
            const racialBonus = getRacialBonus(ability.id);
            
            return (
              <Collapsible 
                key={ability.id}
                open={expandedAbilities[ability.id]} 
                onOpenChange={() => toggleAbility(ability.id)}
              >
                <div className="border border-gray-200 rounded-lg">
                  <CollapsibleTrigger className="w-full p-4 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{ability.name}</div>
                        <div className="text-sm text-gray-600">
                          Total score {abilityData.total} ({formatModifier(modifier)})
                          {racialBonus > 0 && (
                            <span className="text-blue-600 ml-1">(+{racialBonus} racial)</span>
                          )}
                        </div>
                      </div>
                      <div className="text-gray-400">
                        {expandedAbilities[ability.id] ? '−' : '+'}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm text-gray-600">Base Score</Label>
                          <Input
                            type="number"
                            value={abilityData.base}
                            onChange={(e) => updateAbilityScore(ability.id, 'base', parseInt(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Racial Bonus</Label>
                          <Input
                            type="number"
                            value={racialBonus}
                            disabled
                            className="mt-1 bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Total</Label>
                          <Input
                            type="number"
                            value={abilityData.total}
                            disabled
                            className="mt-1 bg-gray-50 font-semibold"
                          />
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Modifier: {formatModifier(modifier)}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AbilitiesScreen;
