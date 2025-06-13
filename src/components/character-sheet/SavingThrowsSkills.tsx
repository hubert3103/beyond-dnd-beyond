
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface SavingThrowsSkillsProps {
  character: any;
}

const SavingThrowsSkills = ({ character }: SavingThrowsSkillsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  const getSavingThrow = (abilityKey: string) => {
    const ability = character.abilities[abilityKey];
    const modifier = getModifier(ability.score);
    return ability.proficient ? modifier + character.proficiencyBonus : modifier;
  };

  const skills = [
    { name: 'Acrobatics', ability: 'dexterity', proficient: false },
    { name: 'Animal Handling', ability: 'wisdom', proficient: true },
    { name: 'Arcana', ability: 'intelligence', proficient: false },
    { name: 'Athletics', ability: 'strength', proficient: false },
    { name: 'Deception', ability: 'charisma', proficient: false },
    { name: 'History', ability: 'intelligence', proficient: false },
    { name: 'Insight', ability: 'wisdom', proficient: true },
    { name: 'Intimidation', ability: 'charisma', proficient: false },
    { name: 'Investigation', ability: 'intelligence', proficient: false },
    { name: 'Medicine', ability: 'wisdom', proficient: true },
    { name: 'Nature', ability: 'intelligence', proficient: true },
    { name: 'Perception', ability: 'wisdom', proficient: true },
    { name: 'Performance', ability: 'charisma', proficient: false },
    { name: 'Persuasion', ability: 'charisma', proficient: false },
    { name: 'Religion', ability: 'intelligence', proficient: false },
    { name: 'Sleight of Hand', ability: 'dexterity', proficient: false },
    { name: 'Stealth', ability: 'dexterity', proficient: false },
    { name: 'Survival', ability: 'wisdom', proficient: true }
  ];

  const getSkillModifier = (skill: any) => {
    const abilityModifier = getModifier(character.abilities[skill.ability].score);
    return skill.proficient ? abilityModifier + character.proficiencyBonus : abilityModifier;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-white rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-lg font-semibold">Saving Throws & Skills</span>
            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Saving Throws */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Saving Throws</h3>
              {Object.entries(character.abilities).map(([key, ability]) => (
                <div key={key} className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={(ability as any).proficient}
                      disabled
                    />
                    <span className="text-sm capitalize">{key}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {getSavingThrow(key) >= 0 ? '+' : ''}{getSavingThrow(key)}
                  </span>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Skills</h3>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {skills.map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={skill.proficient}
                        disabled
                      />
                      <span className="text-sm">{skill.name}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {getSkillModifier(skill) >= 0 ? '+' : ''}{getSkillModifier(skill)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default SavingThrowsSkills;
