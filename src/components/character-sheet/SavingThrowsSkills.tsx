
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
    if (!character?.abilities?.[abilityKey]) return 0;
    const ability = character.abilities[abilityKey];
    const modifier = getModifier(ability.score || 10);
    const isProficient = getClassSavingThrows().includes(abilityKey);
    return isProficient ? modifier + (character.proficiencyBonus || 2) : modifier;
  };

  // Get class-based saving throw proficiencies from character creation data
  const getClassSavingThrows = () => {
    // Map class names to their saving throw proficiencies
    const classSavingThrows: Record<string, string[]> = {
      'Fighter': ['strength', 'constitution'],
      'Wizard': ['intelligence', 'wisdom'],
      'Rogue': ['dexterity', 'intelligence'],
      'Barbarian': ['strength', 'constitution'],
      'Bard': ['dexterity', 'charisma'],
      'Cleric': ['wisdom', 'charisma'],
      'Druid': ['intelligence', 'wisdom'],
      'Monk': ['strength', 'dexterity'],
      'Paladin': ['wisdom', 'charisma'],
      'Ranger': ['strength', 'dexterity'],
      'Sorcerer': ['constitution', 'charisma'],
      'Warlock': ['wisdom', 'charisma']
    };

    const className = character?.class_name;
    if (!className) return [];
    
    return classSavingThrows[className] || [];
  };

  // Get skills from character background and class choices
  const getCharacterSkills = () => {
    const skills = [];
    
    // Add background skills
    if (character.background_data?.skills) {
      character.background_data.skills.forEach((skill: any) => {
        skills.push({
          name: skill.name,
          ability: skill.ability_score,
          proficient: true,
          source: 'Background'
        });
      });
    }

    // Add class skills (if any were chosen during creation)
    if (character.class_data?.skills) {
      character.class_data.skills.forEach((skill: any) => {
        const existing = skills.find(s => s.name === skill.name);
        if (!existing) {
          skills.push({
            name: skill.name,
            ability: skill.ability_score,
            proficient: true,
            source: 'Class'
          });
        }
      });
    }

    // Add species skills
    if (character.species_data?.skills) {
      character.species_data.skills.forEach((skill: any) => {
        const existing = skills.find(s => s.name === skill.name);
        if (!existing) {
          skills.push({
            name: skill.name,
            ability: skill.ability_score,
            proficient: true,
            source: 'Species'
          });
        }
      });
    }

    // Fill in all other skills as non-proficient
    const allSkills = [
      { name: 'Acrobatics', ability: 'dexterity' },
      { name: 'Animal Handling', ability: 'wisdom' },
      { name: 'Arcana', ability: 'intelligence' },
      { name: 'Athletics', ability: 'strength' },
      { name: 'Deception', ability: 'charisma' },
      { name: 'History', ability: 'intelligence' },
      { name: 'Insight', ability: 'wisdom' },
      { name: 'Intimidation', ability: 'charisma' },
      { name: 'Investigation', ability: 'intelligence' },
      { name: 'Medicine', ability: 'wisdom' },
      { name: 'Nature', ability: 'intelligence' },
      { name: 'Perception', ability: 'wisdom' },
      { name: 'Performance', ability: 'charisma' },
      { name: 'Persuasion', ability: 'charisma' },
      { name: 'Religion', ability: 'intelligence' },
      { name: 'Sleight of Hand', ability: 'dexterity' },
      { name: 'Stealth', ability: 'dexterity' },
      { name: 'Survival', ability: 'wisdom' }
    ];

    allSkills.forEach(skill => {
      const existing = skills.find(s => s.name === skill.name);
      if (!existing) {
        skills.push({
          name: skill.name,
          ability: skill.ability,
          proficient: false,
          source: null
        });
      }
    });

    return skills.sort((a, b) => a.name.localeCompare(b.name));
  };

  const getSkillModifier = (skill: any) => {
    if (!character?.abilities?.[skill.ability]) return 0;
    const abilityModifier = getModifier(character.abilities[skill.ability].score || 10);
    return skill.proficient ? abilityModifier + (character.proficiencyBonus || 2) : abilityModifier;
  };

  const classSavingThrows = getClassSavingThrows();
  const characterSkills = getCharacterSkills();

  // Safety check for character data
  if (!character?.abilities) {
    return (
      <div className="bg-white rounded-lg p-4">
        <p className="text-gray-500">Loading character data...</p>
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
            <span className="text-lg font-semibold">Saving Throws & Skills</span>
            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Saving Throws */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Saving Throws</h3>
              {Object.entries(character.abilities).map(([key, ability]) => {
                const isProficient = classSavingThrows.includes(key);
                return (
                  <div key={key} className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={isProficient} disabled />
                      <span className="text-sm capitalize">{key}</span>
                      {isProficient && (
                        <span className="text-xs text-blue-600">({character.class_name})</span>
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {getSavingThrow(key) >= 0 ? '+' : ''}{getSavingThrow(key)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Skills</h3>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {characterSkills.map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={skill.proficient} disabled />
                      <span className="text-sm">{skill.name}</span>
                      {skill.source && (
                        <span className="text-xs text-gray-500">({skill.source})</span>
                      )}
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
