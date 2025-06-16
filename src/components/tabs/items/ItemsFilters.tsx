
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ItemsFiltersProps {
  availableSources: string[];
  selectedSources: string[];
  onSourceFilterChange: (source: string, checked: boolean) => void;
}

const ItemsFilters = ({
  availableSources,
  selectedSources,
  onSourceFilterChange
}: ItemsFiltersProps) => {
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

  return (
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
                  onChange={(e) => onSourceFilterChange(source, e.target.checked)}
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
              onClick={() => availableSources.forEach(source => onSourceFilterChange(source, true))}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedSources.forEach(source => onSourceFilterChange(source, false))}
            >
              Clear All
            </Button>
          </div>
        </>
      ) : (
        <p className="text-gray-500">No filter options available</p>
      )}
    </Card>
  );
};

export default ItemsFilters;
