
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import BottomNavigation from '../components/BottomNavigation';
import CharacterSummary from '../components/character-sheet/CharacterSummary';
import AbilitiesSection from '../components/character-sheet/AbilitiesSection';
import SavingThrowsSkills from '../components/character-sheet/SavingThrowsSkills';
import PassiveScoresDefenses from '../components/character-sheet/PassiveScoresDefenses';
import HitPointsHitDice from '../components/character-sheet/HitPointsHitDice';
import AttacksSpellcasting from '../components/character-sheet/AttacksSpellcasting';
import EquipmentSection from '../components/character-sheet/EquipmentSection';
import SpellsSection from '../components/character-sheet/SpellsSection';
import FeaturesTraits from '../components/character-sheet/FeaturesTraits';
import CurrencyNotes from '../components/character-sheet/CurrencyNotes';
import { TabType } from './PlayerDashboard';

const CharacterSheet = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>('characters');

  // Mock character data - in real app, this would come from an API/context
  const [character, setCharacter] = useState({
    id: id || '1',
    name: 'Thalara Brightbranch',
    level: 10,
    class: 'Druid',
    race: 'Wood elf',
    avatar: '/avatarPlaceholder.svg',
    currentHP: 78,
    maxHP: 85,
    tempHP: 0,
    proficiencyBonus: 4,
    abilities: {
      strength: { score: 12, modifier: 1, proficient: false },
      dexterity: { score: 16, modifier: 3, proficient: true },
      constitution: { score: 14, modifier: 2, proficient: false },
      intelligence: { score: 13, modifier: 1, proficient: false },
      wisdom: { score: 18, modifier: 4, proficient: true },
      charisma: { score: 10, modifier: 0, proficient: false }
    },
    armorClass: 16,
    initiative: 3,
    speed: 30
  });

  const handleBack = () => {
    navigate('/player');
  };

  const handleOverflowAction = (action: string) => {
    switch (action) {
      case 'share':
        console.log('Share character');
        break;
      case 'delete':
        console.log('Delete character');
        break;
      case 'export':
        console.log('Export PDF');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-[#4a4a4a] flex flex-col">
      {/* Top Bar */}
      <header className="bg-[#3a3a3a] p-4 flex items-center justify-between sticky top-0 z-20 border-b border-gray-600">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-white hover:bg-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <img 
              src={character.avatar} 
              alt="Character avatar"
              className="w-6 h-6"
              style={{
                filter: 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)'
              }}
            />
          </div>
        </div>

        <h1 className="text-white font-bold text-lg flex-1 text-center">{character.name}</h1>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-600"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white">
            <DropdownMenuItem onClick={() => handleOverflowAction('share')}>
              Share Character
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOverflowAction('export')}>
              Export PDF
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleOverflowAction('delete')}
              className="text-red-600"
            >
              Delete Character
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto pb-20 px-4 space-y-4">
        <CharacterSummary character={character} setCharacter={setCharacter} />
        <AbilitiesSection character={character} setCharacter={setCharacter} />
        <SavingThrowsSkills character={character} />
        <PassiveScoresDefenses character={character} setCharacter={setCharacter} />
        <HitPointsHitDice character={character} setCharacter={setCharacter} />
        <AttacksSpellcasting />
        <EquipmentSection />
        <SpellsSection />
        <FeaturesTraits />
        <CurrencyNotes />
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default CharacterSheet;
