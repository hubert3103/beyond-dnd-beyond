import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Shield, Sword, Wand2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useOpen5eData } from '../../hooks/useOpen5eData';
import { open5eApi, Open5eClass } from '../../services/open5eApi';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ClassDetailModal from './ClassDetailModal';

interface ClassScreenProps {
  data: any;
  onUpdate: (updates: any) => void;
}

const ClassScreen = ({ data, onUpdate }: ClassScreenProps) => {
  const { classes, isLoading, error, refresh } = useOpen5eData();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [selectedClass, setSelectedClass] = useState<Open5eClass | null>(data.class);
  const [detailModalClass, setDetailModalClass] = useState<Open5eClass | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(data.class?.selectedSkills || []);

  // All D&D 5e skills with their associated abilities
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

  // Get class skill options and count based on class
  const getClassSkillInfo = (className: string) => {
    const classSkillMap: Record<string, { skills: string[], count: number }> = {
      'Barbarian': { skills: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'], count: 2 },
      'Bard': { skills: allSkills.map(s => s.name), count: 3 },
      'Cleric': { skills: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'], count: 2 },
      'Druid': { skills: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'], count: 2 },
      'Fighter': { skills: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Intimidation', 'Perception', 'Survival'], count: 2 },
      'Monk': { skills: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'], count: 2 },
      'Paladin': { skills: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'], count: 2 },
      'Ranger': { skills: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'], count: 3 },
      'Rogue': { skills: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'], count: 4 },
      'Sorcerer': { skills: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'], count: 2 },
      'Warlock': { skills: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'], count: 2 },
      'Wizard': { skills: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'], count: 2 }
    };

    return classSkillMap[className] || { skills: [], count: 0 };
  };

  const filteredClasses = useMemo(() => {
    console.log('All classes:', classes.length);
    console.log('Data sources:', data.sources);
    
    if (!classes.length) return [];
    
    let filtered = classes;
    
    // Apply source filtering only if at least one source is enabled
    const hasSourceEnabled = data.sources?.coreRules || data.sources?.expansions || data.sources?.homebrew;
    
    if (hasSourceEnabled) {
      // Get available sources and log them for debugging
      const availableSources = open5eApi.getAvailableSources(classes);
      console.log('Available sources in classes:', availableSources);
      
      // Define source categories based on actual document slugs from the API
      const coreRuleSources = ['wotc-srd'];  // This is what's actually in the API
      const expansionSources = ['toh'];  // Tome of Heroes appears to be expansion content
      const homebrewSources = ['kp'];  // Kobold Press - third party
      
      let allowedSources: string[] = [];
      
      if (data.sources?.coreRules) {
        allowedSources.push(...coreRuleSources);
      }
      if (data.sources?.expansions) {
        allowedSources.push(...expansionSources);
      }
      if (data.sources?.homebrew) {
        allowedSources.push(...homebrewSources);
      }
      
      console.log('Allowed sources:', allowedSources);
      
      // Filter by allowed sources
      filtered = classes.filter(cls => allowedSources.includes(cls.document__slug));
      console.log('Filtered by source:', filtered.length);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(cls => 
        cls.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('Filtered by search:', filtered.length);
    }
    
    return filtered;
  }, [classes, data.sources, searchTerm]);

  const classesBySource = useMemo(() => {
    const grouped: Record<string, Open5eClass[]> = {};
    filteredClasses.forEach(cls => {
      const source = cls.document__slug;
      if (!grouped[source]) {
        grouped[source] = [];
      }
      grouped[source].push(cls);
    });
    return grouped;
  }, [filteredClasses]);

  const getSourceDisplayName = (source: string) => {
    switch (source) {
      case 'wotc-srd': return 'Core Rules (SRD)';
      case 'toh': return 'Tome of Heroes';
      case 'kp': return 'Kobold Press';
      case 'xge': return "Xanathar's Guide";
      case 'tce': return "Tasha's Cauldron";
      case 'vgm': return "Volo's Guide";
      case 'mtf': return "Mordenkainen's Tome";
      default: return source.toUpperCase();
    }
  };

  const getClassIcon = (className: string) => {
    const name = className.toLowerCase();
    if (['fighter', 'barbarian', 'paladin'].includes(name)) return Shield;
    if (['rogue', 'ranger', 'monk'].includes(name)) return Sword;
    return Wand2;
  };

  const toggleSource = (source: string) => {
    setExpandedSources(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  const toggleAllSources = (expand: boolean) => {
    const newState: Record<string, boolean> = {};
    Object.keys(classesBySource).forEach(source => {
      newState[source] = expand;
    });
    setExpandedSources(newState);
  };

  const handleClassClick = (cls: Open5eClass) => {
    setDetailModalClass(cls);
    setIsDetailModalOpen(true);
  };

  const handleSelectClass = (cls: Open5eClass, subclass?: string) => {
    setSelectedClass(cls);
    // Reset skills when changing class
    setSelectedSkills([]);
    onUpdate({ 
      class: {
        name: cls.name,
        subclass: subclass,
        description: cls.desc,
        hitDie: cls.hit_die,
        proficiencies: {
          armor: cls.prof_armor,
          weapons: cls.prof_weapons,
          tools: cls.prof_tools,
          savingThrows: cls.prof_saving_throws,
          skills: cls.prof_skills
        },
        equipment: cls.equipment,
        spellcastingAbility: cls.spellcasting_ability,
        source: cls.document__slug,
        features: [],
        selectedSkills: []
      }
    });
  };

  const handleSkillSelect = (skillName: string) => {
    if (!selectedClass) return;
    
    const skillInfo = getClassSkillInfo(selectedClass.name);
    const isAlreadySelected = selectedSkills.includes(skillName);
    let newSelectedSkills: string[];

    if (isAlreadySelected) {
      // Remove skill
      newSelectedSkills = selectedSkills.filter(s => s !== skillName);
    } else {
      // Add skill if under limit
      if (selectedSkills.length < skillInfo.count) {
        newSelectedSkills = [...selectedSkills, skillName];
      } else {
        return; // Don't add if at limit
      }
    }

    setSelectedSkills(newSelectedSkills);
    onUpdate({
      class: {
        ...data.class,
        selectedSkills: newSelectedSkills
      }
    });
  };

  const removeSkill = (skillToRemove: string) => {
    const newSelectedSkills = selectedSkills.filter(s => s !== skillToRemove);
    setSelectedSkills(newSelectedSkills);
    onUpdate({
      class: {
        ...data.class,
        selectedSkills: newSelectedSkills
      }
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading class data..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refresh} />;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Class</h1>
        <p className="text-gray-600">Select a class that defines your character's abilities and role</p>
      </div>

      {/* Debug info */}
      <div className="text-sm text-gray-500 bg-gray-100 p-2 rounded">
        Debug: {classes.length} total classes, {filteredClasses.length} after filtering
        <br />
        Sources enabled: coreRules={String(data.sources?.coreRules === true)}, expansions={String(data.sources?.expansions === true)}, homebrew={String(data.sources?.homebrew === true)}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Expand/Collapse All */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleAllSources(true)}
          className="flex-1"
        >
          Expand All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleAllSources(false)}
          className="flex-1"
        >
          Collapse All
        </Button>
      </div>

      {/* Classes by Source */}
      <div className="space-y-4">
        {Object.entries(classesBySource).map(([source, sourceClasses]) => (
          <Collapsible
            key={source}
            open={expandedSources[source]}
            onOpenChange={() => toggleSource(source)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{getSourceDisplayName(source)}</div>
                  <div className="text-sm text-gray-600">{sourceClasses.length} classes available</div>
                </div>
                {expandedSources[source] ? 
                  <ChevronDown className="h-5 w-5" /> : 
                  <ChevronRight className="h-5 w-5" />
                }
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2 space-y-2">
              {sourceClasses.map((cls) => {
                const IconComponent = getClassIcon(cls.name);
                return (
                  <Card 
                    key={cls.slug}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedClass?.slug === cls.slug ? 'ring-2 ring-red-600 bg-red-50' : ''
                    }`}
                    onClick={() => handleClassClick(cls)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{cls.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {cls.desc.replace(/<[^>]*>/g, '').substring(0, 100)}...
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">Hit Die: d{cls.hit_die}</span>
                            {cls.spellcasting_ability && (
                              <span className="text-xs text-blue-600">Spellcaster</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Skill Selection with Dropdown */}
      {selectedClass && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Class Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const skillInfo = getClassSkillInfo(selectedClass.name);
              if (skillInfo.count === 0) {
                return <p className="text-gray-600">This class does not grant skill proficiencies.</p>;
              }
              
              const availableSkills = skillInfo.skills.filter(skillName => 
                !selectedSkills.includes(skillName)
              );
              
              return (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Choose {skillInfo.count} skill{skillInfo.count > 1 ? 's' : ''} from your {selectedClass.name} class
                    {selectedSkills.length > 0 && ` (${selectedSkills.length}/${skillInfo.count} selected)`}
                  </p>
                  
                  {/* Selected Skills */}
                  {selectedSkills.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Selected Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSkills.map(skill => (
                          <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="ml-1 text-xs hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Skill Selection Dropdown */}
                  {selectedSkills.length < skillInfo.count && availableSkills.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Add Skill:</h4>
                      <Select onValueChange={handleSkillSelect}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a skill proficiency" />
                        </SelectTrigger>
                        <SelectContent className="bg-white z-50">
                          {availableSkills.map(skillName => {
                            const skillData = allSkills.find(s => s.name === skillName);
                            return (
                              <SelectItem key={skillName} value={skillName}>
                                <div className="flex justify-between items-center w-full">
                                  <span>{skillName}</span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    ({skillData?.ability.substring(0, 3).toUpperCase()})
                                  </span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {selectedSkills.length === skillInfo.count && (
                    <p className="text-sm text-green-600">✓ All skill proficiencies selected</p>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {filteredClasses.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No classes found matching your criteria.</p>
          <p className="text-xs text-gray-400 mt-2">
            Try adjusting your source settings or search terms.
          </p>
        </div>
      )}

      {/* Class Detail Modal */}
      <ClassDetailModal
        classData={detailModalClass}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onSelect={handleSelectClass}
      />
    </div>
  );
};

export default ClassScreen;
