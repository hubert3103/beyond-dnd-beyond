
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

  // Comprehensive subspecies data for all major species
  const getSubspeciesData = (speciesName: string) => {
    const subspeciesData: Record<string, Array<{name: string, description: string, bonuses?: string, abilityBonus?: Record<string, number>}>> = {
      'Elf': [
        {
          name: 'High Elf',
          description: 'High elves are graceful warriors and wizards who originated from the realm of Faerie.',
          bonuses: '+1 Intelligence, Cantrip, Longsword proficiency',
          abilityBonus: { int: 1 }
        },
        {
          name: 'Wood Elf',
          description: 'Wood elves are keen hunters with fey ancestry and a fierce love of freedom.',
          bonuses: '+1 Wisdom, Longbow proficiency, Mask of the Wild',
          abilityBonus: { wis: 1 }
        },
        {
          name: 'Dark Elf (Drow)',
          description: 'Dark elves were banished from the surface world for following the goddess Lolth.',
          bonuses: '+1 Charisma, Superior Darkvision, Drow Magic',
          abilityBonus: { cha: 1 }
        }
      ],
      'Dwarf': [
        {
          name: 'Mountain Dwarf',
          description: 'Mountain dwarves are strong and hardy, adapted to difficult terrain.',
          bonuses: '+2 Strength, Armor proficiency',
          abilityBonus: { str: 2 }
        },
        {
          name: 'Hill Dwarf',
          description: 'Hill dwarves are especially wise and tough, with keen senses.',
          bonuses: '+1 Wisdom, Extra hit points',
          abilityBonus: { wis: 1 }
        }
      ],
      'Halfling': [
        {
          name: 'Lightfoot Halfling',
          description: 'Lightfoot halflings can easily hide and are naturally stealthy.',
          bonuses: '+1 Charisma, Naturally Stealthy',
          abilityBonus: { cha: 1 }
        },
        {
          name: 'Stout Halfling',
          description: 'Stout halflings are hardier than other halflings and resistant to poison.',
          bonuses: '+1 Constitution, Stout Resilience',
          abilityBonus: { con: 1 }
        }
      ],
      'Gnome': [
        {
          name: 'Forest Gnome',
          description: 'Forest gnomes have a natural knack for illusion and inherent communion with beasts.',
          bonuses: '+1 Dexterity, Natural Illusionist, Speak with Small Beasts',
          abilityBonus: { dex: 1 }
        },
        {
          name: 'Rock Gnome',
          description: 'Rock gnomes are natural inventors and have an affinity for crafting.',
          bonuses: '+1 Constitution, Artificer\'s Lore, Tinker',
          abilityBonus: { con: 1 }
        }
      ],
      'Dragonborn': [
        {
          name: 'Black Dragonborn',
          description: 'Dragonborn with black dragon ancestry, wielding acid breath.',
          bonuses: 'Acid Breath Weapon, Acid Resistance',
          abilityBonus: {}
        },
        {
          name: 'Blue Dragonborn',
          description: 'Dragonborn with blue dragon ancestry, wielding lightning breath.',
          bonuses: 'Lightning Breath Weapon, Lightning Resistance',
          abilityBonus: {}
        },
        {
          name: 'Brass Dragonborn',
          description: 'Dragonborn with brass dragon ancestry, wielding fire breath.',
          bonuses: 'Fire Breath Weapon, Fire Resistance',
          abilityBonus: {}
        },
        {
          name: 'Bronze Dragonborn',
          description: 'Dragonborn with bronze dragon ancestry, wielding lightning breath.',
          bonuses: 'Lightning Breath Weapon, Lightning Resistance',
          abilityBonus: {}
        },
        {
          name: 'Copper Dragonborn',
          description: 'Dragonborn with copper dragon ancestry, wielding acid breath.',
          bonuses: 'Acid Breath Weapon, Acid Resistance',
          abilityBonus: {}
        },
        {
          name: 'Gold Dragonborn',
          description: 'Dragonborn with gold dragon ancestry, wielding fire breath.',
          bonuses: 'Fire Breath Weapon, Fire Resistance',
          abilityBonus: {}
        },
        {
          name: 'Green Dragonborn',
          description: 'Dragonborn with green dragon ancestry, wielding poison breath.',
          bonuses: 'Poison Breath Weapon, Poison Resistance',
          abilityBonus: {}
        },
        {
          name: 'Red Dragonborn',
          description: 'Dragonborn with red dragon ancestry, wielding fire breath.',
          bonuses: 'Fire Breath Weapon, Fire Resistance',
          abilityBonus: {}
        },
        {
          name: 'Silver Dragonborn',
          description: 'Dragonborn with silver dragon ancestry, wielding cold breath.',
          bonuses: 'Cold Breath Weapon, Cold Resistance',
          abilityBonus: {}
        },
        {
          name: 'White Dragonborn',
          description: 'Dragonborn with white dragon ancestry, wielding cold breath.',
          bonuses: 'Cold Breath Weapon, Cold Resistance',
          abilityBonus: {}
        }
      ],
      'Tiefling': [
        {
          name: 'Asmodeus Tiefling',
          description: 'Tieflings with a bloodline tied to Asmodeus, the Lord of the Nine Hells.',
          bonuses: '+1 Charisma, Thaumaturgy cantrip, Hellish Rebuke spell',
          abilityBonus: { cha: 1 }
        },
        {
          name: 'Baalzebul Tiefling',
          description: 'Tieflings descended from the archdevil Baalzebul.',
          bonuses: '+1 Intelligence, Thaumaturgy cantrip, Ray of Sickness spell',
          abilityBonus: { int: 1 }
        },
        {
          name: 'Dispater Tiefling',
          description: 'Tieflings with a connection to Dispater, the Iron Duke.',
          bonuses: '+1 Dexterity, Thaumaturgy cantrip, Disguise Self spell',
          abilityBonus: { dex: 1 }
        }
      ]
    };
    return subspeciesData[speciesName] || [];
  };

  const subspeciesData = getSubspeciesData(species.name);
  const hasSubspecies = subspeciesData.length > 0;
  const selectedSubspeciesData = subspeciesData.find(sub => sub.name === selectedSubspecies);

  const handleSelect = () => {
    const selectedSubspeciesInfo = subspeciesData.find(sub => sub.name === selectedSubspecies);
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

  // Parse racial traits from the traits text
  const parseRacialTraits = (traitsText: string) => {
    if (!traitsText) return [];
    
    const traits = [];
    
    // Split by markdown bold headers like **_Name._**
    const traitSections = traitsText.split(/\*\*_([^_]+)\._\*\*/);
    
    for (let i = 1; i < traitSections.length; i += 2) {
      const name = traitSections[i];
      const description = traitSections[i + 1]?.trim() || '';
      
      if (name && description) {
        traits.push({
          name: name,
          description: description.replace(/^\s*\*\s*/, '').trim()
        });
      }
    }
    
    return traits;
  };

  const racialTraits = parseRacialTraits(species.traits || '');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center">{species.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Species Image Placeholder */}
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300">
            <img 
              src="/avatarPlaceholder.svg" 
              alt={species.name}
              className="w-20 h-20 opacity-60"
              style={{ filter: 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)' }}
            />
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 text-sm">Size</h4>
              <p className="text-blue-700 font-medium">{species.size}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 text-sm">Speed</h4>
              <p className="text-green-700 font-medium">{species.speed?.walk || 30} feet</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 col-span-2">
              <h4 className="font-semibold text-purple-900 text-sm">Ability Bonuses</h4>
              <p className="text-purple-700 font-medium">{parseAbilityScoreIncrease(species.asi)}</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h4 className="font-semibold text-gray-900 mb-3 text-lg">About {species.name}</h4>
            <p className="text-gray-700 leading-relaxed">{cleanDescription(species.desc)}</p>
          </div>

          {/* Languages */}
          {species.languages && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-900 mb-2 flex items-center">
                <span className="text-lg">🗣️</span>
                <span className="ml-2">Languages</span>
              </h4>
              <p className="text-amber-800">{species.languages}</p>
            </div>
          )}

          {/* Proficiencies */}
          {species.proficiencies && (
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-2 flex items-center">
                <span className="text-lg">⚔️</span>
                <span className="ml-2">Proficiencies</span>
              </h4>
              <p className="text-indigo-800">{species.proficiencies}</p>
            </div>
          )}

          {/* Racial Traits */}
          {racialTraits.length > 0 && (
            <div className="bg-white border rounded-lg">
              <div className="bg-gray-100 px-6 py-4 border-b">
                <h4 className="font-semibold text-gray-900 text-lg flex items-center">
                  <span className="text-lg">✨</span>
                  <span className="ml-2">Racial Traits</span>
                </h4>
              </div>
              <div className="p-6 space-y-4">
                {racialTraits.map((trait, index) => (
                  <div key={index} className="border-l-4 border-red-600 pl-4">
                    <h5 className="font-semibold text-gray-900 mb-1">{trait.name}</h5>
                    <p className="text-gray-700 text-sm leading-relaxed">{trait.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subspecies Selection */}
          {hasSubspecies && (
            <div className="bg-white border rounded-lg">
              <div className="bg-gray-100 px-6 py-4 border-b">
                <h4 className="font-semibold text-gray-900 text-lg">Choose a Subspecies</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Customize your character with additional abilities and traits.
                </p>
              </div>
              <div className="p-6">
                <Select value={selectedSubspecies} onValueChange={setSelectedSubspecies}>
                  <SelectTrigger className="mb-4">
                    <SelectValue placeholder="Choose a subspecies (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {subspeciesData.map((sub) => (
                      <SelectItem key={sub.name} value={sub.name}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Subspecies Information */}
                {selectedSubspeciesData && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900 mb-2">{selectedSubspeciesData.name}</h5>
                    <p className="text-blue-800 text-sm mb-3">{selectedSubspeciesData.description}</p>
                    
                    {selectedSubspeciesData.bonuses && (
                      <div className="bg-blue-100 rounded p-3">
                        <h6 className="text-sm font-medium text-blue-900 mb-1">Additional Benefits</h6>
                        <p className="text-sm text-blue-800">{selectedSubspeciesData.bonuses}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Source Badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-xs">
              Source: {species.document__slug.toUpperCase()}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button onClick={handleSelect} className="flex-1 bg-red-600 hover:bg-red-700">
              Select {species.name}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpeciesDetailModal;
