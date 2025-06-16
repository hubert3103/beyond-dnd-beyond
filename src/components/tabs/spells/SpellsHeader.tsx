
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
    const levels = [...new Set(spells.map(s => s.level))].sort((a, b) => parseInt(a) - parseInt(b));
    const schools = [...new Set(spells.map(s => s.school).filter(Boolean))].sort();
    const classSet = new Set<string>();
    
    spells.forEach(spell => {
      if (spell.classes && Array.isArray(spell.classes)) {
        spell.classes.forEach(cls => {
          if (cls?.name) {
            classSet.add(cls.name);
          }
        });
      }
    });
    const classes = [...classSet].sort();

    return { levels, schools, classes };
  }, [spells]);

  return (
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
            onChange={(e) => onSearchChange(e.target.value)}
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
              <Button onClick={onClearFilters} variant="outline" className="w-full">
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
                          onFilterChange('levels', level, checked as boolean)
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
                          onFilterChange('schools', school, checked as boolean)
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
                          onFilterChange('classes', cls, checked as boolean)
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
    </div>
  );
};

export default SpellsHeader;
