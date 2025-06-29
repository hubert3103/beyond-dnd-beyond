
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center">{classData.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClassDetailModal;
