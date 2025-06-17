import { useState, useMemo } from 'react';
import { useHybridData } from '../../hooks/useHybridData';
import { Open5eSpell } from '../../services/open5eApi';
import SpellsHeader from './spells/SpellsHeader';
import SpellsList from './spells/SpellsList';
import SpellDetailModal from './spells/SpellDetailModal';
import CharacterSelectModal from './spells/CharacterSelectModal';
import { useCharacters } from '../../hooks/useCharacters';
import { useToast } from '@/hooks/use-toast';

const SpellsTab = () => {
  const { spells, isLoading, error } = useHybridData();
  const { characters, updateCharacter } = useCharacters();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpell, setSelectedSpell] = useState<Open5eSpell | null>(null);
  const [filters, setFilters] = useState({
    levels: [] as string[],
    schools: [] as string[],
    classes: [] as string[]
  });
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [spellToAdd, setSpellToAdd] = useState<Open5eSpell | null>(null);

  const levelOptions = useMemo(() => {
    const levels = new Set<string>();
    spells.forEach(spell => levels.add(spell.level));
    return Array.from(levels).sort((a, b) => {
      const numA = a === '0' ? -1 : parseInt(a);
      const numB = b === '0' ? -1 : parseInt(b);
      return numA - numB;
    });
  }, [spells]);

  const schoolOptions = useMemo(() => {
    const schools = new Set<string>();
    spells.forEach(spell => schools.add(spell.school));
    return Array.from(schools).sort();
  }, [spells]);

  const classOptions = useMemo(() => {
    const classes = new Set<string>();
    spells.forEach(spell => {
      if (Array.isArray(spell.classes)) {
        spell.classes.forEach(cls => {
          if (cls?.name) {
            classes.add(cls.name);
          }
        });
      }
    });
    return Array.from(classes).sort();
  }, [spells]);

  const handleAddToCharacter = (spell: Open5eSpell) => {
    if (characters.length === 0) {
      toast({
        title: "No Characters",
        description: "Create a character first to add spells",
        variant: "destructive",
      });
      return;
    }

    if (characters.length === 1) {
      addSpellToCharacter(characters[0].id, spell);
    } else {
      setSpellToAdd(spell);
      setShowCharacterSelect(true);
    }
  };

  const addSpellToCharacter = async (characterId: string, spell: Open5eSpell) => {
    try {
      const character = characters.find(c => c.id === characterId);
      if (!character) return;

      const currentSpells = character.spells || [];
      const spellExists = currentSpells.some((s: any) => s.slug === spell.slug);
      
      if (spellExists) {
        toast({
          title: "Spell Already Known",
          description: `${character.name} already knows ${spell.name}`,
          variant: "destructive",
        });
        return;
      }

      const updatedSpells = [...currentSpells, spell];
      await updateCharacter(characterId, { spells: updatedSpells });
      
      toast({
        title: "Spell Added",
        description: `${spell.name} added to ${character.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add spell to character",
        variant: "destructive",
      });
    }
  };

  const handleCharacterSelect = async (characterId: string) => {
    if (spellToAdd) {
      await addSpellToCharacter(characterId, spellToAdd);
      setSpellToAdd(null);
      setShowCharacterSelect(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-[#1a1a1a] text-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Error Loading Spells</h2>
            <p>{error}</p>
            <p className="text-sm text-gray-400 mt-2">Using hybrid data service</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] text-white">
      <SpellsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFiltersChange={setFilters}
        levelOptions={levelOptions}
        schoolOptions={schoolOptions}
        classOptions={classOptions}
        isLoading={isLoading}
        totalSpells={spells.length}
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
          onAddToCharacter={handleAddToCharacter}
        />
      )}

      {showCharacterSelect && (
        <CharacterSelectModal
          characters={characters}
          onSelect={handleCharacterSelect}
          onClose={() => setShowCharacterSelect(false)}
          itemName={spellToAdd?.name || ''}
        />
      )}
    </div>
  );
};

export default SpellsTab;
