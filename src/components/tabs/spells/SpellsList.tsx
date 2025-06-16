
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LoaderCircle } from 'lucide-react';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { Open5eSpell } from '../../../services/open5eApi';

interface SpellsListProps {
  spells: Open5eSpell[];
  searchTerm: string;
  filters: {
    levels: string[];
    schools: string[];
    classes: string[];
  };
  onSpellSelect: (spell: Open5eSpell) => void;
  onAddToCharacter: () => void;
}

const SpellsList = ({
  spells,
  searchTerm,
  filters,
  onSpellSelect,
  onAddToCharacter
}: SpellsListProps) => {
  // Helper function to safely get spell class names
  const getSpellClassNames = (spell: Open5eSpell): string[] => {
    if (!spell.classes || !Array.isArray(spell.classes)) {
      return [];
    }
    return spell.classes
      .map(cls => cls?.name || '')
      .filter(name => name.length > 0)
      .map(name => name.toLowerCase());
  };

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

      // Class filter - using the helper function
      if (filters.classes.length > 0) {
        const spellClassNames = getSpellClassNames(spell);
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

  // Use infinite scroll hook with proper typing
  const { displayedItems, isLoading: isLoadingMore, hasMore, handleScroll } = useInfiniteScroll({
    items: filteredAndSortedSpells,
    itemsPerPage: 100
  });

  // Type assert the displayedItems to be Open5eSpell[]
  const displayedSpells = displayedItems as Open5eSpell[];

  // Group spells by level - memoized separately for better performance
  const groupedSpells = useMemo(() => {
    return displayedSpells.reduce((acc, spell) => {
      const levelKey = spell.level === '0' ? 'Cantrips' : `Level ${spell.level}`;
      if (!acc[levelKey]) acc[levelKey] = [];
      acc[levelKey].push(spell);
      return acc;
    }, {} as Record<string, Open5eSpell[]>);
  }, [displayedSpells]);

  const getSpellComponents = (spell: Open5eSpell) => {
    return spell.components || '';
  };

  return (
    <>
      {/* Header with count */}
      <div className="bg-[#4a4a4a] px-4 pb-4">
        <div className="flex justify-between items-center">
          <span className="text-white font-medium">
            Showing {displayedSpells.length} of {filteredAndSortedSpells.length} spells
            {filteredAndSortedSpells.length !== spells.length && ` (${spells.length} total)`}
          </span>
        </div>
      </div>

      {/* Scrollable Content with hidden scrollbars */}
      <div 
        className="flex-1 overflow-y-auto scrollbar-hide p-4" 
        onScroll={handleScroll}
        style={{ 
          maxHeight: 'calc(100vh - 200px)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {Object.entries(groupedSpells).map(([level, levelSpells]) => (
          <div key={level} className="mb-6">
            <h3 className="text-white font-bold mb-3">{level}</h3>
            <div className="space-y-2">
              {levelSpells.map((spell, index) => (
                <Card key={`${spell.slug}-${index}`} className="bg-white rounded-lg">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => onSpellSelect(spell)}
                    >
                      <h4 className="font-bold text-gray-900">{spell.name}</h4>
                      <p className="text-sm text-gray-600">{spell.school}</p>
                      <p className="text-sm text-gray-600">
                        {spell.casting_time} • {spell.range} • {getSpellComponents(spell)}
                      </p>
                    </div>
                    <button
                      onClick={onAddToCharacter}
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
          <div className="flex flex-col items-center justify-center py-8">
            <LoaderCircle className="h-8 w-8 animate-spin text-white mb-2" />
            <p className="text-white text-sm">Loading more spells...</p>
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
    </>
  );
};

export default SpellsList;
