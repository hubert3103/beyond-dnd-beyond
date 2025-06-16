
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Open5eClass } from '../../services/open5eApi';
import { getAvailableSubclasses, getAllSubclasses } from '../../data/classArchetypes';
import SubclassInfoPanel from './SubclassInfoPanel';

interface ClassSubclassSectionProps {
  classData: Open5eClass;
  selectedSubclass: string;
  onSubclassChange: (subclass: string) => void;
}

const ClassSubclassSection = ({ classData, selectedSubclass, onSubclassChange }: ClassSubclassSectionProps) => {
  const availableSubclasses = getAvailableSubclasses(classData.name, 3);
  const allSubclasses = getAllSubclasses(classData.name);
  const higherLevelSubclasses = allSubclasses.filter(sub => sub.availableAtLevel > 3);
  
  const selectedSubclassData = availableSubclasses.find(sub => sub.name === selectedSubclass);

  return (
    <div className="space-y-6">
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
            <Select value={selectedSubclass} onValueChange={onSubclassChange}>
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
    </div>
  );
};

export default ClassSubclassSection;
