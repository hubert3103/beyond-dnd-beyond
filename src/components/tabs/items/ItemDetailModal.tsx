
import { Open5eEquipment } from '../../../services/open5eApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ItemDetailModalProps {
  item: Open5eEquipment | null;
  onClose: () => void;
}

const ItemDetailModal = ({ item, onClose }: ItemDetailModalProps) => {
  if (!item) return null;

  // Parse item description to handle multiple variations
  const parseItemVariations = (description: string) => {
    // Check if the description contains multiple items separated by "|" or similar patterns
    const hasMultipleVariations = description.includes('|') || description.includes(' | ');
    
    if (!hasMultipleVariations) {
      return [{ content: description, isVariation: false }];
    }

    // Split by common separators and clean up
    const parts = description.split(/\s*\|\s*/).filter(part => part.trim());
    
    const variations = parts.map(part => {
      const trimmed = part.trim();
      
      // Check if this part looks like an item variation (contains rarity keywords)
      const rarityKeywords = ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'];
      const typeKeywords = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'fire', 'frost', 'storm', 'cloud', 'stone', 'hill', 'giant'];
      
      const containsRarity = rarityKeywords.some(keyword => 
        trimmed.toLowerCase().includes(keyword)
      );
      
      const containsType = typeKeywords.some(keyword => 
        trimmed.toLowerCase().includes(keyword)
      );
      
      return {
        content: trimmed,
        isVariation: containsRarity || containsType || trimmed.includes('+') || /\d+/.test(trimmed)
      };
    });

    return variations;
  };

  const variations = parseItemVariations(item.desc || '');
  const hasMultipleVariations = variations.length > 1 && variations.some(v => v.isVariation);

  const getRarityColor = (rarity: string) => {
    const rarityColors: Record<string, string> = {
      'common': 'bg-gray-100 text-gray-800 border-gray-300',
      'uncommon': 'bg-green-100 text-green-800 border-green-300',
      'rare': 'bg-blue-100 text-blue-800 border-blue-300',
      'very rare': 'bg-purple-100 text-purple-800 border-purple-300',
      'legendary': 'bg-orange-100 text-orange-800 border-orange-300',
      'artifact': 'bg-red-100 text-red-800 border-red-300'
    };
    return rarityColors[rarity.toLowerCase()] || rarityColors['common'];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{item.name}</CardTitle>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className={getRarityColor(item.rarity)}>
                    {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                  </Badge>
                  <Badge variant="secondary">
                    {item.type}
                  </Badge>
                  {item.requires_attunement && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      Requires Attunement
                    </Badge>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Item Properties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.cost && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Cost</h4>
                  <p className="text-gray-700">{item.cost.quantity} {item.cost.unit}</p>
                </div>
              )}
              
              {item.weight && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Weight</h4>
                  <p className="text-gray-700">{item.weight} lb</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-lg">Description</h4>
              
              {hasMultipleVariations ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 italic mb-4">
                    This item has multiple variations:
                  </p>
                  
                  <div className="grid gap-3">
                    {variations.map((variation, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            Variation {index + 1}
                          </Badge>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-sm">
                          {variation.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    {item.desc ? item.desc.replace(/<[^>]*>/g, '') : 'No description available.'}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Source Information */}
            <div className="flex justify-between items-center pt-2">
              <Badge variant="secondary" className="text-xs">
                Source: {item.document__slug.toUpperCase()}
              </Badge>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ItemDetailModal;
