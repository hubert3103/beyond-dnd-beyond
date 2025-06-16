
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const availableSubclasses = getAvailableSubclasses(classData.name, 3); // Show subclasses available by level 3
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{classData.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Class Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900">Hit Die</h4>
              <p className="text-gray-600">d{classData.hit_die}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Primary Ability</h4>
              <p className="text-gray-600">{classData.spellcasting_ability || 'Varies'}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600 leading-relaxed">{cleanDescription(classData.desc)}</p>
          </div>

          {/* Proficiencies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classData.prof_armor && (
              <div>
                <h5 className="font-medium text-gray-700">Armor</h5>
                <p className="text-sm text-gray-600">{classData.prof_armor}</p>
              </div>
            )}
            {classData.prof_weapons && (
              <div>
                <h5 className="font-medium text-gray-700">Weapons</h5>
                <p className="text-sm text-gray-600">{classData.prof_weapons}</p>
              </div>
            )}
            {classData.prof_tools && (
              <div>
                <h5 className="font-medium text-gray-700">Tools</h5>
                <p className="text-sm text-gray-600">{classData.prof_tools}</p>
              </div>
            )}
            {classData.prof_saving_throws && (
              <div>
                <h5 className="font-medium text-gray-700">Saving Throws</h5>
                <p className="text-sm text-gray-600">{classData.prof_saving_throws}</p>
              </div>
            )}
          </div>

          {/* Skills */}
          {classData.prof_skills && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
              <p className="text-gray-600">{classData.prof_skills}</p>
            </div>
          )}

          {/* Equipment */}
          {classData.equipment && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Starting Equipment</h4>
              <p className="text-gray-600">{cleanDescription(classData.equipment)}</p>
            </div>
          )}

          {/* Available Subclasses */}
          {availableSubclasses.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Available Subclasses (Levels 1-3)
              </h4>
              <p className="text-sm text-gray-500 mb-3">
                Choose a subclass path for your {classData.name}. These become available by level {availableSubclasses[0]?.availableAtLevel || 3}.
              </p>
              
              <Select value={selectedSubclass} onValueChange={setSelectedSubclass}>
                <SelectTrigger>
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
                <SubclassInfoPanel subclass={selectedSubclassData} />
              )}
            </div>
          )}

          {/* Higher Level Subclasses (Preview) */}
          {higherLevelSubclasses.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Future Subclass Options (Level {higherLevelSubclasses[0]?.availableAtLevel}+)
              </h4>
              <p className="text-sm text-gray-500 mb-3">
                These subclasses will become available as your character advances.
              </p>
              
              <div className="grid gap-2">
                {higherLevelSubclasses.map((subclass) => (
                  <Card key={subclass.name} className="border-l-4 border-l-yellow-400">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">{subclass.name}</h5>
                          <p className="text-sm text-gray-600 mt-1">{subclass.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Level {subclass.availableAtLevel}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Source Badge */}
          <div>
            <Badge variant="secondary">{classData.document__slug.toUpperCase()}</Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button onClick={handleSelect} className="flex-1">
              Select {classData.name}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClassDetailModal;
