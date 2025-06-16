
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, Sword, Wand2 } from 'lucide-react';
import { Open5eClass } from '../../services/open5eApi';
import { subclassData, classData } from '../../data/subclassData';
import ClassInfoPanel from './ClassInfoPanel';
import SubclassInfoPanel from './SubclassInfoPanel';

interface ClassDetailModalProps {
  classData: Open5eClass | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (classData: Open5eClass, subclass?: string) => void;
}

const ClassDetailModal = ({ classData: classDataProp, isOpen, onClose, onSelect }: ClassDetailModalProps) => {
  const [selectedSubclass, setSelectedSubclass] = useState<string>('');

  if (!classDataProp) return null;

  // Get subclasses and class info from our data
  const subclasses = subclassData[classDataProp.name] || [];
  const classInfo = classData[classDataProp.name];
  const selectedSubclassInfo = subclasses.find(sub => sub.name === selectedSubclass);
  
  const hasSubclasses = subclasses.length > 0;

  const getClassIcon = (className: string) => {
    const name = className.toLowerCase();
    if (['fighter', 'barbarian', 'paladin'].includes(name)) return Shield;
    if (['rogue', 'ranger', 'monk'].includes(name)) return Sword;
    return Wand2;
  };

  const IconComponent = getClassIcon(classDataProp.name);

  const handleSelect = () => {
    onSelect(classDataProp, selectedSubclass || undefined);
    onClose();
  };

  const cleanDescription = (desc: string) => {
    return desc.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <IconComponent className="w-8 h-8" />
            {classDataProp.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Class Icon */}
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <IconComponent className="w-16 h-16 text-gray-600" />
          </div>

          {/* Enhanced Class Information */}
          {classInfo ? (
            <ClassInfoPanel classInfo={classInfo} />
          ) : (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-gray-600 leading-relaxed">{cleanDescription(classDataProp.desc)}</p>
            </div>
          )}

          {/* Basic Info from API */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900">Hit Die</h4>
              <p className="text-gray-600">d{classDataProp.hit_die}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Spellcaster</h4>
              <p className="text-gray-600">
                {classDataProp.spellcasting_ability ? `Yes (${classDataProp.spellcasting_ability})` : 'No'}
              </p>
            </div>
          </div>

          {/* Proficiencies */}
          <div className="space-y-3">
            {classDataProp.prof_armor && (
              <div>
                <h4 className="font-semibold text-gray-900">Armor Proficiencies</h4>
                <p className="text-gray-600">{classDataProp.prof_armor}</p>
              </div>
            )}
            
            {classDataProp.prof_weapons && (
              <div>
                <h4 className="font-semibold text-gray-900">Weapon Proficiencies</h4>
                <p className="text-gray-600">{classDataProp.prof_weapons}</p>
              </div>
            )}

            {classDataProp.prof_saving_throws && (
              <div>
                <h4 className="font-semibold text-gray-900">Saving Throw Proficiencies</h4>
                <p className="text-gray-600">{classDataProp.prof_saving_throws}</p>
              </div>
            )}

            {classDataProp.prof_skills && (
              <div>
                <h4 className="font-semibold text-gray-900">Skill Proficiencies</h4>
                <p className="text-gray-600">{classDataProp.prof_skills}</p>
              </div>
            )}
          </div>

          {/* Subclass Selection */}
          {hasSubclasses && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Subclass</h4>
              <p className="text-sm text-gray-500 mb-2">
                You can choose your subclass now or decide later during character creation.
              </p>
              <Select value={selectedSubclass} onValueChange={setSelectedSubclass}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subclass (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {subclasses.map((sub) => (
                    <SelectItem key={sub.name} value={sub.name}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Subclass Information */}
              {selectedSubclassInfo && (
                <SubclassInfoPanel subclass={selectedSubclassInfo} />
              )}
            </div>
          )}

          {/* Source Badge */}
          <div>
            <Badge variant="secondary">{classDataProp.document__slug.toUpperCase()}</Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button onClick={handleSelect} className="flex-1">
              Select {classDataProp.name}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClassDetailModal;
