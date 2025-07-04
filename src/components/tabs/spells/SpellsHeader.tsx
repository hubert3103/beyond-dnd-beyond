
import { useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Open5eSpell } from '../../../services/open5eApi';

interface SpellsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    levels: string[];
    schools: string[];
    classes: string[];
  };
  onFilterChange: (filterType: 'levels' | 'schools' | 'classes', value: string, checked: boolean) => void;
  onClearFilters: () => void;
  spells: Open5eSpell[];
}

const SpellsHeader = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
  spells
}: SpellsHeaderProps) => {
  // Get unique values for filters - memoized for performance
  const filterOptions = useMemo(() => {
    console.log('Processing spells for filters:', spells.length);
    console.log('Sample spell:', spells[0]);
    
    // Get unique levels and sort them properly (Cantrip first, then 1st-9th)
    const levelSet = new Set<string>();
    const schoolSet = new Set<string>();
    
    spells.forEach(spell => {
      // Add level
      if (spell.level !== undefined && spell.level !== null) {
        levelSet.add(String(spell.level));
      }
      
      // Add school
      if (spell.school) {
        schoolSet.add(spell.school);
      }
    });
    
    // Sort levels: Cantrip first, then 1st-level through 9th-level
    const levels = Array.from(levelSet).sort((a, b) => {
      // Handle "Cantrip" specially - it should be first
      if (a === 'Cantrip' && b !== 'Cantrip') return -1;
      if (a !== 'Cantrip' && b === 'Cantrip') return 1;
      if (a === 'Cantrip' && b === 'Cantrip') return 0;
      
      // For non-cantrip levels, extract the number and sort numerically
      const getNumFromLevel = (level: string) => {
        const match = level.match(/(\d+)/);
        return match ? parseInt(match[1]) : 999;
      };
      
      return getNumFromLevel(a) - getNumFromLevel(b);
    });
    
    const schools = Array.from(schoolSet).sort();

    console.log('Filter options generated:', { 
      levels: levels.length, 
      schools: schools.length
    });
    console.log('Level values:', levels);
    console.log('School values:', schools);
    
    return { levels, schools };
  }, [spells]);

  return (
    <div className="bg-[#4a4a4a] p-4 border-b border-gray-600">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">Spells & Magic</h1>
        <p className="text-gray-200">Browse spells from D&D 5e sources</p>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search spells..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white text-gray-900 placeholder-gray-500"
          />
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-white">
            <SheetHeader>
              <SheetTitle className="text-gray-900">Filter Spells</SheetTitle>
            </SheetHeader>
            
            <div className="space-y-6 mt-6">
              <Button onClick={onClearFilters} variant="outline" className="w-full">
                Clear All Filters
              </Button>

              {/* Level Filter */}
              <div>
                <h3 className="font-medium mb-3 text-gray-900">Spell Level</h3>
                <div className="space-y-2">
                  {filterOptions.levels.map(level => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={`level-${level}`}
                        checked={filters.levels.includes(level)}
                        onCheckedChange={(checked) => 
                          onFilterChange('levels', level, checked as boolean)
                        }
                      />
                      <label htmlFor={`level-${level}`} className="text-sm text-gray-700">
                        {level === 'Cantrip' ? 'Cantrip' : level}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* School Filter */}
              <div>
                <h3 className="font-medium mb-3 text-gray-900">School</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {filterOptions.schools.map(school => (
                    <div key={school} className="flex items-center space-x-2">
                      <Checkbox
                        id={`school-${school}`}
                        checked={filters.schools.includes(school)}
                        onCheckedChange={(checked) => 
                          onFilterChange('schools', school, checked as boolean)
                        }
                      />
                      <label htmlFor={`school-${school}`} className="text-sm text-gray-700">
                        {school}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default SpellsHeader;
