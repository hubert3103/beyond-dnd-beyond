
import { Open5eSpell } from '../../services/open5eApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SpellSelectionModalProps {
  spell: Open5eSpell;
  onClose: () => void;
  onToggleSpell: (spell: Open5eSpell) => void;
  isSelected: boolean;
  canSelect: boolean;
}

const SpellSelectionModal = ({ 
  spell, 
  onClose, 
  onToggleSpell, 
  isSelected, 
  canSelect 
}: SpellSelectionModalProps) => {
  const getSpellComponents = (spell: Open5eSpell) => {
    return spell.components || '';
  };

  const getSpellLevel = () => {
    if (spell.level === '0' || spell.level.toLowerCase().includes('cantrip')) {
      return 'Cantrip';
    }
    const levelMatch = spell.level.match(/(\d+)/);
    const levelNum = levelMatch ? parseInt(levelMatch[1]) : 1;
    return `Level ${levelNum}`;
  };

  const handleToggleSpell = () => {
    onToggleSpell(spell);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">{spell.name}</h3>
          {isSelected && (
            <Badge variant="default" className="ml-2">Selected</Badge>
          )}
        </div>
        
        <div className="space-y-2 mb-4">
          <p className="text-gray-600">
            <strong>Level:</strong> {getSpellLevel()}
          </p>
          <p className="text-gray-600"><strong>School:</strong> {spell.school}</p>
          <p className="text-gray-600"><strong>Casting Time:</strong> {spell.casting_time}</p>
          <p className="text-gray-600"><strong>Range:</strong> {spell.range}</p>
          <p className="text-gray-600"><strong>Duration:</strong> {spell.duration}</p>
          <p className="text-gray-600"><strong>Components:</strong> {getSpellComponents(spell)}</p>
          {spell.material && (
            <p className="text-gray-600"><strong>Materials:</strong> {spell.material}</p>
          )}
          {spell.concentration && (
            <p className="text-gray-600"><strong>Concentration:</strong> Yes</p>
          )}
          {spell.ritual && (
            <p className="text-gray-600"><strong>Ritual:</strong> Yes</p>
          )}
        </div>
        
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
          <p className="text-gray-600 whitespace-pre-wrap">{spell.desc}</p>
          {spell.higher_level && (
            <div className="mt-4">
              <strong className="text-gray-900">At Higher Levels:</strong>
              <p className="text-gray-600">{spell.higher_level}</p>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleToggleSpell}
            disabled={!isSelected && !canSelect}
            className={`flex-1 ${
              isSelected 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSelected ? 'Remove Spell' : 'Select Spell'}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SpellSelectionModal;
