
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface AbilitiesSectionProps {
  character: any;
  setCharacter: (character: any) => void;
}

const AbilitiesSection = ({ character, setCharacter }: AbilitiesSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedAbility, setExpandedAbility] = useState<string | null>(null);

  const abilities = [
    { key: 'strength', name: 'STR', fullName: 'Strength' },
    { key: 'dexterity', name: 'DEX', fullName: 'Dexterity' },
    { key: 'constitution', name: 'CON', fullName: 'Constitution' },
    { key: 'intelligence', name: 'INT', fullName: 'Intelligence' },
    { key: 'wisdom', name: 'WIS', fullName: 'Wisdom' },
    { key: 'charisma', name: 'CHA', fullName: 'Charisma' }
  ];

  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  const getSavingThrow = (abilityKey: string) => {
    if (!character?.abilities?.[abilityKey]) return 0;
    const ability = character.abilities[abilityKey];
    const modifier = getModifier(ability.score || 10);
    return ability.proficient ? modifier + (character.proficiencyBonus || 2) : modifier;
  };

  const handleAbilityScoreChange = (abilityKey: string, newScore: number) => {
    if (!character?.abilities) return;
    
    setCharacter({
      ...character,
      abilities: {
        ...character.abilities,
        [abilityKey]: {
          ...character.abilities[abilityKey],
          score: newScore,
          modifier: getModifier(newScore)
        }
      }
    });
  };

  const handleProficiencyChange = (abilityKey: string, proficient: boolean) => {
    if (!character?.abilities) return;
    
    setCharacter({
      ...character,
      abilities: {
        ...character.abilities,
        [abilityKey]: {
          ...character.abilities[abilityKey],
          proficient
        }
      }
    });
  };

  // Safety check for character and abilities
  if (!character?.abilities) {
    return (
      <div className="bg-white rounded-lg p-4">
        <p className="text-gray-500">Loading abilities...</p>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-white rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold">Abilities</span>
              <span className="text-sm text-gray-600">
                (Proficiency Bonus: +{character.proficiencyBonus || 2})
              </span>
            </div>
            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-3">
            {abilities.map((ability) => {
              const abilityData = character.abilities[ability.key];
              
              // Safety check for individual ability data
              if (!abilityData) {
                return (
                  <div key={ability.key} className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full h-auto p-3 flex flex-col items-center space-y-1"
                    >
                      <span className="text-xs font-medium text-gray-600">
                        {ability.name}
                      </span>
                      <span className="text-lg font-bold">10</span>
                      <span className="text-sm text-gray-600">+0</span>
                    </Button>
                  </div>
                );
              }

              const isExpanded = expandedAbility === ability.key;
              const score = abilityData.score || 10;
              const modifier = getModifier(score);
              
              return (
                <div key={ability.key} className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full h-auto p-3 flex flex-col items-center space-y-1"
                    onClick={() => setExpandedAbility(isExpanded ? null : ability.key)}
                  >
                    <span className="text-xs font-medium text-gray-600">
                      {ability.name}
                    </span>
                    <span className="text-lg font-bold">
                      {score}
                    </span>
                    <span className="text-sm text-gray-600">
                      {modifier >= 0 ? '+' : ''}{modifier}
                    </span>
                  </Button>
                  
                  {isExpanded && (
                    <div className="space-y-2 p-2 bg-gray-50 rounded">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">
                          {ability.fullName} Score
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          value={score}
                          onChange={(e) => handleAbilityScoreChange(ability.key, parseInt(e.target.value) || 0)}
                          className="h-8 text-sm"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${ability.key}-prof`}
                          checked={abilityData.proficient || false}
                          onCheckedChange={(checked) => handleProficiencyChange(ability.key, checked as boolean)}
                        />
                        <label htmlFor={`${ability.key}-prof`} className="text-xs">
                          Proficient (+{character.proficiencyBonus || 2})
                        </label>
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        Saving Throw: {getSavingThrow(ability.key) >= 0 ? '+' : ''}{getSavingThrow(ability.key)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default AbilitiesSection;
