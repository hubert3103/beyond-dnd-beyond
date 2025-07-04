
import { useState, useMemo } from 'react';
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
  
  // Helper function to extract level requirement from text
  const extractLevelRequirement = (text: string): number => {
    if (!text) return 1;
    
    // Look for patterns like "At 3rd level", "Starting at 2nd level", "Beginning at 9th level", etc.
    const levelPatterns = [
      /(?:at|starting at|beginning at)\s+(\d+)(?:st|nd|rd|th)\s+level/i,
      /level\s+(\d+)/i,
      /(\d+)(?:st|nd|rd|th)\s+level/i
    ];
    
    for (const pattern of levelPatterns) {
      const match = text.match(pattern);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    
    return 1; // Default to level 1 if no level requirement found
  };

  // Helper function to filter features by character level
  const filterFeaturesByLevel = (features: any[], characterLevel: number) => {
    return features.filter(feature => {
      const requiredLevel = extractLevelRequirement(feature.description);
      return requiredLevel <= characterLevel;
    });
  };

  // Parse traits from formatted text (markdown style)
  const parseTraitsFromText = (traitsText: string) => {
    const traits = [];
    
    // Ensure we have a string to work with
    if (!traitsText || typeof traitsText !== 'string') {
      return traits;
    }
    
    // Split by markdown bold headers like **_Name._**
    const traitSections = traitsText.split(/\*\*_([^_]+)\._\*\*/);
    
    for (let i = 1; i < traitSections.length; i += 2) {
      const name = traitSections[i];
      const description = traitSections[i + 1]?.trim() || '';
      
      if (name && description) {
        traits.push({
          name: name,
          description: description.replace(/^\s*\*\s*/, '').trim() // Remove leading asterisk
        });
      }
    }
    
    return traits;
  };

  // Parse class features from description text
  const parseClassFeaturesFromDescription = (description: string) => {
    const features = [];
    
    // Split by markdown headers (### Feature Name)
    const sections = description.split(/### ([^\n]+)/);
    
    for (let i = 1; i < sections.length; i += 2) {
      const name = sections[i]?.trim();
      const desc = sections[i + 1]?.trim();
      
      if (name && desc) {
        features.push({
          name: name,
          description: desc.replace(/\n\n/g, '\n').trim()
        });
      }
    }
    
    return features;
  };
  
  // Memoize the character features to prevent unnecessary recalculations
  const features = useMemo(() => {
    const characterFeatures = [];

    // Add species traits
    if (character.species_data || character.species) {
      // Get traits from multiple possible locations
      const traitsData = character.species_data?.traits || 
                        character.species_data?.apiData?.traits ||
                        character.species?.apiData?.traits ||
                        character.species?.traits;
      
      if (traitsData) {
        // Handle both string and array formats
        let traitsText = '';
        
        if (Array.isArray(traitsData)) {
          // If it's an array, join the elements
          traitsText = traitsData.join('\n\n');
        } else if (typeof traitsData === 'string') {
          traitsText = traitsData;
        }
        
        if (traitsText) {
          // Parse the traits text which contains multiple traits separated by markdown headers
          const parsedTraits = parseTraitsFromText(traitsText);
          parsedTraits.forEach((trait, index) => {
            characterFeatures.push({
              id: `species-trait-${index}`,
              name: trait.name,
              source: character.species_name || character.species?.name || 'Species',
              description: trait.description,
              type: 'species'
            });
          });
        }
      }

      // Add ability score increases
      const asi = character.species_data?.asi || character.species?.apiData?.asi || character.species?.abilityScoreIncrease;
      if (asi && Array.isArray(asi)) {
        const asiDescription = asi.map(increase => 
          `+${increase.value} to ${increase.attributes?.join(', ') || 'abilities'}`
        ).join(', ');
        
        characterFeatures.push({
          id: 'species-asi',
          name: 'Ability Score Increase',
          source: character.species_name || character.species?.name || 'Species',
          description: asiDescription,
          type: 'species'
        });
      }

      // Add speed as a feature if available
      const speedData = character.species_data?.speed || 
                       character.species?.apiData?.speed || 
                       character.species?.speed || 
                       character.speed;
      
      if (speedData) {
        let speedDescription = '';
        if (typeof speedData === 'object' && speedData.walk) {
          speedDescription = `Your base walking speed is ${speedData.walk} feet.`;
        } else if (typeof speedData === 'number') {
          speedDescription = `Your base walking speed is ${speedData} feet.`;
        }
        
        if (speedDescription) {
          characterFeatures.push({
            id: 'species-speed',
            name: 'Speed',
            source: character.species_name || character.species?.name || 'Species',
            description: speedDescription,
            type: 'species'
          });
        }
      }

      // Add size
      const size = character.species_data?.size || character.species?.apiData?.size || character.species?.size;
      if (size) {
        characterFeatures.push({
          id: 'species-size',
          name: 'Size',
          source: character.species_name || character.species?.name || 'Species',
          description: `You are ${size.toLowerCase()} size.`,
          type: 'species'
        });
      }

      // Add languages if available
      const languages = character.species_data?.languages || 
                       character.species?.apiData?.languages ||
                       character.species?.languages;
      
      if (languages) {
        characterFeatures.push({
          id: 'species-languages',
          name: 'Languages',
          source: character.species_name || character.species?.name || 'Species',
          description: languages,
          type: 'species'
        });
      }
    }

    // Add class features
    if (character.class_data) {
      // Add class description which contains the features
      if (character.class_data.description) {
        const classFeatures = parseClassFeaturesFromDescription(character.class_data.description);
        classFeatures.forEach((feature, index) => {
          characterFeatures.push({
            id: `class-feature-${index}`,
            name: feature.name,
            source: character.class_name || 'Class',
            description: feature.description,
            type: 'class'
          });
        });
      }

      // Add hit die as a feature
      if (character.class_data.hit_die) {
        characterFeatures.push({
          id: 'class-hit-die',
          name: 'Hit Die',
          source: character.class_name || 'Class',
          description: `Your hit die is a d${character.class_data.hit_die}.`,
          type: 'class'
        });
      }

      // Add proficiencies
      const proficiencies = character.class_data.proficiencies;
      if (proficiencies) {
        const profList = [];
        if (proficiencies.armor) profList.push(`Armor: ${proficiencies.armor}`);
        if (proficiencies.weapons) profList.push(`Weapons: ${proficiencies.weapons}`);
        if (proficiencies.tools) profList.push(`Tools: ${proficiencies.tools}`);
        if (proficiencies.savingThrows) profList.push(`Saving Throws: ${proficiencies.savingThrows}`);
        if (proficiencies.skills) profList.push(`Skills: ${proficiencies.skills}`);

        if (profList.length > 0) {
          characterFeatures.push({
            id: 'class-proficiencies',
            name: 'Proficiencies',
            source: character.class_name || 'Class',
            description: profList.join('. '),
            type: 'class'
          });
        }
      }
    }

    // Add background features
    if (character.background_data) {
      // Add background feature
      if (character.background_data.feature || character.background_data.feature_desc) {
        characterFeatures.push({
          id: 'background-feature',
          name: 'Background Feature',
          source: character.background_name || 'Background',
          description: character.background_data.feature_desc || character.background_data.feature || 'Background feature',
          type: 'background'
        });
      }

      // Add background skill proficiencies
      if (character.background_data.skill_proficiencies) {
        characterFeatures.push({
          id: 'background-skills',
          name: 'Skill Proficiencies',
          source: character.background_name || 'Background',
          description: character.background_data.skill_proficiencies,
          type: 'background'
        });
      }

      // Add background languages
      if (character.background_data.languages) {
        characterFeatures.push({
          id: 'background-languages',
          name: 'Languages',
          source: character.background_name || 'Background',
          description: character.background_data.languages,
          type: 'background'
        });
      }
    }
    
    // Filter features by character level
    return filterFeaturesByLevel(characterFeatures, character.level || 1);
  }, [character.species_data, character.species, character.class_data, character.background_data, character.level, character.species_name, character.class_name, character.background_name]);

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
                  
                  <p className="text-sm text-gray-700 leading-relaxed ml-7 whitespace-pre-line">
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
