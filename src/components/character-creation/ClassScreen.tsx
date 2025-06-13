
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ClassScreenProps {
  data: any;
  onUpdate: (updates: any) => void;
}

const ClassScreen = ({ data, onUpdate }: ClassScreenProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    coreRules: true,
    expansions: false,
    homebrew: false
  });
  const [selectedClass, setSelectedClass] = useState(null);

  const classData = {
    coreRules: [
      { id: 'barbarian', name: 'BARBARIAN', description: 'A fierce warrior of primitive background who can enter a battle rage.' },
      { id: 'bard', name: 'BARD', description: 'A master of song, speech, and the magic they contain.' },
      { id: 'cleric', name: 'CLERIC', description: 'A priestly champion who wields divine magic in service of a higher power.' },
      { id: 'druid', name: 'DRUID', description: 'A priest of the Old Faith, wielding elemental forces and transforming into animal forms.' },
      { id: 'fighter', name: 'FIGHTER', description: 'A master of martial combat, skilled with a variety of weapons and armor.' },
      { id: 'monk', name: 'MONK', description: 'A master of martial arts, harnessing inner power through discipline.' }
    ],
    expansions: [
      { id: 'artificer', name: 'ARTIFICER', description: 'A master of invention, using ingenuity and magic to unlock extraordinary capabilities.' }
    ],
    homebrew: []
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const collapseAll = () => {
    setExpandedSections({
      coreRules: false,
      expansions: false,
      homebrew: false
    });
  };

  const expandAll = () => {
    setExpandedSections({
      coreRules: true,
      expansions: true,
      homebrew: true
    });
  };

  const selectClass = (characterClass: any) => {
    onUpdate({ class: characterClass });
    setSelectedClass(null);
  };

  if (selectedClass) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg p-6 text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <img 
              src="/avatarPlaceholder.svg" 
              alt="Class icon"
              className="w-12 h-12"
              style={{ filter: 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)' }}
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedClass.name}</h2>
          <p className="text-gray-600 mb-6">{selectedClass.description}</p>
          <div className="space-y-3">
            <Button 
              onClick={() => selectClass(selectedClass)}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Select
            </Button>
            <Button 
              onClick={() => setSelectedClass(null)}
              variant="outline"
              className="w-full"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Choose a Class</h1>
      
      {/* Search */}
      <div className="relative">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search"
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

      {/* Expand/Collapse Controls */}
      <div className="flex justify-end space-x-4 text-sm">
        <button onClick={collapseAll} className="text-gray-600 hover:text-gray-800">
          Collapse all
        </button>
        <button onClick={expandAll} className="text-gray-600 hover:text-gray-800">
          Expand all
        </button>
      </div>

      {/* Core Rules Section */}
      <Collapsible open={expandedSections.coreRules} onOpenChange={() => toggleSection('coreRules')}>
        <div className="space-y-2">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Core Rules</h3>
                <p className="text-sm text-gray-600">
                  Character options from the Player's Handbook, Dungeon Master's Guide and Monster Manual.
                </p>
              </div>
              <div className={`transform transition-transform ${expandedSections.coreRules ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2 ml-4">
              {classData.coreRules
                .filter(cls => cls.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className="w-full flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded mr-3 flex items-center justify-center">
                      <img 
                        src="/avatarPlaceholder.svg" 
                        alt="Class"
                        className="w-5 h-5"
                        style={{ filter: 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)' }}
                      />
                    </div>
                    <span className="flex-1 text-left font-medium text-gray-900">{cls.name}</span>
                    <span className="text-gray-400">▶</span>
                  </button>
                ))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Expansions Section */}
      <Collapsible open={expandedSections.expansions} onOpenChange={() => toggleSection('expansions')}>
        <div className="space-y-2">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Expansions</h3>
                <p className="text-sm text-gray-600">
                  Character options from official expansion books.
                </p>
              </div>
              <div className={`transform transition-transform ${expandedSections.expansions ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2 ml-4">
              {classData.expansions
                .filter(cls => cls.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className="w-full flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded mr-3 flex items-center justify-center">
                      <img 
                        src="/avatarPlaceholder.svg" 
                        alt="Class"
                        className="w-5 h-5"
                        style={{ filter: 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)' }}
                      />
                    </div>
                    <span className="flex-1 text-left font-medium text-gray-900">{cls.name}</span>
                    <span className="text-gray-400">▶</span>
                  </button>
                ))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};

export default ClassScreen;
