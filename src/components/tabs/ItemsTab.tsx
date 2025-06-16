
import { useState, useMemo } from 'react';
import { Search, Filter, LoaderCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOpen5eData } from '../../hooks/useOpen5eData';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { open5eApi, Open5eEquipment } from '../../services/open5eApi';
import LoadingSpinner from '../character-creation/LoadingSpinner';
import ErrorMessage from '../character-creation/ErrorMessage';

const ItemsTab = () => {
  const { equipment, isLoading, error, refresh } = useOpen5eData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Open5eEquipment | null>(null);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'type'>('rarity');

  // Memoize available sources for better performance
  const availableSources = useMemo(() => {
    const sources = open5eApi.getAvailableSources(equipment);
    console.log('Available sources:', sources);
    return sources;
  }, [equipment]);

  // Optimized rarity ordering function
  const getRarityOrder = (rarity: string) => {
    const rarityMap: Record<string, number> = {
      'common': 1,
      'uncommon': 2,
      'rare': 3,
      'very rare': 4,
      'legendary': 5,
      'artifact': 6
    };
    return rarityMap[rarity.toLowerCase()] || 0;
  };

  // Optimized filtering and sorting - only recalculates when dependencies change
  const filteredEquipment = useMemo(() => {
    console.log('Filtering and sorting equipment...');
    console.log('All equipment:', equipment.length);
    console.log('Selected sources:', selectedSources);
    
    if (!equipment.length) return [];
    
    let filtered = equipment;
    
    // Apply source filter - ONLY if sources are explicitly selected
    if (selectedSources.length > 0) {
      filtered = filtered.filter(item => selectedSources.includes(item.document__slug));
      console.log('Filtered by source:', filtered.length);
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.type.toLowerCase().includes(searchLower) ||
        item.rarity.toLowerCase().includes(searchLower)
      );
      console.log('Filtered by search:', filtered.length);
    }
    
    // Sort the results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity':
          const rarityA = getRarityOrder(a.rarity);
          const rarityB = getRarityOrder(b.rarity);
          if (rarityA !== rarityB) {
            return rarityA - rarityB;
          }
          // If same rarity, sort alphabetically by name
          return a.name.localeCompare(b.name);
        case 'type':
          if (a.type !== b.type) {
            return a.type.localeCompare(b.type);
          }
          // If same type, sort alphabetically by name
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    console.log('Final filtered equipment:', filtered.length);
    return filtered;
  }, [equipment, selectedSources, searchTerm, sortBy]);

  // Use infinite scroll hook
  const { displayedItems: displayedEquipment, isLoading: isLoadingMore, hasMore, handleScroll } = useInfiniteScroll({
    items: filteredEquipment,
    itemsPerPage: 100
  });

  const getSourceDisplayName = (source: string) => {
    const sourceMap: Record<string, string> = {
      'wotc-srd': 'Core Rules (SRD)',
      'cc': 'Core Rules (CC)',
      'kp': 'Kobold Press',
      'xge': "Xanathar's Guide",
      'tce': "Tasha's Cauldron",
      'vgm': "Volo's Guide",
      'mtf': "Mordenkainen's Tome",
      'vom': 'Vault of Magic',
      'toh': 'Tome of Heroes',
      'a5e': 'Advanced 5th Edition',
      'taldorei': 'Tal\'Dorei Campaign Setting'
    };
    return sourceMap[source] || source.toUpperCase();
  };

  const handleSourceFilterChange = (source: string, checked: boolean) => {
    setSelectedSources(prev => 
      checked 
        ? [...prev, source]
        : prev.filter(s => s !== source)
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading equipment data..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refresh} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with search and filter */}
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            
            <Select value={sortBy} onValueChange={(value: 'name' | 'rarity' | 'type') => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rarity">Rarity</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 text-gray-900">Filter by Source</h3>
              {availableSources.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSources.map(source => (
                      <label key={source} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedSources.includes(source)}
                          onChange={(e) => handleSourceFilterChange(source, e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">{getSourceDisplayName(source)}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSources(availableSources)}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSources([])}
                    >
                      Clear All
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">No filter options available</p>
              )}
            </Card>
          )}
        </div>

        {/* Results Summary */}
        <div className="text-sm text-gray-300 mt-4">
          Showing {displayedEquipment.length} of {filteredEquipment.length} items
          {filteredEquipment.length !== equipment.length && ` (${equipment.length} total)`}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4" onScroll={handleScroll}>
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
                    onClick={() => setSelectedItem(item)}
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
                    onClick={() => setShowCharacterSelect(true)}
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

        {filteredEquipment.length === 0 && equipment.length > 0 && (
          <div className="text-center py-8">
            <p className="text-white">No equipment found matching your search.</p>
            <p className="text-xs text-gray-400 mt-2">
              Try adjusting your search terms or filter settings.
            </p>
          </div>
        )}

        {equipment.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-white">No equipment data available.</p>
            <p className="text-xs text-gray-400 mt-2">
              Equipment data may still be loading or there was an error fetching it.
            </p>
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedItem.name}</h3>
            <p className="text-gray-600 mb-2"><strong>Type:</strong> {selectedItem.type}</p>
            <p className="text-gray-600 mb-2"><strong>Rarity:</strong> <span className="capitalize">{selectedItem.rarity}</span></p>
            {selectedItem.cost && (
              <p className="text-gray-600 mb-2"><strong>Cost:</strong> {selectedItem.cost.quantity} {selectedItem.cost.unit}</p>
            )}
            {selectedItem.weight && (
              <p className="text-gray-600 mb-2"><strong>Weight:</strong> {selectedItem.weight} lb</p>
            )}
            {selectedItem.requires_attunement && (
              <p className="text-gray-600 mb-4"><strong>Requires Attunement:</strong> Yes</p>
            )}
            
            {selectedItem.desc && (
              <div className="mb-4">
                <strong className="text-gray-600">Description:</strong>
                <p className="text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: selectedItem.desc }} />
              </div>
            )}
            
            <button
              onClick={() => setSelectedItem(null)}
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

export default ItemsTab;
