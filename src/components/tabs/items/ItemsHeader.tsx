
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ItemsFilters from './ItemsFilters';

interface ItemsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSources: string[];
  onSourceFilterChange: (source: string, checked: boolean) => void;
  availableSources: string[];
  selectedRarities: string[];
  onRarityFilterChange: (rarity: string, checked: boolean) => void;
  availableRarities: string[];
  displayedCount: number;
  filteredCount: number;
  totalCount: number;
}

const ItemsHeader = ({
  searchTerm,
  onSearchChange,
  selectedSources,
  onSourceFilterChange,
  availableSources,
  selectedRarities,
  onRarityFilterChange,
  availableRarities,
  displayedCount,
  filteredCount,
  totalCount
}: ItemsHeaderProps) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-[#4a4a4a] p-4 border-b border-gray-600">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">Equipment & Items</h1>
        <p className="text-gray-200">Browse equipment from D&D 5e sources</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <ItemsFilters
            availableSources={availableSources}
            selectedSources={selectedSources}
            onSourceFilterChange={onSourceFilterChange}
            availableRarities={availableRarities}
            selectedRarities={selectedRarities}
            onRarityFilterChange={onRarityFilterChange}
          />
        )}
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-200 mt-4">
        Showing {displayedCount} of {filteredCount} items
        {filteredCount !== totalCount && ` (${totalCount} total)`}
      </div>
    </div>
  );
};

export default ItemsHeader;
