
import { useState } from 'react';

interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  type: string;
  description: string;
}

const SpellsTab = () => {
  const [spells] = useState<Spell[]>([
    {
      id: '1',
      name: 'Acid Splash',
      level: 0,
      school: 'Conjuration',
      type: 'Cantrip',
      description: 'You hurl a bubble of acid...'
    },
    {
      id: '2',
      name: 'Blade Ward',
      level: 0,
      school: 'Abjuration',
      type: 'Cantrip',
      description: 'You extend your hand and trace...'
    },
    {
      id: '3',
      name: 'Booming Blade',
      level: 0,
      school: 'Evocation',
      type: 'Cantrip',
      description: 'As part of the action used to cast this spell...'
    }
  ]);

  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);

  const groupedSpells = spells.reduce((acc, spell) => {
    const level = `Level: ${spell.level}`;
    if (!acc[level]) acc[level] = [];
    acc[level].push(spell);
    return acc;
  }, {} as Record<string, Spell[]>);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-white font-medium">Spells: {spells.length}</span>
      </div>

      {Object.entries(groupedSpells).map(([level, levelSpells]) => (
        <div key={level} className="mb-6">
          <h3 className="text-white font-bold mb-3">{level}</h3>
          <div className="space-y-2">
            {levelSpells.map((spell) => (
              <div key={spell.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => setSelectedSpell(spell)}
                >
                  <h4 className="font-bold text-gray-900">{spell.name}</h4>
                  <p className="text-sm text-gray-600">{spell.school}</p>
                  <p className="text-sm text-gray-600">{spell.type}</p>
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

      {selectedSpell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedSpell.name}</h3>
            <p className="text-gray-600 mb-2"><strong>Level:</strong> {selectedSpell.level}</p>
            <p className="text-gray-600 mb-2"><strong>School:</strong> {selectedSpell.school}</p>
            <p className="text-gray-600 mb-4"><strong>Type:</strong> {selectedSpell.type}</p>
            <p className="text-gray-600 mb-6">{selectedSpell.description}</p>
            <button
              onClick={() => setSelectedSpell(null)}
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

export default SpellsTab;
