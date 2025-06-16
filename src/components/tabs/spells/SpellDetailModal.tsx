
import { Open5eSpell } from '../../../services/open5eApi';

interface SpellDetailModalProps {
  spell: Open5eSpell;
  onClose: () => void;
}

const SpellDetailModal = ({ spell, onClose }: SpellDetailModalProps) => {
  const getSpellComponents = (spell: Open5eSpell) => {
    return spell.components || '';
  };

  const getSpellClasses = (spell: Open5eSpell) => {
    if (!spell.classes || !Array.isArray(spell.classes)) {
      return '';
    }
    return spell.classes
      .map(cls => cls?.name || '')
      .filter(name => name.length > 0)
      .join(', ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{spell.name}</h3>
        <div className="space-y-2 mb-4">
          <p className="text-gray-600">
            <strong>Level:</strong> {spell.level === '0' ? 'Cantrip' : spell.level}
          </p>
          <p className="text-gray-600"><strong>School:</strong> {spell.school}</p>
          <p className="text-gray-600"><strong>Casting Time:</strong> {spell.casting_time}</p>
          <p className="text-gray-600"><strong>Range:</strong> {spell.range}</p>
          <p className="text-gray-600"><strong>Duration:</strong> {spell.duration}</p>
          <p className="text-gray-600"><strong>Components:</strong> {getSpellComponents(spell)}</p>
          {spell.material && (
            <p className="text-gray-600"><strong>Materials:</strong> {spell.material}</p>
          )}
          {spell.classes && Array.isArray(spell.classes) && spell.classes.length > 0 && (
            <p className="text-gray-600">
              <strong>Classes:</strong> {getSpellClasses(spell)}
            </p>
          )}
          {spell.concentration && (
            <p className="text-gray-600"><strong>Concentration:</strong> Yes</p>
          )}
          {spell.ritual && (
            <p className="text-gray-600"><strong>Ritual:</strong> Yes</p>
          )}
        </div>
        <div className="mb-6">
          <p className="text-gray-600 whitespace-pre-wrap">{spell.desc}</p>
          {spell.higher_level && (
            <div className="mt-4">
              <strong className="text-gray-900">At Higher Levels:</strong>
              <p className="text-gray-600">{spell.higher_level}</p>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SpellDetailModal;
