
import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  type: string;
  rarity: string;
  description: string;
}

const ItemsTab = () => {
  const [items] = useState<Item[]>([
    {
      id: '1',
      name: 'Potion of Climbing',
      type: 'Potion',
      rarity: 'Common',
      description: 'When you drink this potion, you gain a climbing speed equal to your walking speed for 1 hour.'
    },
    {
      id: '2',
      name: 'Potion of Healing',
      type: 'Potion',
      rarity: 'Common',
      description: 'You regain 2d4 + 2 hit points when you drink this potion.'
    },
    {
      id: '3',
      name: 'Spell Scroll (1st Level)',
      type: 'Scroll',
      rarity: 'Common',
      description: 'A spell scroll bears the words of a single spell, written in a mystical cipher.'
    },
    {
      id: '4',
      name: 'Bag of Holding',
      type: 'Wondrous Item',
      rarity: 'Uncommon',
      description: 'This bag has an interior space considerably larger than its outside dimensions.'
    }
  ]);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);

  const groupedItems = items.reduce((acc, item) => {
    const rarity = `Rarity: ${item.rarity}`;
    if (!acc[rarity]) acc[rarity] = [];
    acc[rarity].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  return (
    <div className="p-4">
      {Object.entries(groupedItems).map(([rarity, rarityItems]) => (
        <div key={rarity} className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-bold">{rarity}</h3>
            <span className="text-white text-sm">Items: {rarityItems.length}</span>
          </div>
          <div className="space-y-2">
            {rarityItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <h4 className="font-bold text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.type}</p>
                  <p className="text-sm text-gray-600">{item.rarity}</p>
                </div>
                <button
                  onClick={() => setShowCharacterSelect(true)}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedItem.name}</h3>
            <p className="text-gray-600 mb-2"><strong>Type:</strong> {selectedItem.type}</p>
            <p className="text-gray-600 mb-4"><strong>Rarity:</strong> {selectedItem.rarity}</p>
            <p className="text-gray-600 mb-6">{selectedItem.description}</p>
            <button
              onClick={() => setSelectedItem(null)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

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
