
import { useState } from 'react';
import { ChevronDown, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface FeaturesTraitsProps {
  character: any;
}

const FeaturesTraits = ({ character }: FeaturesTraitsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get features and traits from character's species, class, and background
  const getCharacterFeatures = () => {
    const features = [];

    // Add species traits
    if (character.species_data?.traits) {
      character.species_data.traits.forEach((trait: any) => {
        features.push({
          id: trait.name || trait.index,
          name: trait.name,
          source: character.species_name || 'Species',
          description: trait.desc || trait.description || 'No description available.'
        });
      });
    }

    // Add class features
    if (character.class_data?.features) {
      character.class_data.features.forEach((feature: any) => {
        features.push({
          id: feature.name || feature.index,
          name: feature.name,
          source: character.class_name || 'Class',
          description: feature.desc || feature.description || 'No description available.'
        });
      });
    }

    // Add background features
    if (character.background_data?.feature) {
      const bgFeature = character.background_data.feature;
      features.push({
        id: bgFeature.name || 'background-feature',
        name: bgFeature.name || 'Background Feature',
        source: character.background_name || 'Background',
        description: bgFeature.desc || bgFeature.description || 'No description available.'
      });
    }

    return features;
  };

  const features = getCharacterFeatures();

  const getSourceColor = (source: string) => {
    const lowerSource = source.toLowerCase();
    if (lowerSource.includes('elf') || lowerSource.includes('dwarf') || lowerSource.includes('human') || 
        lowerSource.includes('halfling') || lowerSource.includes('dragonborn') || lowerSource.includes('gnome') ||
        lowerSource.includes('half-orc') || lowerSource.includes('tiefling')) {
      return 'bg-green-100 text-green-800';
    }
    if (lowerSource.includes('barbarian') || lowerSource.includes('fighter') || lowerSource.includes('ranger') ||
        lowerSource.includes('paladin') || lowerSource.includes('monk') || lowerSource.includes('rogue')) {
      return 'bg-red-100 text-red-800';
    }
    if (lowerSource.includes('wizard') || lowerSource.includes('sorcerer') || lowerSource.includes('warlock') ||
        lowerSource.includes('bard') || lowerSource.includes('cleric') || lowerSource.includes('druid')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (lowerSource.includes('background')) {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-white rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-lg font-semibold">Features & Traits</span>
            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4 space-y-3">
          {features.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No features or traits found</p>
              <p className="text-sm">Features from your species, class, and background will appear here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="text-yellow-600">
                        <Star className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{feature.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${getSourceColor(feature.source)}`}>
                          {feature.source}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 leading-relaxed ml-7">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default FeaturesTraits;
