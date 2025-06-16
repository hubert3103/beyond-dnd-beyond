
import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { useOpen5eData } from '../../hooks/useOpen5eData';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { Open5eSpell } from '../../services/open5eApi';
import LoadingSpinner from '../character-creation/LoadingSpinner';
import ErrorMessage from '../character-creation/ErrorMessage';

const SpellsTab = () => {
  const { spells, isLoading, error, refresh } = useOpen5eData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpell, setSelectedSpell] = useState<Open5eSpell | null>(null);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [filters, setFilters] = useState({
    levels: [] as string[],
    schools: [] as string[],
    classes: [] as string[],
  });

  // Get unique values for filters - memoized for performance
  const filterOptions = useMemo(() => {
    const levels = [...new Set(spells.map(s => s.level))].sort((a, b) => parseInt(a) - parseInt(b));
    const schools = [...new Set(spells.map(s => s.school).filter(Boolean))].sort();
    const classSet = new Set<string>();
    spells.forEach(spell => {
      if (spell.classes && Array.isArray(spell.classes)) {
        spell.classes.forEach(cls => classSet.add(cls.name));
      }
    });
    const classes = [...classSet].sort();

    return { levels, schools, classes };
  }, [spells]);

  // Optimized filtering and sorting - only recalculates when dependencies change
  const filteredAndSortedSpells = useMemo(() => {
    console.log('Filtering and sorting spells...');
    
    let filtered = spells.filter(spell => {
      // Search filter
      if (searchTerm && !spell.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Level filter
      if (filters.levels.length > 0 && !filters.levels.includes(spell.level)) {
        return false;
      }

      // School filter
      if (filters.schools.length > 0 && !filters.schools.includes(spell.school)) {
        return false;
      }

      // Class filter
      if (filters.classes.length > 0) {
        const spellClassNames = spell.classes && Array.isArray(spell.classes) 
          ? spell.classes.map(cls => cls.name.toLowerCase()) 
          : [];
        const hasMatchingClass = filters.classes.some(cls => 
          spellClassNames.includes(cls.toLowerCase())
        );
        if (!hasMatchingClass) return false;
      }

      return true;
    });

    // Sort by spell level (cantrip to 9)
    filtered.sort((a, b) => {
      const levelA = parseInt(a.level);
      const levelB = parseInt(b.level);
      if (levelA !== levelB) {
        return levelA - levelB;
      }
      // If same level, sort alphabetically by name
      return a.name.localeCompare(b.name);
    });

    console.log(`Filtered ${filtered.length} spells from ${spells.length} total`);
    return filtered;
  }, [spells, searchTerm, filters]);

  // Use infinite scroll hook
  const { displayedItems: displayedSpells, isLoading: isLoadingMore, hasMore, handleScroll } = useInfiniteScroll({
    items: filteredAndSortedSpells,
    itemsPerPage: 100
  });

  // Group spells by level - memoized separately for better performance
  const groupedSpells = useMemo(() => {
    return displayedSpells.reduce((acc, spell) => {
      const levelKey = spell.level === '0' ? 'Cantrips' : `Level ${spell.level}`;
      if (!acc[levelKey]) acc[levelKey] = [];
      acc[levelKey].push(spell);
      return acc;
    }, {} as Record<string, Open5eSpell[]>);
  }, [displayedSpells]);

  const handleFilterChange = (filterType: keyof typeof filters, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked 
        ? [...prev[filterType], value]
        : prev[filterType].filter(item => item !== value)
    }));
  };

  const clearFilters = () => {
    setFilters({ levels: [], schools: [], classes: [] });
  };

  const getSpellComponents = (spell: Open5eSpell) => {
    return spell.components || '';
  };

  const getSpellClasses = (spell: Open5eSpell) => {
    return spell.classes && Array.isArray(spell.classes) 
      ? spell.classes.map(cls => cls.name).join(', ') 
      : '';
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading spells..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refresh} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header with search and filter */}
      <div className="sticky top-0 z-10 bg-[#4a4a4a] p-4 border-b border-gray-600">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-white mb-2">Spells & Magic</h1>
          <p className="text-gray-300">Browse spells from D&D 5e sources</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search spells..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white border-gray-300">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Filter Spells</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                <Button onClick={clearFilters} variant="outline" className="w-full">
                  Clear All Filters
                </Button>

                {/* Level Filter */}
                <div>
                  <h3 className="font-medium mb-3">Spell Level</h3>
                  <div className="space-y-2">
                    {filterOptions.levels.map(level => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox
                          id={`level-${level}`}
                          checked={filters.levels.includes(level)}
                          onCheckedChange={(checked) => 
                            handleFilterChange('levels', level, checked as boolean)
                          }
                        />
                        <label htmlFor={`level-${level}`} className="text-sm">
                          {level === '0' ? 'Cantrip' : `Level ${level}`}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* School Filter */}
                <div>
                  <h3 className="font-medium mb-3">School</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filterOptions.schools.map(school => (
                      <div key={school} className="flex items-center space-x-2">
                        <Checkbox
                          id={`school-${school}`}
                          checked={filters.schools.includes(school)}
                          onCheckedChange={(checked) => 
                            handleFilterChange('schools', school, checked as boolean)
                          }
                        />
                        <label htmlFor={`school-${school}`} className="text-sm">
                          {school}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Class Filter */}
                <div>
                  <h3 className="font-medium mb-3">Classes</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filterOptions.classes.map(cls => (
                      <div key={cls} className="flex items-center space-x-2">
                        <Checkbox
                          id={`class-${cls}`}
                          checked={filters.classes.includes(cls)}
                          onCheckedChange={(checked) => 
                            handleFilterChange('classes', cls, checked as boolean)
                          }
                        />
                        <label htmlFor={`class-${cls}`} className="text-sm">
                          {cls}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex justify-between items-center mt-4">
          <span className="text-white font-medium">
            Showing {displayedSpells.length} of {filteredAndSortedSpells.length} spells
            {filteredAndSortedSpells.length !== spells.length && ` (${spells.length} total)`}
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4" onScroll={handleScroll}>
        {Object.entries(groupedSpells).map(([level, levelSpells]) => (
          <div key={level} className="mb-6">
            <h3 className="text-white font-bold mb-3">{level}</h3>
            <div className="space-y-2">
              {levelSpells.map((spell, index) => (
                <Card key={`${spell.slug}-${index}`} className="bg-white rounded-lg">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => setSelectedSpell(spell)}
                    >
                      <h4 className="font-bold text-gray-900">{spell.name}</h4>
                      <p className="text-sm text-gray-600">{spell.school}</p>
                      <p className="text-sm text-gray-600">
                        {spell.casting_time} • {spell.range} • {getSpellComponents(spell)}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCharacterSelect(true)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                    >
                      +
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoadingMore && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <p className="text-white mt-2">Loading more spells...</p>
          </div>
        )}

        {/* End of results indicator */}
        {!hasMore && displayedSpells.length > 0 && (
          <div className="text-center py-4">
            <p className="text-gray-300">You've reached the end of the results</p>
          </div>
        )}

        {filteredAndSortedSpells.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-300">No spells found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Spell Detail Modal */}
      {selectedSpell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedSpell.name}</h3>
            <div className="space-y-2 mb-4">
              <p className="text-gray-600">
                <strong>Level:</strong> {selectedSpell.level === '0' ? 'Cantrip' : selectedSpell.level}
              </p>
              <p className="text-gray-600"><strong>School:</strong> {selectedSpell.school}</p>
              <p className="text-gray-600"><strong>Casting Time:</strong> {selectedSpell.casting_time}</p>
              <p className="text-gray-600"><strong>Range:</strong> {selectedSpell.range}</p>
              <p className="text-gray-600"><strong>Duration:</strong> {selectedSpell.duration}</p>
              <p className="text-gray-600"><strong>Components:</strong> {getSpellComponents(selectedSpell)}</p>
              {selectedSpell.material && (
                <p className="text-gray-600"><strong>Materials:</strong> {selectedSpell.material}</p>
              )}
              {selectedSpell.classes && Array.isArray(selectedSpell.classes) && selectedSpell.classes.length > 0 && (
                <p className="text-gray-600">
                  <strong>Classes:</strong> {selectedSpell.classes.map(cls => cls.name).join(', ')}
                </p>
              )}
              {selectedSpell.concentration && (
                <p className="text-gray-600"><strong>Concentration:</strong> Yes</p>
              )}
              {selectedSpell.ritual && (
                <p className="text-gray-600"><strong>Ritual:</strong> Yes</p>
              )}
            </div>
            <div className="mb-6">
              <p className="text-gray-600 whitespace-pre-wrap">{selectedSpell.desc}</p>
              {selectedSpell.higher_level && (
                <div className="mt-4">
                  <strong className="text-gray-900">At Higher Levels:</strong>
                  <p className="text-gray-600">{selectedSpell.higher_level}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedSpell(null)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Character Select Modal */}
      {showCharacterSelect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add to Character</h3>
            <div className="space-y-2 mb-4">
              <button className="w-full text-left p-3 bg-gray-100 rounded-lg hover:bg-gray-200">
                Thalara Brightbranch
              </button>
              <button className="w-full text-left p-3 bg-gray-100 rounded-lg hover:bg-gray-200">
                Magnus Ironmantle
              </button>
              <button className="w-full text-left p-3 bg-gray-100 rounded-lg hover:bg-gray-200">
                Ziri Shadowveil
              </button>
            </div>
            <button
              onClick={() => setShowCharacterSelect(false)}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpellsTab;
