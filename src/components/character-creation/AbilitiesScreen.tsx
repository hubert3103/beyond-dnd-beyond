
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

  // Initialize generation method based on existing character data
  useEffect(() => {
    if (data.abilities) {
      // Try to detect the generation method based on the ability scores
      const abilityScores = Object.values(data.abilities).map((ability: any) => ability.base);
      const standardArrayValues = [15, 14, 13, 12, 10, 8];
      const sortedScores = [...abilityScores].sort((a, b) => b - a);
      const sortedStandardArray = [...standardArrayValues].sort((a, b) => b - a);
      
      // Check if it matches standard array
      const isStandardArray = sortedScores.every((score, index) => score === sortedStandardArray[index]);
      
      if (isStandardArray) {
        setGenerationMethod('standard-array');
      } else {
        // For now, default to manual for non-standard array scores
        // We could add more sophisticated detection for point-buy vs rolled stats
        setGenerationMethod('manual');
      }
    }
  }, [data.abilities]);

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
    if (data.species) {
      const newAbilities = { ...data.abilities };
      Object.keys(newAbilities).forEach(key => {
        const racialBonus = getRacialBonus(key);
        newAbilities[key] = {
          ...newAbilities[key],
          bonus: racialBonus,
          total: newAbilities[key].base + racialBonus
        };
      });
      onUpdate({ abilities: newAbilities });
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
    newAbilities[abilityId] = {
      ...newAbilities[abilityId],
      [field]: value,
      total: field === 'base' ? value + newAbilities[abilityId].bonus : newAbilities[abilityId].base + value
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
    setGenerationMethod(method);
    
    // Reset abilities when changing method (but preserve existing scores if they were already set)
    if (method !== 'manual') {
      const newAbilities = { ...data.abilities };
      Object.keys(newAbilities).forEach(key => {
        const racialBonus = getRacialBonus(key);
        // Only reset if the scores are at default values
        if (newAbilities[key].base === 10) {
          newAbilities[key] = {
            ...newAbilities[key],
            base: 8, // Default base
            bonus: racialBonus,
            total: 8 + racialBonus
          };
        }
      });
      onUpdate({ abilities: newAbilities });
    }
  };

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
          abilities={data.abilities} 
          onUpdate={(abilities) => onUpdate({ abilities })}
        />
      )}

      {generationMethod === 'point-buy' && (
        <PointBuySelector 
          abilities={data.abilities} 
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
            const abilityData = data.abilities[ability.id];
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
            const abilityData = data.abilities[ability.id];
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
