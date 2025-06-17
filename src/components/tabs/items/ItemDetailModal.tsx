
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

  // Simplified and more conservative parsing for D&D item variations
  const parseItemVariations = (description: string) => {
    // Clean up HTML tags first
    const cleanDesc = description.replace(/<[^>]*>/g, '').trim();
    
    // Only try to parse variations if there are clear pipe separators with substantial content
    if (cleanDesc.includes('|')) {
      const parts = cleanDesc.split('|').map(part => part.trim());
      
      // Filter out parts that are too short or just punctuation/dashes
      const meaningfulParts = parts.filter(part => {
        // Must be at least 20 characters and contain actual words (not just dashes/punctuation)
        return part.length >= 20 && /[a-zA-Z]{3,}/.test(part);
      });
      
      // Only create variations if we have at least 2 meaningful parts
      if (meaningfulParts.length >= 2) {
        return meaningfulParts.map((part, index) => ({
          content: part.trim(),
          isVariation: true,
          title: `Variation ${index + 1}`
        }));
      }
    }
    
    // If no clear variations found, return as single description
    return [{
      content: cleanDesc,
      isVariation: false,
      title: ''
    }];
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
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 italic mb-4">
                    This item has multiple variations:
                  </p>
                  
                  <div className="space-y-4">
                    {variations.map((variation, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex items-center mb-3">
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            {variation.title}
                          </Badge>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 leading-relaxed m-0">
                            {variation.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed m-0">
                      {variations[0]?.content || 'No description available.'}
                    </p>
                  </div>
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
