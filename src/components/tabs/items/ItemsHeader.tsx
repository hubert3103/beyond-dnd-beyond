
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ItemsFilters from './ItemsFilters';

interface ItemsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: 'name' | 'rarity' | 'type';
  onSortChange: (value: 'name' | 'rarity' | 'type') => void;
  selectedSources: string[];
  onSourceFilterChange: (source: string, checked: boolean) => void;
  availableSources: string[];
  displayedCount: number;
  filteredCount: number;
  totalCount: number;
}

const ItemsHeader = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedSources,
  onSourceFilterChange,
  availableSources,
  displayedCount,
  filteredCount,
  totalCount
}: ItemsHeaderProps) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-[#4a4a4a] p-4 border-b border-gray-600">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">Equipment & Items</h1>
        <p className="text-gray-300">Browse equipment from D&D 5e sources</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 bg-white text-gray-700 border-gray-300"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
          
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-32 bg-white text-gray-700 border-gray-300">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="rarity">Rarity</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <ItemsFilters
            availableSources={availableSources}
            selectedSources={selectedSources}
            onSourceFilterChange={onSourceFilterChange}
          />
        )}
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-300 mt-4">
        Showing {displayedCount} of {filteredCount} items
        {filteredCount !== totalCount && ` (${totalCount} total)`}
      </div>
    </div>
  );
};

export default ItemsHeader;
