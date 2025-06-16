
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Skill {
  name: string;
  ability: string;
  description?: string;
}

interface SkillSelectorProps {
  availableSkills: Skill[];
  maxSelections: number;
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  title: string;
  source: string;
}

const SkillSelector = ({ 
  availableSkills, 
  maxSelections, 
  selectedSkills, 
  onSkillsChange, 
  title,
  source 
}: SkillSelectorProps) => {
  const handleSkillToggle = (skillName: string) => {
    const currentSelected = selectedSkills.includes(skillName);
    
    if (currentSelected) {
      // Remove skill
      onSkillsChange(selectedSkills.filter(s => s !== skillName));
    } else {
      // Add skill if under limit
      if (selectedSkills.length < maxSelections) {
        onSkillsChange([...selectedSkills, skillName]);
      }
    }
  };

  const getAbilityDisplayName = (ability: string) => {
    const abilityMap: Record<string, string> = {
      'strength': 'Str',
      'dexterity': 'Dex', 
      'constitution': 'Con',
      'intelligence': 'Int',
      'wisdom': 'Wis',
      'charisma': 'Cha'
    };
    return abilityMap[ability] || ability;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">
          Choose {maxSelections} skill{maxSelections > 1 ? 's' : ''} from {source}
          {selectedSkills.length > 0 && ` (${selectedSkills.length}/${maxSelections} selected)`}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {availableSkills.map((skill) => {
          const isSelected = selectedSkills.includes(skill.name);
          const canSelect = selectedSkills.length < maxSelections || isSelected;
          
          return (
            <div 
              key={skill.name}
              className={`flex items-center space-x-3 p-2 rounded-md ${
                !canSelect ? 'opacity-50' : 'hover:bg-gray-50'
              }`}
            >
              <Checkbox
                id={`skill-${skill.name}`}
                checked={isSelected}
                onCheckedChange={() => handleSkillToggle(skill.name)}
                disabled={!canSelect}
              />
              <Label 
                htmlFor={`skill-${skill.name}`}
                className="flex-1 cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-xs text-gray-500">
                    ({getAbilityDisplayName(skill.ability)})
                  </span>
                </div>
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillSelector;
