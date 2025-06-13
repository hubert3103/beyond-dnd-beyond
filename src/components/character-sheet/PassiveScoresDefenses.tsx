
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface PassiveScoresDefensesProps {
  character: any;
  setCharacter: (character: any) => void;
}

const PassiveScoresDefenses = ({ character, setCharacter }: PassiveScoresDefensesProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  const getPassivePerception = () => {
    const wisModifier = getModifier(character.abilities.wisdom.score);
    const proficiencyBonus = character.proficiencyBonus; // Assuming proficient in Perception
    return 10 + wisModifier + proficiencyBonus;
  };

  const getPassiveInvestigation = () => {
    const intModifier = getModifier(character.abilities.intelligence.score);
    return 10 + intModifier;
  };

  const handleArmorClassChange = (value: string) => {
    setCharacter({ ...character, armorClass: parseInt(value) || 0 });
  };

  const handleSpeedChange = (value: string) => {
    setCharacter({ ...character, speed: parseInt(value) || 0 });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-white rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-lg font-semibold">Passive Scores & Defenses</span>
            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4 space-y-4">
          {/* Passive Scores Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Passive Perception</div>
              <div className="text-lg font-bold">{getPassivePerception()}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Passive Investigation</div>
              <div className="text-lg font-bold">{getPassiveInvestigation()}</div>
            </div>
          </div>

          {/* Defense Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-600">Armor Class</label>
              <Input
                type="number"
                value={character.armorClass}
                onChange={(e) => handleArmorClassChange(e.target.value)}
                className="text-center font-bold"
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Initiative</div>
              <div className="text-lg font-bold">
                {character.initiative >= 0 ? '+' : ''}{character.initiative}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600">Speed</label>
              <Input
                type="number"
                value={character.speed}
                onChange={(e) => handleSpeedChange(e.target.value)}
                className="text-center font-bold"
              />
              <div className="text-xs text-gray-500 text-center">ft</div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default PassiveScoresDefenses;
