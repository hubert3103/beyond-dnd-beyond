
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Loader2 } from 'lucide-react';
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
import { useCharacters } from '@/hooks/useCharacters';
import { useToast } from '@/hooks/use-toast';

const CharacterSheet = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getCharacter, deleteCharacter } = useCharacters();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('characters');
  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCharacter = async () => {
      if (!id) {
        navigate('/player');
        return;
      }

      try {
        setLoading(true);
        const characterData = await getCharacter(id);
        
        if (characterData) {
          // Convert database character to the format expected by the character sheet
          const formattedCharacter = {
            id: characterData.id,
            name: characterData.name,
            level: characterData.level,
            class: characterData.class_name || 'Unknown',
            race: characterData.species_name || 'Unknown',
            avatar: '/avatarPlaceholder.svg',
            currentHP: characterData.hit_points?.current || 78,
            maxHP: characterData.hit_points?.max || 85,
            tempHP: characterData.hit_points?.temporary || 0,
            proficiencyBonus: Math.ceil(characterData.level / 4) + 1,
            abilities: {
              strength: { 
                score: characterData.abilities?.str?.total || 10, 
                modifier: Math.floor((characterData.abilities?.str?.total || 10 - 10) / 2), 
                proficient: false 
              },
              dexterity: { 
                score: characterData.abilities?.dex?.total || 10, 
                modifier: Math.floor((characterData.abilities?.dex?.total || 10 - 10) / 2), 
                proficient: true 
              },
              constitution: { 
                score: characterData.abilities?.con?.total || 10, 
                modifier: Math.floor((characterData.abilities?.con?.total || 10 - 10) / 2), 
                proficient: false 
              },
              intelligence: { 
                score: characterData.abilities?.int?.total || 10, 
                modifier: Math.floor((characterData.abilities?.int?.total || 10 - 10) / 2), 
                proficient: false 
              },
              wisdom: { 
                score: characterData.abilities?.wis?.total || 10, 
                modifier: Math.floor((characterData.abilities?.wis?.total || 10 - 10) / 2), 
                proficient: true 
              },
              charisma: { 
                score: characterData.abilities?.cha?.total || 10, 
                modifier: Math.floor((characterData.abilities?.cha?.total || 10 - 10) / 2), 
                proficient: false 
              }
            },
            armorClass: 16,
            initiative: Math.floor((characterData.abilities?.dex?.total || 10 - 10) / 2),
            speed: 30
          };
          
          setCharacter(formattedCharacter);
        } else {
          toast({
            title: "Error",
            description: "Character not found",
            variant: "destructive",
          });
          navigate('/player');
        }
      } catch (error) {
        console.error('Error loading character:', error);
        toast({
          title: "Error",
          description: "Failed to load character",
          variant: "destructive",
        });
        navigate('/player');
      } finally {
        setLoading(false);
      }
    };

    loadCharacter();
  }, [id, getCharacter, navigate, toast]);

  const handleBack = () => {
    navigate('/player');
  };

  const handleOverflowAction = async (action: string) => {
    switch (action) {
      case 'share':
        console.log('Share character');
        break;
      case 'delete':
        if (character?.id) {
          await deleteCharacter(character.id);
          navigate('/player');
        }
        break;
      case 'export':
        console.log('Export PDF');
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#4a4a4a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Loading character...</p>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-[#4a4a4a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Character not found</p>
          <Button onClick={handleBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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
