
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Open5eClass } from '../../services/open5eApi';
import { getAvailableSubclasses, getAllSubclasses } from '../../data/classArchetypes';
import SubclassInfoPanel from './SubclassInfoPanel';

interface ClassDetailModalProps {
  classData: Open5eClass | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (classData: Open5eClass, subclass?: string) => void;
}

const ClassDetailModal = ({ classData, isOpen, onClose, onSelect }: ClassDetailModalProps) => {
  const [selectedSubclass, setSelectedSubclass] = useState<string>('');

  if (!classData) return null;

  const availableSubclasses = getAvailableSubclasses(classData.name, 3);
  const allSubclasses = getAllSubclasses(classData.name);
  const higherLevelSubclasses = allSubclasses.filter(sub => sub.availableAtLevel > 3);
  
  const selectedSubclassData = availableSubclasses.find(sub => sub.name === selectedSubclass);

  const handleSelect = () => {
    onSelect(classData, selectedSubclass || undefined);
    onClose();
  };

  const cleanDescription = (desc: string) => {
    return desc.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
  };

  // Parse class features from description or archetype data
  const parseClassFeatures = () => {
    // This is a simplified parser - in a real app you'd want more sophisticated parsing
    const features = [];
    
    // Common class features based on class name
    const classFeatureMap: { [key: string]: Array<{name: string, description: string}> } = {
      'Barbarian': [
        {
          name: 'Rage',
          description: 'In battle, you fight with primal ferocity. On your turn, you can enter a rage as a bonus action. While raging, you gain advantage on Strength checks and Strength saving throws, deal extra damage with melee weapons, and have resistance to bludgeoning, piercing, and slashing damage.'
        },
        {
          name: 'Unarmored Defense',
          description: 'While you are not wearing any armor, your Armor Class equals 10 + your Dexterity modifier + your Constitution modifier. You can use a shield and still gain this benefit.'
        }
      ],
      'Fighter': [
        {
          name: 'Fighting Style',
          description: 'You adopt a particular style of fighting as your specialty. Choose one of the following options: Archery, Defense, Dueling, Great Weapon Fighting, Protection, or Two-Weapon Fighting.'
        },
        {
          name: 'Second Wind',
          description: 'You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level.'
        }
      ],
      'Wizard': [
        {
          name: 'Spellcasting',
          description: 'As a student of arcane magic, you have a spellbook containing spells that show the first glimmerings of your true power. You know three cantrips of your choice from the wizard spell list.'
        },
        {
          name: 'Arcane Recovery',
          description: 'You have learned to regain some of your magical energy by studying your spellbook. Once per day when you finish a short rest, you can choose expended spell slots to recover.'
        }
      ],
      'Rogue': [
        {
          name: 'Expertise',
          description: 'Choose two of your skill proficiencies, or one of your skill proficiencies and your proficiency with thieves\' tools. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.'
        },
        {
          name: 'Sneak Attack',
          description: 'You know how to strike subtly and exploit a foe\'s distraction. Once per turn, you can deal an extra 1d6 damage to one creature you hit with an attack if you have advantage on the attack roll.'
        }
      ]
    };

    return classFeatureMap[classData.name] || [
      {
        name: 'Class Features',
        description: cleanDescription(classData.desc)
      }
    ];
  };

  const classFeatures = parseClassFeatures();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center">{classData.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="proficiencies">Proficiencies</TabsTrigger>
            <TabsTrigger value="subclasses">Subclasses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Class Image Placeholder */}
            <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300">
              <img 
                src="/avatarPlaceholder.svg" 
                alt={classData.name}
                className="w-20 h-20 opacity-60"
                style={{ filter: 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)' }}
              />
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 text-sm">Hit Die</h4>
                <p className="text-red-700 font-medium">d{classData.hit_die}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 text-sm">Primary Ability</h4>
                <p className="text-purple-700 font-medium">{classData.spellcasting_ability || 'Varies'}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 col-span-2">
                <h4 className="font-semibold text-blue-900 text-sm">Saving Throws</h4>
                <p className="text-blue-700 font-medium">{classData.prof_saving_throws || 'None specified'}</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-3 text-lg">About {classData.name}</h4>
              <p className="text-gray-700 leading-relaxed">{cleanDescription(classData.desc)}</p>
            </div>

            <Separator />

            {/* Source Badge */}
            <div className="flex justify-center">
              <Badge variant="secondary" className="text-xs">
                Source: {classData.document__slug.toUpperCase()}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
              <Button onClick={handleSelect} className="flex-1 bg-red-600 hover:bg-red-700">
                Select {classData.name}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Class Features</h3>
              
              {classFeatures.map((feature, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-blue-900 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      {feature.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="proficiencies" className="space-y-6">
            {/* Proficiencies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classData.prof_armor && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-amber-900 mb-2 flex items-center">
                    <span className="text-lg">🛡️</span>
                    <span className="ml-2">Armor Proficiency</span>
                  </h4>
                  <p className="text-amber-800 text-sm">{classData.prof_armor}</p>
                </div>
              )}
              
              {classData.prof_weapons && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
                    <span className="text-lg">⚔️</span>
                    <span className="ml-2">Weapon Proficiency</span>
                  </h4>
                  <p className="text-orange-800 text-sm">{classData.prof_weapons}</p>
                </div>
              )}
              
              {classData.prof_tools && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                    <span className="text-lg">🔧</span>
                    <span className="ml-2">Tool Proficiency</span>
                  </h4>
                  <p className="text-green-800 text-sm">{classData.prof_tools}</p>
                </div>
              )}

              {classData.prof_skills && (
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2 flex items-center">
                    <span className="text-lg">🎯</span>
                    <span className="ml-2">Skill Proficiency</span>
                  </h4>
                  <p className="text-indigo-800 text-sm">{classData.prof_skills}</p>
                </div>
              )}
            </div>

            {/* Starting Equipment */}
            {classData.equipment && (
              <div className="bg-white border rounded-lg">
                <div className="bg-gray-100 px-6 py-4 border-b">
                  <h4 className="font-semibold text-gray-900 text-lg flex items-center">
                    <span className="text-lg">🎒</span>
                    <span className="ml-2">Starting Equipment</span>
                  </h4>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 leading-relaxed">{cleanDescription(classData.equipment)}</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="subclasses" className="space-y-6">
            {/* Available Subclasses */}
            {availableSubclasses.length > 0 && (
              <div className="bg-white border rounded-lg">
                <div className="bg-gray-100 px-6 py-4 border-b">
                  <h4 className="font-semibold text-gray-900 text-lg">Choose a Subclass</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Available by level {availableSubclasses[0]?.availableAtLevel || 3}. Customize your character with specialized abilities.
                  </p>
                </div>
                <div className="p-6">
                  <Select value={selectedSubclass} onValueChange={setSelectedSubclass}>
                    <SelectTrigger className="mb-4">
                      <SelectValue placeholder="Choose a subclass (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {availableSubclasses.map((subclass) => (
                        <SelectItem key={subclass.name} value={subclass.name}>
                          {subclass.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedSubclassData && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <SubclassInfoPanel subclass={selectedSubclassData} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Future Subclasses */}
            {higherLevelSubclasses.length > 0 && (
              <div className="bg-white border rounded-lg">
                <div className="bg-gray-100 px-6 py-4 border-b">
                  <h4 className="font-semibold text-gray-900 text-lg flex items-center">
                    <span className="text-lg">🌟</span>
                    <span className="ml-2">Future Subclass Options</span>
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    These subclasses will become available as your character advances to level {higherLevelSubclasses[0]?.availableAtLevel}+.
                  </p>
                </div>
                <div className="p-6 space-y-3">
                  {higherLevelSubclasses.map((subclass) => (
                    <div key={subclass.name} className="border-l-4 border-l-yellow-400 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-gray-900">{subclass.name}</h5>
                          <p className="text-sm text-gray-600 mt-1">{subclass.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-300 text-yellow-800">
                          Level {subclass.availableAtLevel}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ClassDetailModal;
