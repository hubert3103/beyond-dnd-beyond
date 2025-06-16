
import { useState } from 'react';
import { useOpen5eData } from '../../hooks/useOpen5eData';
import { Open5eSpell } from '../../services/open5eApi';
import LoadingSpinner from '../character-creation/LoadingSpinner';
import ErrorMessage from '../character-creation/ErrorMessage';
import SpellsHeader from './spells/SpellsHeader';
import SpellsList from './spells/SpellsList';
import SpellDetailModal from './spells/SpellDetailModal';
import CharacterSelectModal from './spells/CharacterSelectModal';

const SpellsTab = () => {
  const { spells, isLoading, error, refresh } = useOpen5eData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpell, setSelectedSpell] = useState<Open5eSpell | null>(null);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [spellToAdd, setSpellToAdd] = useState<Open5eSpell | null>(null);
  const [filters, setFilters] = useState({
    levels: [] as string[],
    schools: [] as string[],
    classes: [] as string[],
  });

  const handleFilterChange = (filterType: keyof typeof filters, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked 
        ? [...prev[filterType], value]
        : prev[filterType].filter(item => item !== value)
    }));
  };

  const clearFilters = () => {
    setFilters({ levels: [], schools: [], classes: [] });
  };

  const handleAddToCharacter = (spell: Open5eSpell) => {
    setSpellToAdd(spell);
    setShowCharacterSelect(true);
  };

  const handleCloseCharacterSelect = () => {
    setShowCharacterSelect(false);
    setSpellToAdd(null);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading spells..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refresh} />;
  }

  return (
    <div className="flex flex-col h-full">
      <SpellsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        spells={spells}
      />

      <SpellsList
        spells={spells}
        searchTerm={searchTerm}
        filters={filters}
        onSpellSelect={setSelectedSpell}
        onAddToCharacter={handleAddToCharacter}
      />

      {selectedSpell && (
        <SpellDetailModal
          spell={selectedSpell}
          onClose={() => setSelectedSpell(null)}
        />
      )}

      {showCharacterSelect && (
        <CharacterSelectModal
          onClose={handleCloseCharacterSelect}
          selectedSpell={spellToAdd}
        />
      )}
    </div>
  );
};

export default SpellsTab;
