
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Open5eRace } from '../../services/open5eApi';

interface SpeciesDetailModalProps {
  species: Open5eRace | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (species: Open5eRace, subspecies?: string) => void;
}

const SpeciesDetailModal = ({ species, isOpen, onClose, onSelect }: SpeciesDetailModalProps) => {
  const [selectedSubspecies, setSelectedSubspecies] = useState<string>('');

  if (!species) return null;

  // Extract subspecies from the species data (this would need to be enhanced based on actual API structure)
  const getSubspecies = (speciesName: string): string[] => {
    const subspeciesMap: Record<string, string[]> = {
      'Elf': ['High Elf', 'Wood Elf', 'Dark Elf (Drow)'],
      'Dwarf': ['Mountain Dwarf', 'Hill Dwarf'],
      'Halfling': ['Lightfoot Halfling', 'Stout Halfling'],
      'Human': ['Variant Human', 'Standard Human'],
      'Dragonborn': ['Brass Dragonborn', 'Bronze Dragonborn', 'Copper Dragonborn', 'Gold Dragonborn', 'Silver Dragonborn', 'Black Dragonborn', 'Blue Dragonborn', 'Green Dragonborn', 'Red Dragonborn', 'White Dragonborn'],
      'Gnome': ['Forest Gnome', 'Rock Gnome'],
      'Half-Elf': ['Half-Elf'],
      'Half-Orc': ['Half-Orc'],
      'Tiefling': ['Tiefling']
    };
    return subspeciesMap[speciesName] || [];
  };

  const subspecies = getSubspecies(species.name);
  const hasSubspecies = subspecies.length > 0;

  const handleSelect = () => {
    onSelect(species, selectedSubspecies || undefined);
    onClose();
  };

  const cleanDescription = (desc: string) => {
    return desc.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
  };

  const parseAbilityScoreIncrease = (asi: any) => {
    if (!asi || !Array.isArray(asi)) return 'None specified';
    return asi.map(increase => 
      `${increase.attributes?.join(', ') || 'Unknown'} +${increase.value || 0}`
    ).join(', ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{species.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Species Image Placeholder */}
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <img 
              src="/avatarPlaceholder.svg" 
              alt={species.name}
              className="w-16 h-16"
              style={{ filter: 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)' }}
            />
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900">Size</h4>
              <p className="text-gray-600">{species.size}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Speed</h4>
              <p className="text-gray-600">{species.speed?.walk || 30} feet</p>
            </div>
          </div>

          {/* Ability Score Increase */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Ability Score Increase</h4>
            <p className="text-gray-600">{parseAbilityScoreIncrease(species.asi)}</p>
          </div>

          {/* Languages */}
          {species.languages && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Languages</h4>
              <p className="text-gray-600">{species.languages}</p>
            </div>
          )}

          {/* Proficiencies */}
          {species.proficiencies && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Proficiencies</h4>
              <p className="text-gray-600">{species.proficiencies}</p>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600 leading-relaxed">{cleanDescription(species.desc)}</p>
          </div>

          {/* Traits */}
          {species.traits && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Racial Traits</h4>
              <p className="text-gray-600">{cleanDescription(species.traits)}</p>
            </div>
          )}

          {/* Subspecies Selection */}
          {hasSubspecies && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Subspecies</h4>
              <Select value={selectedSubspecies} onValueChange={setSelectedSubspecies}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subspecies (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {subspecies.map((sub) => (
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
            <Badge variant="secondary">{species.document__slug.toUpperCase()}</Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button onClick={handleSelect} className="flex-1">
              Select {species.name}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpeciesDetailModal;
