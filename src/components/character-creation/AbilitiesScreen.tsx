
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AbilitiesScreenProps {
  data: any;
  onUpdate: (updates: any) => void;
}

const AbilitiesScreen = ({ data, onUpdate }: AbilitiesScreenProps) => {
  const [generationMethod, setGenerationMethod] = useState('standard-array');
  const [expandedAbilities, setExpandedAbilities] = useState<Record<string, boolean>>({});

  const abilities = [
    { id: 'str', name: 'STRENGTH', shortName: 'STR' },
    { id: 'dex', name: 'DEXTERITY', shortName: 'DEX' },
    { id: 'con', name: 'CONSTITUTION', shortName: 'CON' },
    { id: 'int', name: 'INTELLIGENCE', shortName: 'INT' },
    { id: 'wis', name: 'WISDOM', shortName: 'WIS' },
    { id: 'cha', name: 'CHARISMA', shortName: 'CHA' }
  ];

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

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Ability Scores</h1>
      
      {/* Generation Method */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">Choose a generation method</Label>
        <Select value={generationMethod} onValueChange={setGenerationMethod}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard-array">Standard Array</SelectItem>
            <SelectItem value="point-buy">Point Buy</SelectItem>
            <SelectItem value="roll">Roll 4d6</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Score Calculations Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Score Calculations</h3>
        <p className="text-sm text-gray-600">
          Calculations, including the base scores you set and any modifiers are found below. 
          You can also override any automatic calculations or modify them under each ability summary.
        </p>
      </div>

      {/* Ability Scores */}
      <div className="space-y-3">
        {abilities.map((ability) => {
          const abilityData = data.abilities[ability.id];
          const modifier = getModifier(abilityData.total);
          
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
                      </div>
                    </div>
                    <div className="text-gray-400">
                      {expandedAbilities[ability.id] ? '−' : '+'}
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
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
                        <Label className="text-sm text-gray-600">Bonus</Label>
                        <Input
                          type="number"
                          value={abilityData.bonus}
                          onChange={(e) => updateAbilityScore(ability.id, 'bonus', parseInt(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Total: {abilityData.total} (Modifier: {formatModifier(modifier)})
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

export default AbilitiesScreen;
