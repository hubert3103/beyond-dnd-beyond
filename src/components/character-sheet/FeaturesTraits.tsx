
import { useState } from 'react';
import { ChevronDown, ChevronRight, Star, MessageSquare, Sword, User } from 'lucide-react';
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

    console.log('=== Features & Traits Debug ===');
    console.log('Character data:', character);
    console.log('Species data:', character.species_data);
    console.log('Class data:', character.class_data);
    console.log('Background data:', character.background_data);

    // Add species traits
    if (character.species_data) {
      console.log('Processing species data...');
      
      // Check for traits in different possible locations
      const traits = character.species_data.traits || 
                    character.species_data.apiData?.traits ||
                    (character.species_data.features ? Object.values(character.species_data.features) : []);
      
      console.log('Found species traits:', traits);
      
      if (Array.isArray(traits)) {
        traits.forEach((trait: any) => {
          features.push({
            id: trait.name || trait.index || `species-trait-${features.length}`,
            name: trait.name || 'Unnamed Trait',
            source: character.species_name || 'Species',
            description: trait.desc || trait.description || 'No description available.',
            type: 'species'
          });
        });
      }

      // Add speed as a feature if available
      if (character.species_data.speed || character.speed) {
        const speed = character.species_data.speed || character.speed;
        features.push({
          id: 'species-speed',
          name: 'Speed',
          source: character.species_name || 'Species',
          description: `Your base walking speed is ${speed} feet.`,
          type: 'species'
        });
      }

      // Add languages if available
      const languages = character.species_data.languages || 
                       character.species_data.apiData?.languages ||
                       character.species_data.starting_proficiencies?.languages;
      
      if (languages) {
        let languageDesc = '';
        if (typeof languages === 'string') {
          languageDesc = languages;
        } else if (Array.isArray(languages)) {
          languageDesc = languages.join(', ');
        } else if (languages.choose || languages.from) {
          languageDesc = `Choose ${languages.choose || 'some'} from: ${(languages.from || []).join(', ')}`;
        }
        
        if (languageDesc) {
          features.push({
            id: 'species-languages',
            name: 'Languages',
            source: character.species_name || 'Species',
            description: languageDesc,
            type: 'species'
          });
        }
      }
    }

    // Add class features
    if (character.class_data) {
      console.log('Processing class data...');
      
      // Check for features in different possible locations
      const classFeatures = character.class_data.features || 
                           character.class_data.apiData?.features ||
                           [];
      
      console.log('Found class features:', classFeatures);
      
      if (Array.isArray(classFeatures)) {
        classFeatures.forEach((feature: any) => {
          features.push({
            id: feature.name || feature.index || `class-feature-${features.length}`,
            name: feature.name || 'Unnamed Feature',
            source: character.class_name || 'Class',
            description: feature.desc || feature.description || 'No description available.',
            type: 'class'
          });
        });
      }

      // Add hit die as a feature
      if (character.class_data.hit_die) {
        features.push({
          id: 'class-hit-die',
          name: 'Hit Die',
          source: character.class_name || 'Class',
          description: `Your hit die is a d${character.class_data.hit_die}.`,
          type: 'class'
        });
      }

      // Add proficiencies
      const proficiencies = [];
      if (character.class_data.prof_armor) {
        proficiencies.push(`Armor: ${character.class_data.prof_armor}`);
      }
      if (character.class_data.prof_weapons) {
        proficiencies.push(`Weapons: ${character.class_data.prof_weapons}`);
      }
      if (character.class_data.prof_tools) {
        proficiencies.push(`Tools: ${character.class_data.prof_tools}`);
      }
      if (character.class_data.prof_saving_throws) {
        proficiencies.push(`Saving Throws: ${character.class_data.prof_saving_throws}`);
      }
      if (character.class_data.prof_skills) {
        proficiencies.push(`Skills: ${character.class_data.prof_skills}`);
      }

      if (proficiencies.length > 0) {
        features.push({
          id: 'class-proficiencies',
          name: 'Proficiencies',
          source: character.class_name || 'Class',
          description: proficiencies.join('. '),
          type: 'class'
        });
      }
    }

    // Add background features
    if (character.background_data) {
      console.log('Processing background data...');
      
      const bgFeature = character.background_data.feature || character.background_data.apiData?.feature;
      
      if (bgFeature) {
        features.push({
          id: bgFeature.name || 'background-feature',
          name: bgFeature.name || 'Background Feature',
          source: character.background_name || 'Background',
          description: bgFeature.desc || bgFeature.description || bgFeature.feature_desc || 'No description available.',
          type: 'background'
        });
      }

      // Add background skill proficiencies
      if (character.background_data.skill_proficiencies) {
        features.push({
          id: 'background-skills',
          name: 'Skill Proficiencies',
          source: character.background_name || 'Background',
          description: character.background_data.skill_proficiencies,
          type: 'background'
        });
      }

      // Add background languages
      if (character.background_data.languages) {
        features.push({
          id: 'background-languages',
          name: 'Languages',
          source: character.background_name || 'Background',
          description: character.background_data.languages,
          type: 'background'
        });
      }
    }

    console.log('Final features array:', features);
    console.log('=== End Features Debug ===');
    
    return features;
  };

  const features = getCharacterFeatures();

  const getSourceColor = (type: string) => {
    switch (type) {
      case 'species':
        return 'bg-green-100 text-green-800';
      case 'class':
        return 'bg-blue-100 text-blue-800';
      case 'background':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'species':
        return <User className="h-4 w-4" />;
      case 'class':
        return <Sword className="h-4 w-4" />;
      case 'background':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
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
                        {getSourceIcon(feature.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{feature.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${getSourceColor(feature.type)}`}>
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
