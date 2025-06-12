
import { useState } from 'react';

interface Manual {
  id: string;
  title: string;
  description: string;
  category: 'core' | 'expansions' | 'homebrew';
  cover: string;
}

const ManualsTab = () => {
  const [manuals] = useState<Manual[]>([
    {
      id: '1',
      title: "Player's Handbook",
      description: "The Player's Handbook covers the basic rules of the 5e system, the base classes and races, and character customization options.",
      category: 'core',
      cover: '📖'
    },
    {
      id: '2',
      title: "Dungeon Master's Guide",
      description: "The Dungeon Master's Guide equips DMs with world-building advice, encounter design and balancing, optional rules, treasure and magic item tables, NPC and faction guidelines, and tools to customize and expand 5e.",
      category: 'core',
      cover: '📚'
    },
    {
      id: '3',
      title: "Monster Manual",
      description: "The Monster Manual compiles 5e's creature bestiaries with stat blocks, lore and ecology guides, challenge ratings, variant traits, lair actions and legendary actions—providing DMs with the tools to bring encounters to life.",
      category: 'core',
      cover: '👹'
    }
  ]);

  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);

  const coreRules = manuals.filter(m => m.category === 'core');

  return (
    <div className="p-4">
      <div className="mb-6">
        <h3 className="text-white font-bold mb-3">Core rules</h3>
        <div className="space-y-3">
          {coreRules.map((manual) => (
            <div 
              key={manual.id} 
              className="bg-white rounded-lg p-4 flex space-x-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedManual(manual)}
            >
              <div className="w-16 h-20 bg-gradient-to-b from-orange-400 to-red-600 rounded flex items-center justify-center text-2xl">
                {manual.cover}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2">{manual.title}</h4>
                <p className="text-sm text-gray-600">{manual.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedManual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedManual.title}</h3>
            <div className="w-32 h-40 bg-gradient-to-b from-orange-400 to-red-600 rounded mx-auto mb-4 flex items-center justify-center text-4xl">
              {selectedManual.cover}
            </div>
            <p className="text-gray-600 mb-6">{selectedManual.description}</p>
            <div className="space-y-3">
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg">
                Open PDF Reader
              </button>
              <button
                onClick={() => setSelectedManual(null)}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualsTab;
