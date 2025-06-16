
import { Card, CardContent } from '@/components/ui/card';
import { LoaderCircle } from 'lucide-react';
import { Open5eEquipment } from '../../../services/open5eApi';

interface ItemsListProps {
  displayedEquipment: Open5eEquipment[];
  isLoadingMore: boolean;
  hasMore: boolean;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onItemSelect: (item: Open5eEquipment) => void;
  onAddToCharacter: (item: Open5eEquipment) => void;
  filteredCount: number;
  totalCount: number;
}

const ItemsList = ({
  displayedEquipment,
  isLoadingMore,
  hasMore,
  handleScroll,
  onItemSelect,
  onAddToCharacter,
  filteredCount,
  totalCount
}: ItemsListProps) => {
  return (
    <div 
      className="flex-1 overflow-y-auto scrollbar-hide p-4" 
      onScroll={handleScroll}
      style={{ 
        maxHeight: 'calc(100vh - 300px)',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      {/* Equipment List */}
      <div className="space-y-2">
        {displayedEquipment.map((item) => (
          <Card 
            key={item.slug}
            className="cursor-pointer transition-colors hover:bg-gray-50"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => onItemSelect(item)}
                >
                  <h4 className="font-bold text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.type}</p>
                  <p className="text-sm text-gray-600 capitalize">{item.rarity}</p>
                  <div className="flex items-center justify-between mt-2">
                    {item.cost && (
                      <span className="text-xs text-gray-500">
                        Cost: {item.cost.quantity} {item.cost.unit}
                      </span>
                    )}
                    {item.weight && (
                      <span className="text-xs text-gray-500">Weight: {item.weight} lb</span>
                    )}
                    {item.requires_attunement && (
                      <span className="text-xs text-blue-600">Requires Attunement</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onAddToCharacter(item)}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading indicator */}
      {isLoadingMore && (
        <div className="flex flex-col items-center justify-center py-8">
          <LoaderCircle className="h-8 w-8 animate-spin text-white mb-2" />
          <p className="text-white text-sm">Loading more equipment...</p>
        </div>
      )}

      {/* End of results indicator */}
      {!hasMore && displayedEquipment.length > 0 && (
        <div className="text-center py-4">
          <p className="text-gray-300">You've reached the end of the results</p>
        </div>
      )}

      {filteredCount === 0 && totalCount > 0 && (
        <div className="text-center py-8">
          <p className="text-white">No equipment found matching your search.</p>
          <p className="text-xs text-gray-400 mt-2">
            Try adjusting your search terms or filter settings.
          </p>
        </div>
      )}

      {totalCount === 0 && (
        <div className="text-center py-8">
          <p className="text-white">No equipment data available.</p>
          <p className="text-xs text-gray-400 mt-2">
            Equipment data may still be loading or there was an error fetching it.
          </p>
        </div>
      )}
    </div>
  );
};

export default ItemsList;
