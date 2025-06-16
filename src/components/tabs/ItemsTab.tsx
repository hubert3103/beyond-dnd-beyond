
import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOpen5eData } from '../../hooks/useOpen5eData';
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

  const getRarityOrder = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 1;
      case 'uncommon': return 2;
      case 'rare': return 3;
      case 'very rare': return 4;
      case 'legendary': return 5;
      case 'artifact': return 6;
      default: return 0;
    }
  };

  const filteredEquipment = useMemo(() => {
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
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.rarity.toLowerCase().includes(searchTerm.toLowerCase())
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
          return rarityA - rarityB;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
    
    console.log('Final filtered equipment:', filtered.length);
    return filtered;
  }, [equipment, selectedSources, searchTerm, sortBy]);

  const availableSources = useMemo(() => {
    const sources = open5eApi.getAvailableSources(equipment);
    console.log('Available sources:', sources);
    return sources;
  }, [equipment]);

  const getSourceDisplayName = (source: string) => {
    switch (source) {
      case 'wotc-srd': return 'Core Rules (SRD)';
      case 'cc': return 'Core Rules (CC)';
      case 'kp': return 'Kobold Press';
      case 'xge': return "Xanathar's Guide";
      case 'tce': return "Tasha's Cauldron";
      case 'vgm': return "Volo's Guide";
      case 'mtf': return "Mordenkainen's Tome";
      default: return source.toUpperCase();
    }
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
    <div className="p-4 space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Equipment & Items</h1>
        <p className="text-gray-300">Browse equipment from D&D 5e sources</p>
      </div>

      {/* Debug info */}
      <div className="text-sm text-gray-300 bg-gray-700 p-2 rounded">
        Debug: {equipment.length} total equipment, {filteredEquipment.length} after filtering
        <br />
        Available sources: {availableSources.join(', ')}
        <br />
        Selected sources: {selectedSources.join(', ') || 'none'}
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
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
      <div className="text-sm text-gray-300">
        Showing {filteredEquipment.length} of {equipment.length} items
      </div>

      {/* Equipment List */}
      <div className="space-y-2">
        {filteredEquipment.map((item) => (
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
                  <p className="text-sm text-gray-600">{item.rarity}</p>
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

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedItem.name}</h3>
            <p className="text-gray-600 mb-2"><strong>Type:</strong> {selectedItem.type}</p>
            <p className="text-gray-600 mb-2"><strong>Rarity:</strong> {selectedItem.rarity}</p>
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
