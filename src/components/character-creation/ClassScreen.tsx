
import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Shield, Sword, Wand2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useOpen5eData } from '../../hooks/useOpen5eData';
import { open5eApi, Open5eClass } from '../../services/open5eApi';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface ClassScreenProps {
  data: any;
  onUpdate: (updates: any) => void;
}

const ClassScreen = ({ data, onUpdate }: ClassScreenProps) => {
  const { classes, isLoading, error, refresh } = useOpen5eData();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [selectedClass, setSelectedClass] = useState<Open5eClass | null>(data.class);

  const filteredClasses = useMemo(() => {
    console.log('All classes:', classes.length);
    console.log('Data sources:', data.sources);
    
    if (!classes.length) return [];
    
    // Get all available sources from the data
    const availableSources = open5eApi.getAvailableSources(classes);
    console.log('Available sources in classes:', availableSources);
    
    // If no specific sources are enabled, or coreRules is enabled, include 5esrd
    const enabledSources: string[] = [];
    
    if (data.sources?.coreRules !== false) {
      enabledSources.push('5esrd', 'cc', 'kp');
    }
    
    if (data.sources?.expansions) {
      enabledSources.push('tce', 'xge', 'vgm', 'mtf');
    }
    
    if (data.sources?.homebrew) {
      enabledSources.push('homebrew');
    }
    
    // If no specific filtering, show all
    if (enabledSources.length === 0) {
      enabledSources.push(...availableSources);
    }
    
    console.log('Enabled sources:', enabledSources);
    
    let filtered = open5eApi.filterBySource(classes, enabledSources);
    console.log('Filtered by source:', filtered.length);
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(cls => 
        cls.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('Filtered by search:', filtered.length);
    }
    
    return filtered;
  }, [classes, data.sources, searchTerm]);

  const classesBySource = useMemo(() => {
    const grouped: Record<string, Open5eClass[]> = {};
    filteredClasses.forEach(cls => {
      const source = cls.document__slug;
      if (!grouped[source]) {
        grouped[source] = [];
      }
      grouped[source].push(cls);
    });
    return grouped;
  }, [filteredClasses]);

  const getSourceDisplayName = (source: string) => {
    switch (source) {
      case '5esrd': return 'Core Rules (SRD)';
      case 'cc': return 'Core Rules (CC)';
      case 'kp': return 'Kobold Press';
      case 'xge': return "Xanathar's Guide";
      case 'tce': return "Tasha's Cauldron";
      case 'vgm': return "Volo's Guide";
      case 'mtf': return "Mordenkainen's Tome";
      default: return source.toUpperCase();
    }
  };

  const getClassIcon = (className: string) => {
    const name = className.toLowerCase();
    if (['fighter', 'barbarian', 'paladin'].includes(name)) return Shield;
    if (['rogue', 'ranger', 'monk'].includes(name)) return Sword;
    return Wand2;
  };

  const toggleSource = (source: string) => {
    setExpandedSources(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  const toggleAllSources = (expand: boolean) => {
    const newState: Record<string, boolean> = {};
    Object.keys(classesBySource).forEach(source => {
      newState[source] = expand;
    });
    setExpandedSources(newState);
  };

  const handleSelectClass = (cls: Open5eClass) => {
    setSelectedClass(cls);
    onUpdate({ 
      class: {
        name: cls.name,
        description: cls.desc,
        hitDie: cls.hit_die,
        proficiencies: {
          armor: cls.prof_armor,
          weapons: cls.prof_weapons,
          tools: cls.prof_tools,
          savingThrows: cls.prof_saving_throws,
          skills: cls.prof_skills
        },
        equipment: cls.equipment,
        spellcastingAbility: cls.spellcasting_ability,
        source: cls.document__slug,
        features: [] // Will be populated with level 1 features
      }
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading class data..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refresh} />;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Class</h1>
        <p className="text-gray-600">Select a class that defines your character's abilities and role</p>
      </div>

      {/* Debug info */}
      <div className="text-sm text-gray-500 bg-gray-100 p-2 rounded">
        Debug: {classes.length} total classes, {filteredClasses.length} after filtering
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search classes..."
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

      {/* Classes by Source */}
      <div className="space-y-4">
        {Object.entries(classesBySource).map(([source, sourceClasses]) => (
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
                  <div className="text-sm text-gray-600">{sourceClasses.length} classes available</div>
                </div>
                {expandedSources[source] ? 
                  <ChevronDown className="h-5 w-5" /> : 
                  <ChevronRight className="h-5 w-5" />
                }
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2 space-y-2">
              {sourceClasses.map((cls) => {
                const IconComponent = getClassIcon(cls.name);
                return (
                  <Card 
                    key={cls.slug}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedClass?.slug === cls.slug ? 'ring-2 ring-red-600 bg-red-50' : ''
                    }`}
                    onClick={() => handleSelectClass(cls)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{cls.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {cls.desc.replace(/<[^>]*>/g, '').substring(0, 100)}...
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">Hit Die: d{cls.hit_die}</span>
                            {cls.spellcasting_ability && (
                              <span className="text-xs text-blue-600">Spellcaster</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No classes found matching your criteria.</p>
          <p className="text-xs text-gray-400 mt-2">
            Try adjusting your source settings or search terms.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassScreen;
