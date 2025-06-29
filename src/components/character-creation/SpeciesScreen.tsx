
import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useHybridData } from '../../hooks/useHybridData';
import { hybridDataService } from '../../services/hybridDataService';
import { Open5eRace } from '../../services/open5eApi';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import SpeciesDetailModal from './SpeciesDetailModal';

interface SpeciesScreenProps {
  data: any;
  onUpdate: (updates: any) => void;
}

const SpeciesScreen = ({ data, onUpdate }: SpeciesScreenProps) => {
  const { races, isLoading, error, refresh } = useHybridData();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [selectedRace, setSelectedRace] = useState<Open5eRace | null>(data.species?.apiData || null);
  const [detailModalSpecies, setDetailModalSpecies] = useState<Open5eRace | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const filteredRaces = useMemo(() => {
    if (!races.length) return [];
    
    let filtered = races;
    
    // Apply source filtering only if at least one source is enabled
    const hasSourceEnabled = data.sources?.coreRules || data.sources?.expansions || data.sources?.homebrew;
    
    if (hasSourceEnabled) {
      // Get available sources
      const availableSources = hybridDataService.getAvailableSources(races);
      
      // Define source categories based on actual document slugs from the API
      const coreRuleSources = ['wotc-srd'];
      const expansionSources = ['toh'];
      const homebrewSources = ['kp'];
      
      let allowedSources: string[] = [];
      
      if (data.sources?.coreRules) {
        allowedSources.push(...coreRuleSources);
      }
      if (data.sources?.expansions) {
        allowedSources.push(...expansionSources);
      }
      if (data.sources?.homebrew) {
        allowedSources.push(...homebrewSources);
      }
      
      // Filter by allowed sources
      filtered = races.filter(race => allowedSources.includes(race.document__slug));
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(race => 
        race.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [races, data.sources, searchTerm]);

  const racesBySource = useMemo(() => {
    const grouped: Record<string, Open5eRace[]> = {};
    filteredRaces.forEach(race => {
      const source = race.document__slug;
      if (!grouped[source]) {
        grouped[source] = [];
      }
      grouped[source].push(race);
    });
    return grouped;
  }, [filteredRaces]);

  const getSourceDisplayName = (source: string) => {
    switch (source) {
      case 'wotc-srd': return 'Core Rules (SRD)';
      case 'toh': return 'Tome of Heroes';
      case 'kp': return 'Kobold Press';
      case 'xge': return "Xanathar's Guide";
      case 'tce': return "Tasha's Cauldron";
      case 'vgm': return "Volo's Guide";
      case 'mtf': return "Mordenkainen's Tome";
      default: return source.toUpperCase();
    }
  };

  const toggleSource = (source: string) => {
    setExpandedSources(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  const toggleAllSources = (expand: boolean) => {
    const newState: Record<string, boolean> = {};
    Object.keys(racesBySource).forEach(source => {
      newState[source] = expand;
    });
    setExpandedSources(newState);
  };

  const handleSpeciesClick = (race: Open5eRace) => {
    setDetailModalSpecies(race);
    setIsDetailModalOpen(true);
  };

  const handleSelectRace = (race: Open5eRace, subspecies?: string) => {
    setSelectedRace(race);
    
    // Get subspecies ability bonuses
    const getSubspeciesAbilityBonus = (speciesName: string, subspeciesName?: string) => {
      if (!subspeciesName) return {};
      
      const subspeciesData: Record<string, Record<string, Record<string, number>>> = {
        'Elf': {
          'High Elf': { int: 1 },
          'Wood Elf': { wis: 1 },
          'Dark Elf (Drow)': { cha: 1 }
        },
        'Dwarf': {
          'Mountain Dwarf': { str: 2 },
          'Hill Dwarf': { wis: 1 }
        },
        'Halfling': {
          'Lightfoot Halfling': { cha: 1 },
          'Stout Halfling': { con: 1 }
        }
      };
      
      return subspeciesData[speciesName]?.[subspeciesName] || {};
    };

    const subspeciesBonus = getSubspeciesAbilityBonus(race.name, subspecies);
    
    onUpdate({ 
      species: {
        name: race.name,
        subspecies: subspecies,
        description: race.desc,
        traits: [race.traits, race.proficiencies].filter(Boolean),
        source: race.document__slug,
        abilityScoreIncrease: race.asi,
        speed: race.speed,
        languages: race.languages,
        size: race.size,
        subspeciesAbilityBonus: subspeciesBonus,
        apiData: race // Store the API data for persistence
      }
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading species data..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refresh} />;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Species</h1>
        <p className="text-gray-600">Select a species that will define your character's heritage and abilities</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search species..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Expand/Collapse All */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleAllSources(true)}
          className="flex-1"
        >
          Expand All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleAllSources(false)}
          className="flex-1"
        >
          Collapse All
        </Button>
      </div>

      {/* Species by Source */}
      <div className="space-y-4">
        {Object.entries(racesBySource).map(([source, sourceRaces]) => (
          <Collapsible
            key={source}
            open={expandedSources[source]}
            onOpenChange={() => toggleSource(source)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{getSourceDisplayName(source)}</div>
                  <div className="text-sm text-gray-600">{sourceRaces.length} species available</div>
                </div>
                {expandedSources[source] ? 
                  <ChevronDown className="h-5 w-5" /> : 
                  <ChevronRight className="h-5 w-5" />
                }
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2 space-y-2">
              {sourceRaces.map((race) => (
                <Card 
                  key={race.slug}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedRace?.slug === race.slug ? 'ring-2 ring-red-600 bg-red-50' : ''
                  }`}
                  onClick={() => handleSpeciesClick(race)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <img 
                          src="/avatarPlaceholder.svg" 
                          alt={race.name}
                          className="w-8 h-8"
                          style={{ filter: 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{race.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {race.desc.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">Size: {race.size}</span>
                          <span className="text-xs text-gray-500">Speed: {race.speed.walk} ft</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {filteredRaces.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No species found matching your criteria.</p>
          <p className="text-xs text-gray-400 mt-2">
            Try adjusting your source settings or search terms.
          </p>
        </div>
      )}

      {/* Species Detail Modal */}
      <SpeciesDetailModal
        species={detailModalSpecies}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onSelect={handleSelectRace}
      />
    </div>
  );
};

export default SpeciesScreen;

