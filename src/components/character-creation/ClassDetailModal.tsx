
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Open5eClass } from '../../services/open5eApi';
import ClassBasicInfo from './ClassBasicInfo';
import ClassProficiencies from './ClassProficiencies';
import ClassEquipment from './ClassEquipment';
import ClassSubclassSection from './ClassSubclassSection';

interface ClassDetailModalProps {
  classData: Open5eClass | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (classData: Open5eClass, subclass?: string) => void;
}

const ClassDetailModal = ({ classData, isOpen, onClose, onSelect }: ClassDetailModalProps) => {
  const [selectedSubclass, setSelectedSubclass] = useState<string>('');

  if (!classData) return null;

  const handleSelect = () => {
    onSelect(classData, selectedSubclass || undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center">{classData.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="proficiencies">Proficiencies</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="subclasses">Subclasses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <ClassBasicInfo classData={classData} />
          </TabsContent>

          <TabsContent value="proficiencies" className="space-y-6 mt-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Class Proficiencies</h3>
              <p className="text-gray-600">What your {classData.name} can use effectively</p>
            </div>
            <ClassProficiencies classData={classData} />
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6 mt-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Starting Equipment</h3>
              <p className="text-gray-600">What your {classData.name} begins with</p>
            </div>
            <ClassEquipment classData={classData} />
          </TabsContent>

          <TabsContent value="subclasses" className="space-y-6 mt-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Subclass Options</h3>
              <p className="text-gray-600">Specialize your {classData.name} with unique abilities</p>
            </div>
            <ClassSubclassSection 
              classData={classData}
              selectedSubclass={selectedSubclass}
              onSubclassChange={setSelectedSubclass}
            />
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

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
      </DialogContent>
    </Dialog>
  );
};

export default ClassDetailModal;
