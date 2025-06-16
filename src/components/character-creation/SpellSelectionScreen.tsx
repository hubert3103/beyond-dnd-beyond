
import { useState, useMemo } from 'react';
import { useOpen5eData } from '../../hooks/useOpen5eData';
import { Open5eSpell } from '../../services/open5eApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Zap } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface SpellSelectionScreenProps {
  data: any;
  onUpdate: (updates: any) => void;
}

const SpellSelectionScreen = ({ data, onUpdate }: SpellSelectionScreenProps) => {
  const { spells, isLoading, error, refresh } = useOpen5eData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpells, setSelectedSpells] = useState<Open5eSpell[]>(data.spells || []);

  // Get spellcasting info for the selected class
  const getSpellcastingInfo = () => {
    if (!data.class) return null;
    
    const className = data.class.name.toLowerCase();
    
    // Define spellcasting progression for each class
    const spellcastingInfo: Record<string, { cantripsKnown: number; spellsKnown: number; maxLevel: number; spellcastingAbility: string }> = {
      'wizard': { cantripsKnown: 3, spellsKnown: 6, maxLevel: 1, spellcastingAbility: 'Intelligence' },
      'sorcerer': { cantripsKnown: 4, spellsKnown: 2, maxLevel: 1, spellcastingAbility: 'Charisma' },
      'warlock': { cantripsKnown: 2, spellsKnown: 2, maxLevel: 1, spellcastingAbility: 'Charisma' },
      'bard': { cantripsKnown: 2, spellsKnown: 4, maxLevel: 1, spellcastingAbility: 'Charisma' },
      'cleric': { cantripsKnown: 3, spellsKnown: 2, maxLevel: 1, spellcastingAbility: 'Wisdom' },
      'druid': { cantripsKnown: 2, spellsKnown: 2, maxLevel: 1, spellcastingAbility: 'Wisdom' },
      'artificer': { cantripsKnown: 2, spellsKnown: 2, maxLevel: 1, spellcastingAbility: 'Intelligence' },
    };
    
    return spellcastingInfo[className] || null;
  };

  const spellcastingInfo = getSpellcastingInfo();

  // Filter spells for the character's class
  const availableSpells = useMemo(() => {
    if (!data.class || !spells.length) return [];
    
    const className = data.class.name.toLowerCase();
    
    return spells.filter(spell => {
      // Check if spell is available to this class
      const spellClasses = spell.classes?.map(c => c.name?.toLowerCase()) || [];
      const isAvailableToClass = spellClasses.includes(className);
      
      // Filter by search term
      const matchesSearch = !searchTerm || spell.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by level (only show cantrips and 1st level spells for level 1 characters)
      const appropriateLevel = spell.level === '0' || (spellcastingInfo && parseInt(spell.level) <= spellcastingInfo.maxLevel);
      
      return isAvailableToClass && matchesSearch && appropriateLevel;
    });
  }, [spells, data.class, searchTerm, spellcastingInfo]);

  // Group spells by level
  const spellsByLevel = useMemo(() => {
    const grouped: Record<string, Open5eSpell[]> = {};
    availableSpells.forEach(spell => {
      const level = spell.level === '0' ? 'Cantrips' : `Level ${spell.level}`;
      if (!grouped[level]) grouped[level] = [];
      grouped[level].push(spell);
    });
    return grouped;
  }, [availableSpells]);

  const getSelectedCount = (level: string) => {
    const spellLevel = level === 'Cantrips' ? '0' : level.split(' ')[1];
    return selectedSpells.filter(spell => spell.level === spellLevel).length;
  };

  const getMaxAllowed = (level: string) => {
    if (!spellcastingInfo) return 0;
    return level === 'Cantrips' ? spellcastingInfo.cantripsKnown : spellcastingInfo.spellsKnown;
  };

  const canSelectSpell = (spell: Open5eSpell) => {
    const isAlreadySelected = selectedSpells.some(s => s.slug === spell.slug);
    if (isAlreadySelected) return false;
    
    const level = spell.level === '0' ? 'Cantrips' : `Level ${spell.level}`;
    const currentCount = getSelectedCount(level);
    const maxAllowed = getMaxAllowed(level);
    
    return currentCount < maxAllowed;
  };

  const toggleSpell = (spell: Open5eSpell) => {
    const isSelected = selectedSpells.some(s => s.slug === spell.slug);
    
    let newSelection: Open5eSpell[];
    if (isSelected) {
      newSelection = selectedSpells.filter(s => s.slug !== spell.slug);
    } else {
      if (canSelectSpell(spell)) {
        newSelection = [...selectedSpells, spell];
      } else {
        return; // Can't select this spell
      }
    }
    
    setSelectedSpells(newSelection);
    onUpdate({ spells: newSelection });
  };

  if (!data.class || !data.class.spellcastingAbility) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Spell Selection</h1>
          <p className="text-gray-600">Your selected class is not a spellcaster</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading spells..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refresh} />;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Spells</h1>
        <p className="text-gray-600">Select spells for your {data.class.name}</p>
      </div>

      {spellcastingInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spellcasting Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Spellcasting Ability:</span>
                <p className="text-gray-600">{spellcastingInfo.spellcastingAbility}</p>
              </div>
              <div>
                <span className="font-medium">Cantrips Known:</span>
                <p className="text-gray-600">
                  {getSelectedCount('Cantrips')} / {spellcastingInfo.cantripsKnown}
                </p>
              </div>
              <div>
                <span className="font-medium">1st Level Spells Known:</span>
                <p className="text-gray-600">
                  {getSelectedCount('Level 1')} / {spellcastingInfo.spellsKnown}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search spells..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected Spells Summary */}
      {selectedSpells.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Spells</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedSpells.map(spell => (
                <Badge key={spell.slug} variant="secondary" className="flex items-center gap-1">
                  {spell.name}
                  <button
                    onClick={() => toggleSpell(spell)}
                    className="ml-1 text-xs hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spells by Level */}
      <div className="space-y-6">
        {Object.entries(spellsByLevel).map(([level, levelSpells]) => (
          <div key={level}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{level}</h3>
              <Badge variant="outline">
                {getSelectedCount(level)} / {getMaxAllowed(level)} selected
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {levelSpells.map(spell => {
                const isSelected = selectedSpells.some(s => s.slug === spell.slug);
                const canSelect = canSelectSpell(spell);
                
                return (
                  <Card 
                    key={spell.slug}
                    className={`cursor-pointer transition-colors ${
                      isSelected 
                        ? 'ring-2 ring-blue-600 bg-blue-50' 
                        : canSelect 
                        ? 'hover:bg-gray-50' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => toggleSpell(spell)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Zap className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{spell.name}</h4>
                          <p className="text-sm text-gray-600">{spell.school}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {spell.casting_time} • {spell.range}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="text-blue-600 font-bold">✓</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {availableSpells.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No spells found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default SpellSelectionScreen;
