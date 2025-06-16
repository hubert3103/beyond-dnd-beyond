
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, Sword, Wand2 } from 'lucide-react';
import { Open5eClass } from '../../services/open5eApi';

interface ClassDetailModalProps {
  classData: Open5eClass | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (classData: Open5eClass, subclass?: string) => void;
}

const ClassDetailModal = ({ classData, isOpen, onClose, onSelect }: ClassDetailModalProps) => {
  const [selectedSubclass, setSelectedSubclass] = useState<string>('');

  if (!classData) return null;

  // Extract subclasses from the class data (this would need to be enhanced based on actual API structure)
  const getSubclasses = (className: string): string[] => {
    const subclassMap: Record<string, string[]> = {
      'Fighter': ['Champion', 'Battle Master', 'Eldritch Knight'],
      'Wizard': ['School of Evocation', 'School of Abjuration', 'School of Conjuration', 'School of Divination', 'School of Enchantment', 'School of Illusion', 'School of Necromancy', 'School of Transmutation'],
      'Rogue': ['Thief', 'Assassin', 'Arcane Trickster'],
      'Cleric': ['Life Domain', 'Light Domain', 'Nature Domain', 'Tempest Domain', 'Trickery Domain', 'War Domain', 'Knowledge Domain'],
      'Ranger': ['Hunter', 'Beast Master'],
      'Paladin': ['Oath of Devotion', 'Oath of the Ancients', 'Oath of Vengeance'],
      'Barbarian': ['Path of the Berserker', 'Path of the Totem Warrior'],
      'Bard': ['College of Lore', 'College of Valor'],
      'Druid': ['Circle of the Land', 'Circle of the Moon'],
      'Monk': ['Way of the Open Hand', 'Way of Shadow', 'Way of the Four Elements'],
      'Sorcerer': ['Draconic Bloodline', 'Wild Magic'],
      'Warlock': ['The Archfey', 'The Fiend', 'The Great Old One']
    };
    return subclassMap[className] || [];
  };

  const subclasses = getSubclasses(classData.name);
  const hasSubclasses = subclasses.length > 0;

  const getClassIcon = (className: string) => {
    const name = className.toLowerCase();
    if (['fighter', 'barbarian', 'paladin'].includes(name)) return Shield;
    if (['rogue', 'ranger', 'monk'].includes(name)) return Sword;
    return Wand2;
  };

  const IconComponent = getClassIcon(classData.name);

  const handleSelect = () => {
    onSelect(classData, selectedSubclass || undefined);
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
            {classData.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Class Icon */}
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <IconComponent className="w-16 h-16 text-gray-600" />
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900">Hit Die</h4>
              <p className="text-gray-600">d{classData.hit_die}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Spellcaster</h4>
              <p className="text-gray-600">
                {classData.spellcasting_ability ? `Yes (${classData.spellcasting_ability})` : 'No'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600 leading-relaxed">{cleanDescription(classData.desc)}</p>
          </div>

          {/* Proficiencies */}
          <div className="space-y-3">
            {classData.prof_armor && (
              <div>
                <h4 className="font-semibold text-gray-900">Armor Proficiencies</h4>
                <p className="text-gray-600">{classData.prof_armor}</p>
              </div>
            )}
            
            {classData.prof_weapons && (
              <div>
                <h4 className="font-semibold text-gray-900">Weapon Proficiencies</h4>
                <p className="text-gray-600">{classData.prof_weapons}</p>
              </div>
            )}

            {classData.prof_saving_throws && (
              <div>
                <h4 className="font-semibold text-gray-900">Saving Throw Proficiencies</h4>
                <p className="text-gray-600">{classData.prof_saving_throws}</p>
              </div>
            )}

            {classData.prof_skills && (
              <div>
                <h4 className="font-semibold text-gray-900">Skill Proficiencies</h4>
                <p className="text-gray-600">{classData.prof_skills}</p>
              </div>
            )}

            {classData.prof_tools && (
              <div>
                <h4 className="font-semibold text-gray-900">Tool Proficiencies</h4>
                <p className="text-gray-600">{classData.prof_tools}</p>
              </div>
            )}
          </div>

          {/* Starting Equipment */}
          {classData.equipment && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Starting Equipment</h4>
              <p className="text-gray-600">{cleanDescription(classData.equipment)}</p>
            </div>
          )}

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
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
